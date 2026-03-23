'use client';

import { useState } from 'react';
import { ImageUploader } from './ImageUploader';

export function AddSpotWizard() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-sm text-white/70">Step {step} of 4</p>
      {step === 2 ? <ImageUploader onUploaded={(url) => setImages((prev) => [...prev, url])} /> : null}
      {images.length ? <p className="mt-2 text-xs">Uploaded {images.length} images</p> : null}
      <button className="btn-glow mt-4" onClick={() => setStep((s) => Math.min(s + 1, 4))}>Next</button>
    </div>
  );
}
