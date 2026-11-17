import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/PageShell.tsx";
import { genders, labelOf, placeLabel } from "../domain/catalog.ts";
import { pairOf, toggleSavedListing, useDemo } from "../domain/demoStore.ts";
import { suggestRoommates } from "../domain/match.ts";
import { roommateCandidates } from "../domain/people.ts";
import { fakeListings } from "../domain/places.ts";
import { draftInProgress, type RoommateProfile } from "../domain/profile.ts";
import {
  clearDraft,
  isMutual,
  useApplications,
  useMinScore,
  useOnboardingDraft,
  useSavedProfile,
} from "../domain/storage.ts";

const samplePerson = roommateCandidates[0];
const featuredListing = fakeListings[0];

const card =
  "rounded-2xl border border-[#EAEAE6] bg-white shadow-[0_8px_24px_rgba(37,37,37,0.05)]";
const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9855A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]";

const sleepShort: Record<RoommateProfile["sleep"], string> = {
  early: "早睡",
  regular: "作息规律",
  late: "晚睡",
};
const cleanShort: Record<RoommateProfile["cleanliness"], string> = {
  tidy: "爱干净",
  normal: "整洁适中",
  relaxed: "不太挑剔",
};
const socialShort: Record<RoommateProfile["social"], string> = {
  quiet: "喜欢安静",
  sometimes: "偶尔见朋友",
  often: "常约朋友",
};

