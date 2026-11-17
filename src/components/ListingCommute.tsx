import { formatKm, listingMeets, rankListings, wishLabels, workplaceOf } from "../domain/commute.ts";
import type { FakeListing } from "../domain/places.ts";
import { useSavedWishes, useSavedWorkplace } from "../domain/storage.ts";

export function ListingCommute({ listing }: { listing: FakeListing }) {
  const workplace = useSavedWorkplace();
  const wishes = useSavedWishes();
  const labels = wishLabels(wishes.presets, wishes.custom);
  if (!workplace && labels.length === 0) return null;
  const km = workplace
    ? rankListings(workplaceOf(workplace.presetId)).find((item) => item.listing.id === listing.id)?.km
    : null;
  const met = labels.filter((wish) => listingMeets(listing, wish.id, wishes.custom));
  const missed = labels.filter((wish) => !listingMeets(listing, wish.id, wishes.custom));
  return (
    <div className="mt-2">
      {km !== undefined && km !== null ? <p className="text-sm font-medium text-[#C9855A]">离上班地点 {formatKm(km)}</p> : null}
      {labels.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-[#858585]">
          {met.length > 0 ? `有${met.map((item) => item.label).join("、")}` : "记下的愿望都没对上"}
          {missed.length > 0 && met.length > 0 ? `。没有${missed.map((item) => item.label).join("、")}` : ""}
        </p>
      ) : null}
    </div>
  );
}
