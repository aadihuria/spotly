import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [user, allGroups, pastReviews] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { interests: true, major: true, bio: true, university: true },
    }),
    prisma.studyGroup.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      select: { text: true, goodFor: true, spot: { select: { tags: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  if (!user) return NextResponse.json({ matches: [] });

  const unjoined = allGroups.filter(
    (g) => !g.members.some((m) => m.userId === session.user.id)
  );

  if (unjoined.length === 0) return NextResponse.json({ matches: [] });

  const capped = unjoined.slice(0, 15);
  const groupSummaries = capped.map((g, i) => ({
    index: i,
    name: g.name,
    description: g.description,
    type: g.type,
    course: g.course ?? null,
    subject: g.subject ?? null,
    interests: g.interests,
    memberCount: g.members.length,
  }));

  const activityTags = [...new Set(pastReviews.flatMap((r) => [...r.spot.tags, ...r.goodFor]))].slice(0, 10);

  const prompt = `You are a study group matching engine for a campus app.

User profile:
- Major: ${user.major ?? 'Unknown'}
- Interests: ${user.interests.length > 0 ? user.interests.join(', ') : 'Not specified'}
- Bio: ${user.bio ?? 'Not provided'}
- University: ${user.university}
- Study activity tags from their reviews: ${activityTags.length > 0 ? activityTags.join(', ') : 'None yet'}

Available groups (JSON):
${JSON.stringify(groupSummaries, null, 2)}

Pick the top 3 groups this user would most benefit from joining. Return ONLY a raw JSON array using the "index" field from above, no wrapper object, no extra text:
[
  { "index": 0, "reason": "<one short sentence why this group is a great match>" }
]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });

    const raw = (completion.choices[0]?.message?.content ?? '[]').trim();
    const match = raw.match(/\[[\s\S]*\]/);
    const picks: Array<{ index: number; reason: string }> = match ? JSON.parse(match[0]) : [];

    const result = picks
      .filter((p) => typeof p.index === 'number' && p.index >= 0 && p.index < capped.length)
      .map((p) => {
        const g = capped[p.index];
        return {
          id: g.id,
          name: g.name,
          description: g.description,
          memberCount: g.members.length,
          type: g.type,
          reason: p.reason,
        };
      });

    return NextResponse.json({ matches: result });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