export function HomePage() {
  const profile = useSavedProfile();
  const draft = useOnboardingDraft();
  const applications = useApplications();
  const demo = useDemo();
  const minScore = useMinScore();
  const continuing = !profile && draftInProgress(draft);
  const suggestions = profile ? suggestRoommates(profile, roommateCandidates, minScore) : [];
  const featured = suggestions[0];
  const shown = featured?.person ?? (profile ? null : samplePerson);
  const routePerson = featured?.person ?? samplePerson;
  const pair = pairOf(demo, routePerson.id);
  const livingTogether = isMutual(applications[routePerson.id]) && pair.myMoveIn && pair.theirMoveIn;
  const saved = demo.savedListingIds.includes(featuredListing.id);

  return (
    <PageShell variant="home">
      <header className="grid grid-cols-[minmax(0,1fr)_7.25rem] items-end gap-3">
        <div>
          <h1 className="text-[1.75rem] leading-none font-semibold tracking-tight">顺心</h1>
          <p className="mt-1.5 text-xs tracking-wide text-[#858585]">Roommate Match</p>
          <p className="mt-6 text-[1.65rem] leading-snug font-semibold">找到合拍的人，一起住得顺心。</p>
          <p className="mt-2 text-[13px] leading-5 text-[#858585]">从找到室友开始，开启舒服的合租生活。</p>
        </div>
        <img
          src="/home/living.jpg"
          alt="明亮的客厅"
          className="h-36 w-full rounded-2xl object-cover"
        />
      </header>

      <section className="mt-8" aria-labelledby="start-heading">
        <SectionTitle id="start-heading">开始找室友</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Link
            to="/onboarding?mode=has-listing"
            className={`flex min-h-[188px] flex-col p-3.5 ${card} ${focus}`}
          >
            <IconBadge>
              <HouseLine />
            </IconBadge>
            <h3 className="mt-3 text-[15px] leading-5 font-semibold">我有房源，寻找室友</h3>
            <p className="mt-1 text-[11px] leading-4 text-[#858585]">发布空余房间，找到合适的室友</p>
            <span className="mt-auto flex items-end justify-between pt-3">
              <img src="/home/room.jpg" alt="" className="h-12 w-16 rounded-xl object-cover" />
              <Arrow className="bg-[#C9855A] text-white" />
            </span>
          </Link>
          <Link
            to="/onboarding?mode=seek-together"
            className={`relative flex min-h-[188px] overflow-hidden rounded-2xl text-white ${focus}`}
          >
            <img src="/home/city.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/75" />
            <span className="relative flex flex-1 flex-col p-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <SearchLine />
              </span>
              <h3 className="mt-3 text-[15px] leading-5 font-semibold">我没房源，寻找合租伙伴</h3>
              <p className="mt-1 text-[11px] leading-4 text-white/90">
                先匹配室友，
                <br />
                一起找房更轻松
              </p>
              <span className="mt-auto flex justify-end pt-3">
                <Arrow className="bg-white text-[#C9855A]" />
              </span>
            </span>
          </Link>
        </div>
        {continuing ? (
          <div className="mt-3 flex min-h-11 items-center justify-between gap-3 text-[13px]">
            <Link to="/onboarding" className={`text-[#252525] underline-offset-2 ${focus}`}>
              继续填写资料
            </Link>
            <button
              type="button"
              onClick={() => clearDraft()}
              className={`text-[#858585] ${focus}`}
            >
              重新开始
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-8" aria-labelledby="recommend-heading">
        <SectionTitle id="recommend-heading" moreTo="/roommates">
          为你推荐
        </SectionTitle>
        {shown ? (
          <Link to={`/roommates/${shown.id}`} className={`mt-3 block p-3.5 ${card} ${focus}`}>
            <div className="flex gap-3">
              <img
                src={portraitFor(shown.gender)}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] leading-5 font-semibold">
                      {shown.nickname}
                      <span className="ml-1.5 text-xs font-normal text-[#858585]">
                        {shown.age}岁 · {labelOf(genders, shown.gender)}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#858585]">{shown.bio}</p>
                  </div>
                  {featured ? (
                    <p className="shrink-0 text-right">
                      <span className="block text-[1.35rem] leading-none font-semibold text-[#C9855A]">
                        {featured.match.total}%
                      </span>
                      <span className="mt-1 block text-[11px] text-[#858585]">参考</span>
                    </p>
                  ) : (
                    <p className="shrink-0 text-right">
                      <span className="block text-sm font-semibold text-[#C9855A]">示例</span>
                      <span className="mt-1 block text-[11px] text-[#858585]">填写后计算</span>
                    </p>
                  )}
                </div>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {habitChips(shown).map((habit) => (
                    <li key={habit} className="rounded-full bg-[#FAFAF8] px-2 py-1 text-[11px] text-[#858585]">
                      {habit}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-[#858585]">{placeLabel(shown.cityId, shown.areaId)}</p>
              </div>
            </div>
            <span className="mt-3 inline-flex h-8 items-center rounded-full bg-[#C9855A] px-3 text-xs font-medium text-white">
              查看详情
            </span>
          </Link>
        ) : (
          <div className={`mt-3 p-4 ${card}`}>
            <p className="text-sm leading-6">按现在的资料，还没有同时符合的人。</p>
            <Link to="/roommates" className={`mt-2 inline-flex min-h-11 items-center text-sm text-[#C9855A] ${focus}`}>
              去调整筛选
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="house-heading">
        <SectionTitle id="house-heading" moreTo="/housing">
          找到合适的房子
        </SectionTitle>
        <div className={`relative mt-3 flex overflow-hidden ${card}`}>
          <Link
            to={`/housing/listings/${routePerson.id}/${featuredListing.id}`}
            className={`flex min-w-0 flex-1 ${focus}`}
          >
            <img
              src="/home/listing.jpg"
              alt={`${featuredListing.community}的房间`}
              className="h-[108px] w-[118px] shrink-0 object-cover"
            />
            <span className="min-w-0 flex-1 px-3 py-2.5 pr-10">
              <span className="block truncate text-xs text-[#858585]">
                {placeLabel(featuredListing.cityId, featuredListing.areaId)} · {featuredListing.community}
              </span>
              <span className="mt-1 block text-lg leading-none font-semibold text-[#C9855A]">
                ¥{featuredListing.rent}
                <span className="text-xs font-normal">/月</span>
              </span>
              <span className="mt-1.5 block text-xs text-[#252525]">
                {featuredListing.layout} · {featuredListing.areaSqm}㎡
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-[#858585]">{featuredListing.metro}</span>
            </span>
          </Link>
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "取消收藏这套房" : "收藏这套房"}
            onClick={() => toggleSavedListing(featuredListing.id)}
            className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#C9855A] ${focus}`}
          >
            <Bookmark filled={saved} />
          </button>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="tools-heading">
        <SectionTitle id="tools-heading">合租生活工具</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <Link to={`/together/${routePerson.id}/rent`} className={`p-3.5 ${card} ${focus}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9855A] text-white">
              <SplitLine />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold">租金分摊</h3>
            <p className="mt-1 text-[11px] leading-4 text-[#858585]">合理分配租金</p>
          </Link>
          <Link to={`/together/${routePerson.id}/rules`} className={`p-3.5 ${card} ${focus}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAE6] text-[#C9855A]">
              <ShieldLine />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold">约法三章</h3>
            <p className="mt-1 text-[11px] leading-4 text-[#858585]">住之前先说好</p>
          </Link>
        </div>
        <Link
          to={livingTogether ? `/space/${routePerson.id}` : "/space"}
          className={`mt-2.5 flex items-center gap-3 px-3.5 py-3 ${card} ${focus}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAFAF8] text-[#252525]">
            <NoteLine />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">合租公约</span>
            <span className="mt-0.5 block text-[11px] text-[#858585]">打扫、作息、客人和账单</span>
          </span>
          <Arrow className="bg-[#FAFAF8] text-[#858585]" />
        </Link>
      </section>
    </PageShell>
  );
}

function SectionTitle({
  id,
  children,
  moreTo,
}: {
  id: string;
  children: string;
  moreTo?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-[17px] font-semibold">
        {children}
      </h2>
      {moreTo ? (
        <Link to={moreTo} className={`text-[13px] text-[#858585] ${focus}`}>
          查看更多
        </Link>
      ) : null}
    </div>
  );
}

function Arrow({ className }: { className: string }) {
  return (
    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${className}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAFAF8] text-[#252525]">
      {children}
    </span>
  );
}

function habitChips(person: RoommateProfile): string[] {
  return [sleepShort[person.sleep], cleanShort[person.cleanliness], socialShort[person.social]];
}

function portraitFor(gender: RoommateProfile["gender"]): string {
  if (gender === "male") return "/home/portrait-m.jpg";
  if (gender === "female") return "/home/portrait-f.jpg";
  return "/home/portrait-m.jpg";
}

function HouseLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M4 11.2 12 4l8 7.2V20H4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SearchLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Bookmark({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SplitLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 12h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M12 3.5 19 6.2V12c0 4.2-2.8 6.8-7 8.5-4.2-1.7-7-4.3-7-8.5V6.2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.8 12.1 11 14.2 15.3 9.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoteLine() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20.5H7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.2M9.5 12.5h6M9.5 16h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
