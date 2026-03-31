import type { PrismaClient } from '@prisma/client';
import { ANN_ARBOR_SPOTS } from '@/data/spots';

function mapPrice(priceLevel: string) {
  if (priceLevel === '$') return 'DOLLAR';
  if (priceLevel === '$$') return 'DOUBLE_DOLLAR';
  if (priceLevel === '$$$') return 'TRIPLE_DOLLAR';
  return 'Free';
}

function mapOccupancy(crowdLevel: string) {
  const normalized = crowdLevel.toLowerCase();
  if (normalized.includes('full') || normalized.includes('always busy')) return 'Full';
  if (normalized.includes('busy') || normalized.includes('crowded')) return 'Busy';
  if (normalized.includes('moderate') || normalized.includes('varies')) return 'Moderate';
  return 'Light';
}

export function findStaticSpot(id: string) {
  return ANN_ARBOR_SPOTS.find((spot) => spot.id === id) ?? null;
}

export async function ensureStaticSpotExists(prisma: PrismaClient, id: string, uploadedById?: string) {
  const existing = await prisma.studySpot.findUnique({
    where: { id },
    include: { images: true, reviews: true },
  });
  if (existing) return existing;

  const fallback = findStaticSpot(id);
  if (!fallback) return null;

  let ownerId = uploadedById;
  if (!ownerId) {
    const firstUser = await prisma.user.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
    ownerId = firstUser?.id;
  }
  if (!ownerId) return null;

  return prisma.studySpot.create({
    data: {
      id: fallback.id,
      name: fallback.name,
      description: `${fallback.atmosphere}. ${fallback.hours}. Added by ${fallback.added_by}.`,
      address: fallback.address,
      latitude: fallback.lat,
      longitude: fallback.lng,
      tags: fallback.tags,
      features: [fallback.wifi_strength, fallback.noise_level, fallback.outlets, fallback.seating].filter(Boolean),
      amenities: [fallback.location, fallback.atmosphere].filter(Boolean),
      hoursJson: { summary: fallback.hours },
      price: mapPrice(fallback.price_level) as any,
      status: 'Open',
      currentOccupancy: mapOccupancy(fallback.crowd_level) as any,
      verified: true,
      uploadedById: ownerId,
      images: {
        create: fallback.photos.map((url) => ({
          url,
          uploadedById: ownerId!,
        })),
      },
    },
    include: { images: true, reviews: true },
  });
}

export async function ensureSeedSpots(prisma: PrismaClient) {
  const count = await prisma.studySpot.count();
  if (count > 0) return;

  const firstUser = await prisma.user.findFirst({ select: { id: true }, orderBy: { createdAt: 'asc' } });
  if (!firstUser) return;

  for (const spot of ANN_ARBOR_SPOTS) {
    await ensureStaticSpotExists(prisma, spot.id, firstUser.id);
  }
}
