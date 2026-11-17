import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card.tsx";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { SelectField } from "../components/SelectField.tsx";
import { cities, placeLabel } from "../domain/catalog.ts";
import { pairOf, useDemo } from "../domain/demoStore.ts";
import { emptyListingFilter, fakeListings, filterListings, type ListingFilter } from "../domain/places.ts";
import { findCandidate } from "../domain/people.ts";
import { hasSharedStandard } from "../domain/searchStandard.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function ListingsPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const demo = useDemo();
  const ready = hasSharedStandard(pairOf(demo, personId).search);
  const [filter, setFilter] = useState<ListingFilter>(emptyListingFilter);
  const areas = cities.flatMap((city) => city.areas.map((area) => ({ value: area.id, label: `${city.label}${area.label}` })));
  const layouts = [...new Set(fakeListings.map((item) => item.layout))];
  const found = filterListings(fakeListings, filter);

  return (
    <MutualGate personId={personId} title="示例房源">
      <PageShell title="示例房源">
        <Link to={`/together/${personId}`} className="text-sm text-warm">
          ← 返回和{person?.nickname}的安排
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">示例房源</h1>
        <p className="mt-2 text-sm leading-6 text-warm">不是真的在租。没有中介，也没有地图。租金是假的。</p>
        {!ready ? (
          <p className="mt-4 text-sm leading-6">先把找房标准双方都确认了，再来看这些房子。</p>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-3">
              <SelectField id="district" label="片区" value={filter.areaId} options={[{ value: "any", label: "不限" }, ...areas]} onChange={(areaId) => setFilter({ ...filter, areaId })} />
              <SelectField
                id="rent"
                label="月租上限"
                value={filter.rentMax}
                options={[
                  { value: "any", label: "不限" },
                  { value: "6000", label: "6000 元以内" },
                  { value: "8000", label: "8000 元以内" },
                  { value: "10000", label: "10000 元以内" },
                ]}
                onChange={(rentMax) => setFilter({ ...filter, rentMax })}
              />
              <SelectField id="layout" label="户型" value={filter.layout} options={[{ value: "any", label: "不限" }, ...layouts.map((item) => ({ value: item, label: item }))]} onChange={(layout) => setFilter({ ...filter, layout })} />
              <SelectField
                id="baths"
                label="卫生间"
                value={filter.baths}
                options={[
                  { value: "any", label: "不限" },
                  { value: "1", label: "1 卫" },
                  { value: "2", label: "2 卫" },
                ]}
                onChange={(baths) => setFilter({ ...filter, baths })}
              />
              <SelectField
                id="area"
                label="面积"
                value={filter.areaMin}
                options={[
                  { value: "any", label: "不限" },
                  { value: "60", label: "60 ㎡以上" },
                  { value: "80", label: "80 ㎡以上" },
                  { value: "100", label: "100 ㎡以上" },
                ]}
                onChange={(areaMin) => setFilter({ ...filter, areaMin })}
              />
            </div>
            {found.length === 0 ? (
              <p className="mt-4 text-sm leading-6">没有同时符合的房子。把筛选放宽一点。</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {found.map((listing) => (
                  <li key={listing.id}>
                    <Link to={`/housing/listings/${personId}/${listing.id}`} className={linkClass}>
                      <Card>
                        <PhotoTile id={listing.photoId} />
                        <h2 className="mt-3 text-base font-medium">{listing.community}</h2>
                        <p className="mt-1 text-sm leading-6">
                          {placeLabel(listing.cityId, listing.areaId)} · {listing.layout} · {listing.rent} 元
                        </p>
                        <p className="text-sm leading-6 text-warm">
                          {listing.areaSqm} ㎡ · {listing.baths} 卫 · {listing.metro}
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </PageShell>
    </MutualGate>
  );
}
