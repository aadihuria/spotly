import { HTMLAttributes } from 'react';
export function Badge(props: HTMLAttributes<HTMLSpanElement>) { return <span {...props} className={`rounded-full bg-white/10 px-2 py-1 text-xs ${props.className ?? ''}`} />; }
