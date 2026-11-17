import { Link, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar.tsx";
import { ChoreRoster } from "../components/ChoreRoster.tsx";
import { Card } from "../components/Card.tsx";
import { MutualGate } from "../components/MutualGate.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { pairOf, decideToLive, useDemo } from "../domain/demoStore.ts";
import { hasSharedStandard } from "../domain/searchStandard.ts";
import { findCandidate } from "../domain/people.ts";
import { moveInBlockers } from "../domain/together.ts";
import { placeAgreed } from "../domain/viewing.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function TogetherPage() {
  const { personId = "" } = useParams();
  const person = findCandidate(personId);
  const demo = useDemo();
  const pair = pairOf(demo, personId);
  const blockers = moveInBlockers(pair);
  const standardReady = hasSharedStandard(pair.search);

  return (
    <MutualGate personId={personId} title="一起">
      <PageShell title={person ? `和${person.nickname}` : "一起"}>
        <Link to={person ? `/roommates/${person.id}` : "/roommates"} className="text-sm text-warm">
          ← 返回对方资料
        </Link>
        <div className="mt-4 flex items-center gap-3">
          {person ? <Avatar id={person.avatarId} gender={person.gender} /> : null}
          <h1 className="text-2xl font-semibold">和{person?.nickname}一起往下走</h1>
        </div>
        <p className="mt-2 text-sm leading-6">看房、租金、约法都是两边各点各的。你不能替对方确认。</p>
        <ul className="mt-6 flex flex-col gap-2">
          <Step to={`/together/${personId}/viewing`} title="约看房" detail={placeAgreed(pair.viewings) ? "有一处双方都愿意" : "还没定下来"} />
          <Step to={`/together/${personId}/search`} title="一起定找房标准" detail={standardReady ? "共同标准已经定了" : "还在对"} />
          {standardReady ? (
            <Step to={`/housing/listings/${personId}`} title="看示例房源" detail="按片区、租金、户型来筛" />
          ) : null}
          <Step
            to={`/together/${personId}/rent`}
            title="租金怎么分"
            detail={pair.rent.myConfirmed && pair.rent.theirConfirmed ? "双方都确认了" : "两边各自确认"}
          />
          <Step to={`/together/${personId}/rules`} title="住在一起之前，先说好这些事" detail="双方写好再对照" />
        </ul>
        <section className="mt-8">
          <h2 className="text-base font-medium">决定住在一起</h2>
          {blockers.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {blockers.map((item) => (
                <li key={item} className="text-sm leading-6">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm leading-6">该说的都说了。还要你们各自点一次，才算决定。</p>
          )}
          <p className="mt-2 text-sm leading-6">
            你：{pair.myMoveIn ? "决定了" : "还没决定"}。对方：{pair.theirMoveIn ? "决定了" : "还没决定"}。
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <PrimaryButton disabled={blockers.length > 0 || pair.myMoveIn} onClick={() => decideToLive(personId, "me")}>
              我决定住在一起
            </PrimaryButton>
            <PrimaryButton
              variant="quiet"
              disabled={blockers.length > 0 || pair.theirMoveIn}
              onClick={() => decideToLive(personId, "them")}
            >
              对方也决定了
            </PrimaryButton>
          </div>
          <div className="mt-8">
            <ChoreRoster personId={personId} />
          </div>
          {pair.myMoveIn && pair.theirMoveIn ? (
            <div className="mt-3">
              <PrimaryButton to={`/space/${personId}`}>打开合租空间</PrimaryButton>
            </div>
          ) : null}
        </section>
      </PageShell>
    </MutualGate>
  );
}

function Step({ to, title, detail }: { to: string; title: string; detail: string }) {
  return (
    <li>
      <Link to={to} className={linkClass}>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-medium">{title}</h2>
            <span aria-hidden="true" className="text-warm">
              →
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-warm">{detail}</p>
        </Card>
      </Link>
    </li>
  );
}
