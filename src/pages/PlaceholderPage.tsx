import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell.tsx";
import { PrimaryButton } from "../components/PrimaryButton.tsx";
import { Tag } from "../components/Tag.tsx";

export function PlaceholderPage({
  title,
  phase,
  body,
}: {
  title: string;
  phase: string;
  body: string;
}) {
  const navigate = useNavigate();

  return (
    <PageShell title={title}>
      <Tag>{phase}</Tag>
      <h1 className="mt-4 text-2xl leading-snug font-semibold">{title}</h1>
      <p className="mt-2 text-sm leading-6">{body}</p>
      <div className="mt-4">
        <PrimaryButton onClick={() => navigate("/")}>返回首页</PrimaryButton>
      </div>
    </PageShell>
  );
}
