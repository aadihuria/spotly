'use client';

import { useState } from 'react';

export function useTypingIndicator() {
  const [typing, setTyping] = useState(false);
  return { typing, setTyping };
}
