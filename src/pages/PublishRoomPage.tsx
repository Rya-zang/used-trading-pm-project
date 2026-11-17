import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckRow, SelectField } from "../components/SelectField.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PhotoTile } from "../components/PhotoTile.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { TextField } from "../components/TextField.tsx";
import { cities, type AreaId, type CityId } from "../domain/catalog.ts";
import { saveMyRoom, useDemo } from "../domain/demoStore.ts";
import { photoPresets, type PhotoId, type PublishedRoom, type RoomSpot } from "../domain/places.ts";
import { CURRENT_USER_ID, useSavedProfile } from "../domain/storage.ts";

const layouts = ["1室1厅", "2室1厅", "2室2厅", "3室1厅", "3室2厅"];
const lights = ["光线好", "光线一般", "光线偏暗"];

interface SpotForm {
  name: string;
  area: string;
  rent: string;
  privateBath: boolean;
  light: string;
  balcony: boolean;
  furniture: string;
}

function spotFromRoom(spot: RoomSpot): SpotForm {
  return {
    name: spot.name,
    area: String(spot.areaSqm),
    rent: String(spot.rent),
    privateBath: spot.privateBath,
    light: spot.light,
    balcony: spot.balcony,
    furniture: spot.furniture,
  };
}

function emptySpot(name: string): SpotForm {
  return { name, area: "", rent: "", privateBath: false, light: "光线一般", balcony: false, furniture: "" };
}

