'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useGroups() {
  const { data, error, isLoading, mutate } = useSWR('/api/groups', fetcher);
  return { groups: data?.groups ?? [], error, isLoading, mutate };
}
