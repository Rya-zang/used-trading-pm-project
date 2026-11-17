import { photoOf } from "../domain/places.ts";

export function PhotoTile({ id, large = false }: { id: string; large?: boolean }) {
  const photo = photoOf(id);
  return (
    <div className={`flex items-end rounded-card p-3 ${photo.className} ${large ? "h-36" : "h-20"}`}>
      <span className="text-sm text-ink">{photo.label}</span>
    </div>
  );
}
