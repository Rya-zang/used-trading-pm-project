import { PlaceholderPage } from "./PlaceholderPage.tsx";

export function NotFoundPage() {
  return (
    <PlaceholderPage
      title="这个页面还不存在"
      phase="未开放"
      body="这个地址没有对应的页面。可以返回首页，或用底部导航去找房、室友和合租空间。"
    />
  );
}
