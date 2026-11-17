import { avatarOf, type AvatarId, type Gender } from "../domain/catalog.ts";

const sizes = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
} as const;

const portraits: Record<string, string> = {
  "sprout-female": "/home/portrait-sprout.jpg",
  "sprout-male": "/home/portrait-sprout.jpg",
  "sun-male": "/home/portrait-sun.jpg",
  "sun-female": "/home/portrait-sun.jpg",
  "tea-female": "/home/portrait-tea.jpg",
  "tea-male": "/home/portrait-tea.jpg",
  "house-female": "/home/portrait-house-f.jpg",
  "house-male": "/home/portrait-house-m.jpg",
  "book-female": "/home/portrait-book-f.jpg",
  "book-male": "/home/portrait-book-m.jpg",
  "moon-other": "/home/portrait-moon.jpg",
  "moon-female": "/home/portrait-moon.jpg",
  "moon-male": "/home/portrait-moon.jpg",
  "fish-male": "/home/portrait-fish.jpg",
  "fish-female": "/home/portrait-fish.jpg",
  "cloud-female": "/home/portrait-cloud.jpg",
  "cloud-male": "/home/portrait-cloud.jpg",
};

export function Avatar({
  id,
  size = "md",
  gender,
}: {
  id: AvatarId;
  size?: keyof typeof sizes;
  gender?: Gender | null;
}) {
  const avatar = avatarOf(id);
  const src = (gender && portraits[`${id}-${gender}`]) || portraits[`${id}-female`] || portraits[`${id}-male`] || "/home/portrait-sprout.jpg";
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-full ${sizes[size]}`} role="img" aria-label={avatar.label}>
      <img src={src} alt="" className="h-full w-full object-cover" />
    </span>
  );
}
