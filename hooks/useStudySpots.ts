'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStudySpots() {
  const { data, error, isLoading, mutate } = useSWR('/api/spots', fetcher);
  return { spots: data?.spots ?? [], error, isLoading, mutate };
}
