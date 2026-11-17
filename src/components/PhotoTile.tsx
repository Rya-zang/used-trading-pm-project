import { photoOf } from "../domain/places.ts";

export function PhotoTile({ id, large = false }: { id: string; large?: boolean }) {
  const photo = photoOf(id);
  return (
    <img
      src={photo.src}
      alt={photo.label}
      className={`w-full rounded-xl object-cover ${large ? "h-36" : "h-24"}`}
    />
  );
}
