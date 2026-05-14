import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { openai } from '@/lib/openai';
import { ensureSeedSpots } from '@/lib/static-spots';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await ensureSeedSpots(prisma);

  const [user, spots, pastReviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { interests: true, major: true, bio: true, university: true },
    }),
    prisma.studySpot.findMany({
      take: 20,
      include: { images: true, reviews: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      select: { text: true, rating: true, goodFor: true, spot: { select: { name: true, tags: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  if (!user || spots.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  const spotSummaries = spots.map((s, i) => ({
    index: i,
    name: s.name,
    description: s.description,
    tags: [...s.tags, ...s.features, ...s.amenities],
    rating:
      s.reviews.length > 0
        ? (s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length).toFixed(1)
        : '0',
  }));

  const reviewSummary = pastReviews.length > 0
    ? pastReviews.map((r) => `- ${r.spot.name} (${r.rating}/5): "${r.text.slice(0, 80)}" [liked for: ${r.goodFor.join(', ') || 'general'}]`).join('\n')
    : 'No previous reviews yet.';

  const prompt = `You are a study spot recommendation engine for a campus app.

User profile:
- Major: ${user.major ?? 'Unknown'}
- Interests: ${user.interests.length > 0 ? user.interests.join(', ') : 'Not specified'}
- Bio: ${user.bio ?? 'Not provided'}
- University: ${user.university}
- Past reviews (recent activity):
${reviewSummary}

Study spots available (JSON):
${JSON.stringify(spotSummaries, null, 2)}

Pick the top 4 spots that best match this user's profile and study style. Return ONLY a raw JSON array using the "index" field from above, no wrapper object, no extra text:
[
  { "index": 0, "reason": "<one short sentence why this spot fits them>" }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });

    const raw = (completion.choices[0]?.message?.content ?? '[]').trim();
    const match = raw.match(/\[[\s\S]*\]/);
    const picks: Array<{ index: number; reason: string }> = match ? JSON.parse(match[0]) : [];

    const result = picks
      .filter((p) => typeof p.index === 'number' && p.index >= 0 && p.index < spots.length)
      .map((p) => {
        const s = spots[p.index];
        const image = s.images[0]?.url ?? 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800';
        const avgRating =
          s.reviews.length > 0
            ? Number((s.reviews.reduce((sum, rev) => sum + rev.rating, 0) / s.reviews.length).toFixed(1))
            : 0;
        return {
          id: s.id,
          name: s.name,
          address: s.address,
          image,
          rating: avgRating,
          tags: [...s.tags, ...s.features, ...s.amenities].slice(0, 3),
          reason: p.reason,
        };
      });

    return NextResponse.json({ recommendations: result });
  } catch {
    return NextResponse.json({ recommendations: [] });
  }
}
