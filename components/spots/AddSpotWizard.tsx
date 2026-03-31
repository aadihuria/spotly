'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ANN_ARBOR_SPOTS } from '@/data/spots';
import { ImageUploader } from './ImageUploader';

const categories = ['Building', 'Coffee Shop', 'Library', 'Other'];
const goodForOptions = ['Quiet', 'Loud', 'Collaborative', 'Solo Study', 'Group Study', 'WiFi', 'Outlets', 'Coffee', 'Natural Light', 'Late Night', '24/7', 'Food Nearby'];

export function AddSpotWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [step, setStep] = useState(1);
  const [search, setSearch] = useState(initialQuery);
  const [name, setName] = useState(initialQuery);
  const [category, setCategory] = useState('Library');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [campusArea, setCampusArea] = useState('');
  const [hours, setHours] = useState('Mon-Sun 8am-10pm');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Quiet', 'WiFi']);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ANN_ARBOR_SPOTS.slice(0, 4);
    return ANN_ARBOR_SPOTS.filter(
      (spot) =>
        spot.name.toLowerCase().includes(query) ||
        spot.address.toLowerCase().includes(query) ||
        spot.location.toLowerCase().includes(query)
    ).slice(0, 4);
  }, [search]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag]
    );
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, 4));
  }

  function prevStep() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submitSpot() {
    setSubmitting(true);
    const baseCoordinates =
      campusArea.toLowerCase().includes('north')
        ? { latitude: 42.2913, longitude: -83.7157 }
        : { latitude: 42.2808, longitude: -83.743 };

    const res = await fetch('/api/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        address,
        latitude: baseCoordinates.latitude,
        longitude: baseCoordinates.longitude,
        tags: selectedTags,
        features: selectedTags,
        amenities: category === 'Coffee Shop' ? ['Coffee'] : [],
        hours: { display: hours },
        price: category === 'Coffee Shop' ? 'DOLLAR' : 'Free',
        status: 'Open',
        currentOccupancy: 'Light',
      }),
    });

    if (!res.ok) {
      toast.error('Could not submit spot');
      setSubmitting(false);
      return;
    }

    const data = (await res.json()) as { spot: { id: string } };

    await Promise.all(
      images.map((url) =>
        fetch(`/api/spots/${data.spot.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
      )
    );

    toast.success('Spot submitted');
    router.push(`/spots/${data.spot.id}`);
    router.refresh();
  }

  return (
    <div className="screen-width page-padding space-y-5">
      <div className="rounded-full bg-[#F3F4F6] p-1 dark:bg-slate-800">
        <div className="h-2 rounded-full bg-[#2563EB] transition-all" style={{ width: `${step * 25}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] disabled:opacity-40 dark:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-[#1E3A5F] dark:text-white" />
        </button>
        <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">Step {step} of 4</p>
        <div className="h-10 w-10" />
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F] dark:text-white">Search for an existing spot first</label>
            <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 dark:bg-slate-900">
              <Search className="h-4 w-4 text-[#2563EB]" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (!name) setName(e.target.value);
                }}
                placeholder="Search by name or address"
                className="w-full bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {matches.length > 0 ? (
              matches.map((spot) => (
                <Link key={spot.id} href={`/spots/${spot.id}`} className="block rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
                  <p className="font-semibold text-[#1E3A5F] dark:text-white">{spot.name}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">{spot.address}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
                <p className="font-semibold text-[#1E3A5F] dark:text-white">No matching spot found.</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                  We’ll help you add {search.trim() ? `"${search.trim()}"` : 'this spot'} to Spotly.
                </p>
              </div>
            )}
          </div>

          <button type="button" onClick={nextStep} className="spotly-button-primary w-full">
            Add a new spot
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
          <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Basic details</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spot name" className="spotly-input" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="spotly-input">
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="spotly-input" />
          <input value={campusArea} onChange={(e) => setCampusArea(e.target.value)} placeholder="Campus / neighborhood" className="spotly-input" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={4}
            className="spotly-input resize-none"
          />
          <button type="button" onClick={nextStep} className="spotly-button-primary w-full">
            Next
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Map and study details</h2>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-slate-900">
              <MapPin className="h-5 w-5 text-[#2563EB]" />
              <div>
                <p className="text-sm font-semibold text-[#1E3A5F] dark:text-white">{address || 'Add an address above'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">Location will be saved near your selected campus area</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <label className="mb-2 block text-sm font-semibold text-[#1E3A5F] dark:text-white">Good for</label>
            <div className="flex flex-wrap gap-2">
              {goodForOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-gray-300 bg-white text-gray-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" className="spotly-input mt-4" />
          </div>

          <button type="button" onClick={nextStep} className="spotly-button-primary w-full">
            Next
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
            <h2 className="text-lg font-bold text-[#1E3A5F] dark:text-white">Photos and review</h2>
            <div className="mt-4">
              <ImageUploader onUploaded={(url) => setImages((prev) => [...prev, url])} />
            </div>
            {images.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <img key={index} src={image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
            <h3 className="text-base font-semibold text-[#1E3A5F] dark:text-white">{name || 'New Spot'}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">{category} · {campusArea || 'Campus area'}</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{description || 'No description yet'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#2563EB] dark:bg-slate-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button type="button" disabled={submitting} onClick={submitSpot} className="spotly-button-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Spot'}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-300">
        <span>{step === 1 ? 'Check if it already exists' : 'Keep going to finish your submission'}</span>
        {step < 4 ? (
          <button type="button" onClick={nextStep} className="flex items-center gap-1 font-semibold text-[#2563EB]">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
