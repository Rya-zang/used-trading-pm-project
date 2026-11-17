import { Link } from "react-router-dom";
import { Card } from "../components/Card.tsx";
import { PageShell } from "../components/PageShell.tsx";
import { Tag } from "../components/Tag.tsx";

const entries = [
  {
    to: "/start/has-listing",
    title: "我已经有房源，想找室友",
    detail: "已有房，先找合拍的人。阶段 3 才会确认这种方式。",
  },
  {
    to: "/start/seek-together",
    title: "我还没有房源，想找人一起租房",
    detail: "先找人，再一起看房。阶段 3 才会确认这种方式。",
  },
] as const;

const linkClass =
  "block rounded-card focus-visible:ring-2 focus-visible:ring-warm focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function HomePage() {
  return (
    <PageShell>
      <header>
        <h1 className="text-[2.5rem] leading-none font-semibold">顺心</h1>
        <p className="mt-2 text-sm text-warm">Roommate Match</p>
        <p className="mt-4 text-base leading-7">找到合拍的人，一起住得顺心。</p>
      </header>

      <section className="mt-8" aria-labelledby="start-heading">
        <h2 id="start-heading" className="text-sm text-warm">
          从这里开始
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.to}>
              <Link to={entry.to} className={linkClass}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base leading-6 font-medium">{entry.title}</h3>
                    <span aria-hidden="true" className="text-warm">
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{entry.detail}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="preview-heading">
        <h2 id="preview-heading" className="text-sm text-warm">
          以后会放在这里
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          <li>
            <Card>
              <Tag>预览</Tag>
              <h3 className="mt-2 text-base font-medium">室友推荐</h3>
              <p className="mt-2 text-sm leading-6">
                阶段 4 才会列出合拍的人。现在不能点开。
              </p>
            </Card>
          </li>
          <li>
            <Card>
              <Tag>预览</Tag>
              <h3 className="mt-2 text-base font-medium">当前租房需求</h3>
              <p className="mt-2 text-sm leading-6">
                阶段 3 才会记下你的租房方式。现在不能点开。
              </p>
            </Card>
          </li>
          <li>
            <Link to="/space" className={linkClass}>
              <Card>
                <Tag>入口</Tag>
                <div className="mt-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium">合租空间入口</h3>
                  <span aria-hidden="true" className="text-warm">
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">
                  打开合租空间。里面仍是占位，还没有公约、分摊或日常。
                </p>
              </Card>
            </Link>
          </li>
        </ul>
      </section>
    </PageShell>
  );
}
