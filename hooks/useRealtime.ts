'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';

export function useRealtime(channelName: string, eventName: string, callback: (payload: unknown) => void) {
  useEffect(() => {
    if (!pusherClient || !channelName) return;
    const client = pusherClient;
    const channel = client.subscribe(channelName);
    channel.bind(eventName, callback);
    return () => {
      channel.unbind(eventName, callback);
      client.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}
