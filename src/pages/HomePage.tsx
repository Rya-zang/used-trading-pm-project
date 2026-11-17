import { Link } from "react-router-dom";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { Tag } from "../components/Tag.tsx";
import { labelOf, rentalModes } from "../domain/catalog.ts";
import { draftInProgress } from "../domain/profile.ts";
import { clearDraft, useOnboardingDraft, useSavedProfile } from "../domain/storage.ts";

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function HomePage() {
  const profile = useSavedProfile();
  const draft = useOnboardingDraft();
  const continuing = !profile && draftInProgress(draft);

  return (
    <PageShell>
      <header>
        <h1 className="text-[2.5rem] leading-none font-semibold">顺心</h1>
        <p className="mt-2 text-sm text-warm">Roommate Match</p>
        <p className="mt-4 text-base leading-7">
          {profile ? `${profile.nickname}，资料已经在这台手机上。可以去看室友建议。` : "找到合拍的人，一起住得顺心。"}
        </p>
      </header>

      <section className="mt-8" aria-labelledby="start-heading">
        <h2 id="start-heading" className="text-sm text-warm">
          {profile ? "接下来" : "从这里开始"}
        </h2>
        {profile ? (
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <Link to="/roommates" className={linkClass}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base leading-6 font-medium">看室友建议</h3>
                    <span aria-hidden="true" className="text-warm">
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">
                    当前是{labelOf(rentalModes, profile.rentalMode)}。建议按你填的资料来排。
                  </p>
                </Card>
              </Link>
            </li>
            <li>
              <Link to="/onboarding?edit=1" className={linkClass}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base leading-6 font-medium">修改我的资料</h3>
                    <span aria-hidden="true" className="text-warm">
                      →
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          </ul>
        ) : continuing ? (
          <div className="mt-2 flex flex-col gap-2">
            <Link to="/onboarding" className={linkClass}>
              <Card>
                <h3 className="text-base font-medium">继续填写资料</h3>
                <p className="mt-2 text-sm leading-6">上次没填完的内容还在这台手机上。</p>
              </Card>
            </Link>
            <button
              type="button"
              onClick={() => clearDraft()}
              className="min-h-11 text-left text-sm text-warm underline-offset-2 focus-visible:ring-2 focus-visible:ring-warm"
            >
              重新开始
            </button>
          </div>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            <StartLink
              to="/onboarding?mode=has-listing"
              title="我已经有房源，想找室友"
              detail="房子已经有了。先把资料填好，再看室友建议。"
            />
            <StartLink
              to="/onboarding?mode=seek-together"
              title="我还没有房源，想找人一起租房"
              detail="想先找人，再一起找房。先填一份资料。"
            />
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="later-heading">
        <h2 id="later-heading" className="text-sm text-warm">
          其他入口
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          <li>
            <Link to="/roommates" className={linkClass}>
              <Card>
                <Tag>可以看</Tag>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium">室友建议</h3>
                  <span aria-hidden="true" className="text-warm">
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">填写资料后，可以看到示例室友、参考分，并在双方同意后聊天。</p>
              </Card>
            </Link>
          </li>
          <li>
            <Card>
              <Tag tone="quiet">还没做</Tag>
              <h3 className="mt-2 text-base font-medium">找房</h3>
              <p className="mt-2 text-sm leading-6">还不能发布或浏览房源，也还不能约看房。</p>
            </Card>
          </li>
          <li>
            <Link to="/space" className={linkClass}>
              <Card>
                <Tag tone="quiet">还没做</Tag>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium">合租空间</h3>
                  <span aria-hidden="true" className="text-warm">
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">里面仍是占位。还没有公约、分摊或住在一起之后的工具。</p>
              </Card>
            </Link>
          </li>
        </ul>
      </section>
    </PageShell>
  );
}

function StartLink({ to, title, detail }: { to: string; title: string; detail: string }) {
  return (
    <li>
      <Link to={to} className={linkClass}>
        <Card>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base leading-6 font-medium">{title}</h3>
            <span aria-hidden="true" className="text-warm">
              →
            </span>
          </div>
          <p className="mt-2 text-sm leading-6">{detail}</p>
        </Card>
      </Link>
    </li>
  );
}
