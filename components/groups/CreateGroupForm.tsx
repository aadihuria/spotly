'use client';

import { useState } from 'react';

export function CreateGroupForm() {
  const [type, setType] = useState<'course' | 'interest' | 'major'>('course');

  return (
    <form className="glass space-y-3 rounded-2xl p-4">
      <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Group name" />
      <textarea className="w-full rounded-lg bg-white/10 p-3" placeholder="Description" />
      <select value={type} onChange={(e) => setType(e.target.value as 'course' | 'interest' | 'major')} className="w-full rounded-lg bg-white/10 p-3">
        <option value="course">Course</option>
        <option value="interest">Interest</option>
        <option value="major">Major</option>
      </select>
      {type === 'course' ? <input className="w-full rounded-lg bg-white/10 p-3" placeholder="Course code" /> : null}
      <button className="btn-glow">Create Group</button>
    </form>
  );
}
