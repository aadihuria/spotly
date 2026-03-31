'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateGroupForm() {
  const router = useRouter();
  const [type, setType] = useState<'course' | 'interest' | 'major'>('course');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        type,
        course: type === 'course' ? course : null,
        location,
        interests: [],
        meetingSchedule: [],
      }),
    });

    if (!res.ok) {
      toast.error('Could not create group');
      setSubmitting(false);
      return;
    }

    const data = (await res.json()) as { group: { id: string } };
    toast.success('Group created');
    router.push(`/groups/${data.group.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-[#F3F4F6] p-4 shadow-md dark:bg-slate-800">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="spotly-input"
        placeholder="Group name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="spotly-input min-h-28 resize-none"
        placeholder="Description"
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as 'course' | 'interest' | 'major')} className="spotly-input">
        <option value="course">Course</option>
        <option value="interest">Interest</option>
        <option value="major">Major</option>
      </select>
      {type === 'course' ? (
        <input
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="spotly-input"
          placeholder="Course code"
        />
      ) : null}
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="spotly-input"
        placeholder="Meeting location"
      />
      <button disabled={submitting} className="spotly-button-primary w-full">
        {submitting ? 'Creating...' : 'Create Group'}
      </button>
    </form>
  );
}