export function PublishRoomPage() {
  const profile = useSavedProfile();
  const demo = useDemo();
  const navigate = useNavigate();
  const existing = demo.myRoom;
  const [community, setCommunity] = useState(existing?.community ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [cityId, setCityId] = useState<CityId | "">(existing?.cityId ?? profile?.cityId ?? "");
  const [areaId, setAreaId] = useState<AreaId | "">(existing?.areaId ?? profile?.areaId ?? "");
  const [wholeRent, setWholeRent] = useState(existing ? String(existing.wholeRent) : "");
  const [layout, setLayout] = useState(existing?.layout ?? "2室1厅");
  const [areaSqm, setAreaSqm] = useState(existing ? String(existing.areaSqm) : "");
  const [bedrooms, setBedrooms] = useState(existing ? String(existing.bedrooms) : "2");
  const [baths, setBaths] = useState(existing ? String(existing.baths) : "1");
  const [moveIn, setMoveIn] = useState(existing?.moveIn ?? "");
  const [requirements, setRequirements] = useState(existing?.requirements ?? "");
  const [photos, setPhotos] = useState<PhotoId[]>(existing?.photos ?? ["living"]);
  const [ownRoom, setOwnRoom] = useState<SpotForm>(existing ? spotFromRoom(existing.ownRoom) : emptySpot("我住的房间"));
  const [mateRoom, setMateRoom] = useState<SpotForm>(existing ? spotFromRoom(existing.roommateRoom) : emptySpot("给室友的房间"));
  const [error, setError] = useState<string | null>(null);
  const city = cities.find((item) => item.id === cityId);

  function togglePhoto(id: PhotoId) {
    setPhotos((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function save() {
    const room = toRoom();
    if (!room) {
      setError("把小区、地址、城市片区、租金、面积、两间房和至少一张照片填上。");
      return;
    }
    saveMyRoom(room);
    navigate(`/housing/rooms/${room.id}`);
  }

  function toRoom(): PublishedRoom | null {
    if (!cityId || !areaId || community.trim() === "" || address.trim() === "") return null;
    const whole = positive(wholeRent);
    const area = positive(areaSqm);
    const beds = positive(bedrooms);
    const bathCount = positive(baths);
    const own = toSpot(ownRoom);
    const mate = toSpot(mateRoom);
    if (!whole || !area || !beds || !bathCount || !own || !mate || photos.length === 0 || moveIn.trim() === "") {
      return null;
    }
    return {
      id: existing?.id ?? "room-me",
      ownerId: CURRENT_USER_ID,
      cityId,
      areaId,
      community: community.trim(),
      address: address.trim(),
      wholeRent: whole,
      layout,
      areaSqm: area,
      bedrooms: beds,
      baths: bathCount,
      ownRoom: own,
      roommateRoom: mate,
      moveIn: moveIn.trim(),
      requirements: requirements.trim(),
      photos,
    };
  }

  return (
    <PageShell title="写下房间">
      <h1 className="text-2xl font-semibold">写下我的房间</h1>
      <p className="mt-2 text-sm leading-6 text-warm">写下小区、地址、租金，以及你住的房间和空给室友的房间。</p>
      <div className="mt-6 flex flex-col gap-4">
        <TextField id="community" label="小区" value={community} onChange={setCommunity} placeholder="比如：衡复小路" />
        <TextField id="address" label="地址" value={address} onChange={setAddress} placeholder="比如：衡复路 18 号" />
        <SelectField
          id="city"
          label="城市"
          value={cityId}
          options={[{ value: "", label: "请选择" }, ...cities.map((item) => ({ value: item.id, label: item.label }))]}
          onChange={(value) => {
            setCityId(value as CityId | "");
            setAreaId("");
          }}
        />
        {city ? (
          <SelectField
            id="area"
            label="片区"
            value={areaId}
            options={[{ value: "", label: "请选择" }, ...city.areas.map((item) => ({ value: item.id, label: item.label }))]}
            onChange={(value) => setAreaId(value as AreaId | "")}
          />
        ) : null}
        <TextField id="whole" label="整套月租（元）" value={wholeRent} inputMode="numeric" onChange={(value) => setWholeRent(value.replace(/\D/g, "").slice(0, 6))} />
        <SelectField id="layout" label="户型" value={layout} options={layouts.map((item) => ({ value: item, label: item }))} onChange={setLayout} />
        <TextField id="area-sqm" label="整套面积（㎡）" value={areaSqm} inputMode="numeric" onChange={(value) => setAreaSqm(value.replace(/\D/g, "").slice(0, 4))} />
        <TextField id="beds" label="卧室数" value={bedrooms} inputMode="numeric" onChange={(value) => setBedrooms(value.replace(/\D/g, "").slice(0, 1))} />
        <TextField id="baths" label="卫生间数" value={baths} inputMode="numeric" onChange={(value) => setBaths(value.replace(/\D/g, "").slice(0, 1))} />
        <TextField id="move" label="可入住时间" value={moveIn} onChange={setMoveIn} placeholder="2026年12月" />
        <SpotFields title="我自己住的房间" spot={ownRoom} onChange={setOwnRoom} />
        <SpotFields title="空给室友的房间" spot={mateRoom} onChange={setMateRoom} />
        <label htmlFor="requirements" className="block text-sm">
          <span className="mb-2 block text-warm">对室友的要求</span>
          <textarea
            id="requirements"
            value={requirements}
            maxLength={80}
            rows={3}
            onChange={(event) => setRequirements(event.target.value.slice(0, 80))}
            className="w-full rounded-input border border-oat bg-white px-3 py-3 text-base outline-none focus-visible:border-sage"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm text-warm">照片</legend>
          <div className="grid grid-cols-2 gap-2">
            {photoPresets.map((photo) => {
              const selected = photos.includes(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => togglePhoto(photo.id)}
                  className={selected ? "rounded-card ring-2 ring-ink" : "rounded-card"}
                >
                  <PhotoTile id={photo.id} />
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      <div className="mt-6">
        <PrimaryButton onClick={save}>保存这间房</PrimaryButton>
      </div>
    </PageShell>
  );
}

function SpotFields({
  title,
  spot,
  onChange,
}: {
  title: string;
  spot: SpotForm;
  onChange: (spot: SpotForm) => void;
}) {
  return (
    <fieldset className="panel p-4">
      <legend className="px-1 text-sm text-warm">{title}</legend>
      <div className="mt-3 flex flex-col gap-3">
        <TextField id={`${title}-name`} label="房间" value={spot.name} onChange={(name) => onChange({ ...spot, name })} />
        <TextField
          id={`${title}-area`}
          label="面积（㎡）"
          value={spot.area}
          inputMode="numeric"
          onChange={(area) => onChange({ ...spot, area: area.replace(/\D/g, "").slice(0, 3) })}
        />
        <TextField
          id={`${title}-rent`}
          label="这间的月租（元）"
          value={spot.rent}
          inputMode="numeric"
          onChange={(rent) => onChange({ ...spot, rent: rent.replace(/\D/g, "").slice(0, 6) })}
        />
        <SelectField
          id={`${title}-light`}
          label="光线"
          value={spot.light}
          options={lights.map((item) => ({ value: item, label: item }))}
          onChange={(light) => onChange({ ...spot, light })}
        />
        <CheckRow label="有独立卫生间" checked={spot.privateBath} onChange={(privateBath) => onChange({ ...spot, privateBath })} />
        <CheckRow label="有阳台" checked={spot.balcony} onChange={(balcony) => onChange({ ...spot, balcony })} />
        <TextField
          id={`${title}-furniture`}
          label="家具"
          value={spot.furniture}
          onChange={(furniture) => onChange({ ...spot, furniture })}
          placeholder="床、衣柜"
        />
      </div>
    </fieldset>
  );
}

function positive(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number > 0 ? number : null;
}

function toSpot(spot: SpotForm): RoomSpot | null {
  const area = positive(spot.area);
  const rent = /^\d+$/.test(spot.rent) ? Number(spot.rent) : null;
  if (area === null || rent === null || spot.name.trim() === "" || spot.furniture.trim() === "") return null;
  return {
    name: spot.name.trim(),
    areaSqm: area,
    rent,
    privateBath: spot.privateBath,
    light: spot.light,
    balcony: spot.balcony,
    furniture: spot.furniture.trim(),
  };
}
