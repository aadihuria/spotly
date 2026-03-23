'use client';

import { useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';

export function useRealtime(channelName: string, eventName: string, callback: (payload: unknown) => void) {
  useEffect(() => {
    if (!pusherClient) return;
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, callback);
    return () => {
      channel.unbind(eventName, callback);
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName, eventName, callback]);
}
