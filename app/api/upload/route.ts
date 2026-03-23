import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'File required' }, { status: 400 });
  }

  // Placeholder implementation for Supabase Storage/Cloudinary.
  // In production, upload file bytes to your provider and return the URL.
  const fakeUrl = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&sig=${Date.now()}`;
  return NextResponse.json({ url: fakeUrl });
}
