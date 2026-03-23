import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('glass rounded-2xl p-4', props.className)} />;
}
