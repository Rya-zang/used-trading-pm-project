import { Link, useParams } from "react-router-dom";
import { ListingCommute } from "../components/ListingCommute.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { MutualGate } from "../components/MutualGate.tsx";
import { placeLabel } from "../domain/catalog.ts";
import { pairOf, shareListing, simulateTheySavedListing, toggleSavedListing, useDemo } from "../domain/demoStore.ts";
import { findListing } from "../domain/places.ts";
import { findCandidate } from "../domain/people.ts";
import { bothAcceptListing } from "../domain/viewing.ts";

export function ListingDetailPage() {
  const { personId = "", listingId = "" } = useParams();
  const listing = findListing(listingId);
  const person = findCandidate(personId);
  const demo = useDemo();
  const saved = demo.savedListingIds.includes(listingId);
  const theySaved = (demo.theirSavedListingIds[personId] ?? []).includes(listingId);
  const shared = (demo.sharedListingIds[personId] ?? []).includes(listingId);
  const accepted = pairOf(demo, personId).viewings.some((item) => item.placeId === listingId && bothAcceptListing(item));

  if (!listing) {
    return (
      <PageShell title="房源">
        <h1 className="text-2xl font-semibold">没有这套房</h1>
      </PageShell>
    );
  }

  return (
    <MutualGate personId={personId} title={listing.community}>
      <PageShell title={listing.community}>
        <Link to={`/housing/listings/${personId}`} className="text-sm text-warm">
          ← 返回示例房源
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">{listing.community}</h1>
        <p className="mt-2 text-sm leading-6 text-warm">示例房源，不是真的在租。</p>
        <div className="mt-4">
          <PhotoTile id={listing.photoId} large />
        </div>
        <dl className="mt-4 divide-y divide-oat">
          <Row label="片区" value={placeLabel(listing.cityId, listing.areaId)} />
          <Row label="月租" value={`${listing.rent} 元`} />
          <Row label="户型" value={listing.layout} />
          <Row label="卫生间" value={`${listing.baths} 卫`} />
          <Row label="面积" value={`${listing.areaSqm} ㎡`} />
          <Row label="地铁" value={listing.metro} />
          <Row label="配套" value={listing.amenities.join("、")} />
        </dl>
        <p className="mt-4 text-sm leading-6">{listing.description}</p>
        <ListingCommute listing={listing} />
        <p className="mt-2 text-sm leading-6">
          你{saved ? "收藏了" : "还没收藏"}。对方{theySaved ? "也收藏了" : "还没收藏"}。
          {shared ? " 你已经发给对方看。" : ""}
        </p>
        {accepted ? <p className="mt-2 text-sm leading-6">双方都说愿意，这套算共同接受。</p> : null}
        <div className="mt-6 flex flex-col gap-2">
          <PrimaryButton variant="quiet" onClick={() => toggleSavedListing(listing.id)}>
            {saved ? "取消收藏" : "收藏"}
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => simulateTheySavedListing(personId, listing.id)}>
            模拟对方也收藏了
          </PrimaryButton>
          <PrimaryButton variant="quiet" onClick={() => shareListing(personId, listing.id)}>
            发给{person?.nickname}看
          </PrimaryButton>
          <PrimaryButton to={`/together/${personId}/viewing`}>约看这套</PrimaryButton>
        </div>
      </PageShell>
    </MutualGate>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-sm text-warm">{label}</dt>
      <dd className="text-right text-sm leading-6">{value}</dd>
    </div>
  );
}
