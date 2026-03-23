import { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('w-full rounded-xl border border-white/20 bg-white/10 p-3', props.className)} />;
}
