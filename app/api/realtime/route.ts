import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, note: 'Realtime auth endpoint placeholder (for private channels).' });
}
