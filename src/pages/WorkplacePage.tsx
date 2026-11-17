import { useState } from "react";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { placeLabel } from "../domain/catalog.ts";
import { fakeListings } from "../domain/places.ts";
import {
  CLOSE_KM,
  formatKm,
  listingMeets,
  nearbyPresets,
  recommendListings,
  snapWorkplace,
  wishLabels,
  workplaceOf,
  workplaces,
  type NearbyId,
  type WorkplaceId,
} from "../domain/commute.ts";
import {
  saveWishes,
  saveWorkplace,
  useSavedWishes,
  useSavedWorkplace,
} from "../domain/storage.ts";

const chip = "h-8 rounded-full border px-3 text-xs";

export function WorkplacePage() {
  const saved = useSavedWorkplace();
  const wishes = useSavedWishes();
  const [typed, setTyped] = useState(saved?.typed || (saved ? workplaceOf(saved.presetId).label : ""));
  const [picked, setPicked] = useState<WorkplaceId | null>(saved?.presetId ?? null);
  const [selected, setSelected] = useState<NearbyId[]>(wishes.presets);
  const [custom, setCustom] = useState(wishes.custom);
  const [placeNote, setPlaceNote] = useState("");

  function choosePreset(id: WorkplaceId) {
    const place = workplaceOf(id);
    setPicked(id);
    setTyped(place.label);
  }

  function savePlace() {
    const preset =
      picked && typed.trim() === workplaceOf(picked).label ? workplaceOf(picked) : snapWorkplace(typed);
    saveWorkplace({ presetId: preset.id, typed: typed.trim() || preset.label });
    setPicked(preset.id);
    if (!typed.trim()) setTyped(preset.label);
    setPlaceNote(`按「${preset.label}」来算距离。这是示例坐标，不是地图定位。`);
  }

  function toggleWish(id: NearbyId) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  const origin = saved ? workplaceOf(saved.presetId) : null;
  const recommendation = origin ? recommendListings(origin) : null;
  const labels = wishLabels(wishes.presets, wishes.custom);
  const ranked = recommendation?.items ?? fakeListings.map((listing) => ({ listing, km: null as number | null }));
  const filtered =
    labels.length === 0
      ? ranked
      : ranked.filter((item) => labels.some((wish) => listingMeets(item.listing, wish.id, wishes.custom)));
  const showing = labels.length > 0 && filtered.length === 0 ? ranked : filtered;
  const wishesMissedAll = labels.length > 0 && filtered.length === 0;

  return (
    <PageShell title="上班和周边">
      <h1 className="text-2xl font-semibold">上班和周边</h1>
      <p className="mt-2 text-sm leading-6 text-[#858585]">
        选一个上海的办公区或校园，也可以自己写，会归到最近的示例地点。距离是按这些示例坐标算的，没有地图。
      </p>

      <section className="panel mt-6 p-4">
        <h2 className="text-[15px] font-semibold">上班地点</h2>
        <label htmlFor="workplace" className="mt-3 block text-sm text-[#858585]">
          自己写
        </label>
        <input
          id="workplace"
          value={typed}
          maxLength={40}
          placeholder="比如：张江、交大、南京西路"
          onChange={(event) => {
            setTyped(event.target.value.slice(0, 40));
            setPicked(null);
          }}
          className="mt-2 h-12 w-full rounded-xl border border-[#EAEAE6] bg-white px-3 text-base outline-none focus-visible:border-[#C9855A]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {workplaces.map((place) => {
            const on = picked === place.id;
            return (
              <button
                key={place.id}
                type="button"
                aria-pressed={on}
                onClick={() => choosePreset(place.id)}
                className={`${chip} ${on ? "border-[#C9855A] bg-[#C9855A] text-white" : "border-[#EAEAE6] bg-[#FAFAF8] text-[#858585]"}`}
              >
                {place.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={savePlace}>记下上班地点</PrimaryButton>
        </div>
        {placeNote ? <p className="mt-3 text-sm leading-6 text-[#858585]">{placeNote}</p> : null}
        {saved ? (
          <p className="mt-3 text-sm leading-6">
            当前按「{workplaceOf(saved.presetId).label}」推荐。{workplaceOf(saved.presetId).hint}。
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[#858585]">还没记下上班地点。</p>
        )}
      </section>

      <section className="panel mt-4 p-4">
        <h2 className="text-[15px] font-semibold">家里附近想有什么</h2>
        <p className="mt-1 text-[11px] leading-4 text-[#858585]">可以多选。自定义只写一行，用来对照示例房源里的字。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {nearbyPresets.map((item) => {
            const on = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleWish(item.id)}
                className={`${chip} ${on ? "border-[#C9855A] bg-[#C9855A] text-white" : "border-[#EAEAE6] bg-[#FAFAF8] text-[#858585]"}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <label htmlFor="wish-custom" className="mt-3 block text-sm text-[#858585]">
          再写一条
        </label>
        <input
          id="wish-custom"
          value={custom}
          maxLength={20}
          placeholder="比如：夜市"
          onChange={(event) => setCustom(event.target.value.slice(0, 20))}
          className="mt-2 h-12 w-full rounded-xl border border-[#EAEAE6] bg-white px-3 text-base outline-none focus-visible:border-[#C9855A]"
        />
        <div className="mt-4">
          <PrimaryButton
            onClick={() => {
              saveWishes({ presets: selected, custom: custom.trim() });
            }}
          >
            记下这些愿望
          </PrimaryButton>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-semibold">按上班地点看示例房源</h2>
        {!recommendation && labels.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-[#858585]">先记下上班地点，再看哪几套更近。周边愿望也可以先记。</p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-[#858585]">
              {recommendation
                ? recommendation.close
                  ? `${CLOSE_KM} 公里以内的示例房源。`
                  : `几公里以内没有示例房源。下面是离「${origin?.label}」最近的。`
                : "还没记下上班地点。下面按周边愿望来看。"}
            </p>
            {wishesMissedAll ? (
              <p className="mt-2 text-sm leading-6">这些愿望没有对上附近的房子，所以仍把最近的列出来，并标出对上了哪几条。</p>
            ) : null}
            <ul className="mt-3 flex flex-col gap-3">
              {showing.map(({ listing, km }) => {
                const met = labels.filter((wish) => listingMeets(listing, wish.id, wishes.custom));
                const missed = labels.filter((wish) => !listingMeets(listing, wish.id, wishes.custom));
                return (
                  <li key={listing.id}>
                    <Card>
                      <PhotoTile id={listing.photoId} />
                      <h3 className="mt-3 text-[15px] font-semibold">{listing.community}</h3>
                      <p className="mt-1 text-sm leading-6">
                        {placeLabel(listing.cityId, listing.areaId)} · {listing.layout} · {listing.rent} 元
                      </p>
                      {km !== null ? <p className="text-sm font-medium text-[#C9855A]">{formatKm(km)}</p> : null}
                      {labels.length > 0 ? (
                        <p className="mt-2 text-xs leading-5 text-[#858585]">
                          {met.length > 0 ? `有${met.map((item) => item.label).join("、")}` : "这些愿望都没对上"}
                          {missed.length > 0 && met.length > 0 ? `。没有${missed.map((item) => item.label).join("、")}` : ""}
                        </p>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </PageShell>
  );
}
