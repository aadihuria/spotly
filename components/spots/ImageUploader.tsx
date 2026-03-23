'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/uploadImage';

export function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [loading, setLoading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const url = await uploadImage(file);
    onUploaded(url);
    setLoading(false);
  }

  return <input aria-label="Upload image" type="file" accept="image/*" onChange={onFileChange} disabled={loading} />;
}
