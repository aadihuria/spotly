import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { ensureStaticSpotExists } from '@/lib/static-spots';

function serializeReview(review: {
  id: string;
  rating: number;
  text: string;
  liked: string | null;
  disliked: string | null;
  images: string[];
  reaction: string | null;
  spotType: string | null;
  goodFor: string[];
  taggedPeople: string[];
  visitDate: Date | null;
  createdAt: Date;
  user: { username: string; displayName: string | null; avatar: string | null };
}) {
  return {
    id: review.id,
    username: review.user.username,
    user: review.user.displayName ?? review.user.username,
    avatar: review.user.avatar,
    rating: review.rating,
    comment: review.text,
    liked: review.liked,
    disliked: review.disliked,
    photos: review.images,
    reaction: review.reaction,
    spotType: review.spotType,
    goodFor: review.goodFor,
    taggedPeople: review.taggedPeople,
    visitDate: review.visitDate ? review.visitDate.toISOString().slice(0, 10) : '',
    date: review.createdAt.toISOString(),
  };
}

function serializeSpot(spot: {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  tags: string[];
  features: string[];
  amenities: string[];
  price: string;
  status: string;
  currentOccupancy: string;
  images: { url: string }[];
  reviews: {
    id: string;
    rating: number;
    text: string;
    liked: string | null;
    disliked: string | null;
    images: string[];
    reaction: string | null;
    spotType: string | null;
    goodFor: string[];
    taggedPeople: string[];
    visitDate: Date | null;
    createdAt: Date;
    user: { username: string; displayName: string | null; avatar: string | null };
  }[];
}) {
  const image = spot.images[0]?.url || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800';
  const avgRating =
    spot.reviews.length > 0
      ? Number((spot.reviews.reduce((sum, review) => sum + review.rating, 0) / spot.reviews.length).toFixed(1))
      : 0;
  const tags = Array.from(new Set([...spot.tags, ...spot.features, ...spot.amenities].filter(Boolean)));

  return {
    id: spot.id,
    name: spot.name,
    description: spot.description,
    address: spot.address,
    lat: spot.latitude,
    lng: spot.longitude,
    rating: avgRating,
    total_reviews: spot.reviews.length,
    tags,
    image,
    photos: spot.images.map((item) => item.url),
    crowd_level: spot.currentOccupancy,
    hours: 'Hours available in app',
    reviews: spot.reviews.map(serializeReview),
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spot =
    (await prisma.studySpot.findUnique({
      where: { id },
      include: {
        images: true,
        reviews: {
          include: {
            user: {
              select: { username: true, displayName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })) ??
    (await ensureStaticSpotExists(prisma, id));

  if (!spot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ spot: serializeSpot(spot) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const spot = await prisma.studySpot.update({ where: { id }, data: body });
  return NextResponse.json({ spot });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.studySpot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
