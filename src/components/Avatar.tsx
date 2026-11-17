import { avatarOf, type AvatarId } from "../domain/catalog.ts";

const sizes = {
  sm: "h-10 w-10 text-lg",
  md: "h-14 w-14 text-2xl",
  lg: "h-20 w-20 text-4xl",
} as const;

export function Avatar({
  id,
  size = "md",
}: {
  id: AvatarId;
  size?: keyof typeof sizes;
}) {
  const avatar = avatarOf(id);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${sizes[size]} ${avatar.className}`}
      role="img"
      aria-label={avatar.label}
    >
      {avatar.emoji}
    </span>
  );
}
