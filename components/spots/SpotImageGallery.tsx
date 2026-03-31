export function SpotImageGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {images.map((src) => (
        <img key={src} src={src} alt="Spot" className="h-36 w-full rounded-xl object-cover" />
      ))}
    </div>
  );
}
