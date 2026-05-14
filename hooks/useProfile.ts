'use client';

import useSWR from 'swr';
import { useUser } from './useUser';

type ProfileData = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  interests?: string[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useProfile() {
  const { user } = useUser();
  const { data, mutate } = useSWR<{ user: ProfileData }>(
    user?.id ? '/api/users/me' : null,
    fetcher,
    { dedupingInterval: 60_000, revalidateOnFocus: false },
  );
  return { profile: data?.user ?? null, mutate };
}
