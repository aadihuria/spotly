import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const spots = await prisma.studySpot.findMany({
    include: { images: true, reviews: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ spots });
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
      latitude: body.latitude ?? 0,
      longitude: body.longitude ?? 0,
      tags: body.tags ?? [],
      features: body.features ?? [],
      amenities: body.amenities ?? [],
      hoursJson: body.hours ?? {},
      price: body.price ?? 'Free',
      status: body.status ?? 'Open',
      currentOccupancy: body.currentOccupancy ?? 'Light',
      uploadedById: session.user.id,
    },
  });
  return NextResponse.json({ spot }, { status: 201 });
}
