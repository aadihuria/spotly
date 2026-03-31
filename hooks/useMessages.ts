'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMessages(conversationId?: string) {
  const key = conversationId ? `/api/messages/${conversationId}` : '/api/messages';
  const { data, error, isLoading, mutate } = useSWR(key, fetcher);
  return { data, error, isLoading, mutate };
}
