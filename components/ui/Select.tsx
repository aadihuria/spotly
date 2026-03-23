import { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`rounded-xl bg-white/10 p-3 ${props.className ?? ''}`} />;
}
