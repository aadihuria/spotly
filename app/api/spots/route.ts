import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { ensureSeedSpots } from '@/lib/static-spots';

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
  createdAt: Date;
  images: { url: string }[];
  reviews: { rating: number }[];
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
    location: spot.address.split(',')[0] || 'Campus',
    address: spot.address,
    lat: spot.latitude,
    lng: spot.longitude,
    rating: avgRating,
    total_reviews: spot.reviews.length,
    price_level: spot.price,
    tags,
    image,
    photos: spot.images.map((item) => item.url),
    atmosphere: spot.description || 'Study spot',
    crowd_level: spot.currentOccupancy,
    hours: 'Hours available in app',
    wifi_strength: 'Unknown',
    noise_level: 'Unknown',
    outlets: 'Unknown',
    seating: 'Unknown',
    added_by: 'Spotly User',
  };
}

export async function GET() {
  await ensureSeedSpots(prisma);
  const spots = await prisma.studySpot.findMany({
    include: { images: true, reviews: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ spots: spots.map(serializeSpot) });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const spot = await prisma.studySpot.create({
    data: {
      name: body.name,
      description: body.description,
      address: body.address,
      latitude: Number(body.latitude ?? 0),
      longitude: Number(body.longitude ?? 0),
      tags: Array.isArray(body.tags) ? body.tags : [],
      features: Array.isArray(body.features) ? body.features : [],
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      hoursJson: body.hours ?? {},
      price: body.price ?? 'Free',
      status: body.status ?? 'Open',
      currentOccupancy: body.currentOccupancy ?? 'Light',
      uploadedById: session.user.id,
    },
    include: { images: true, reviews: true },
  });

  return NextResponse.json({ spot: serializeSpot(spot) }, { status: 201 });
}
