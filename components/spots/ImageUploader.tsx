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

  return (
    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-[#2563EB] dark:border-blue-700 dark:bg-slate-800 dark:text-blue-300">
      <input
        aria-label="Upload image"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={loading}
        className="hidden"
      />
      {loading ? 'Uploading...' : 'Upload a new photo'}
    </label>
  );
}
