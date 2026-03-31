export function Avatar({ src, alt }: { src?: string; alt: string }) {
  return <img src={src ?? 'https://api.dicebear.com/7.x/initials/svg?seed=User'} alt={alt} className="h-10 w-10 rounded-full object-cover" />;
}
