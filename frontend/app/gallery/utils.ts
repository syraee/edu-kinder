export type User = { id: number; email: string; role: unknown } | null;

export function getRoleKey(user: User) {
  const roleText =
    typeof (user as any)?.role === "string"
      ? (user as any).role
      : (user as any)?.role?.name ??
        (user as any)?.role?.code ??
        (user as any)?.role?.type ??
        (user as any)?.role?.id ??
        "";
  return String(roleText || "").toUpperCase();
}

export function photoCountLabel(count: number) {
  if (count === 1) return "1 fotka";
  if (count >= 2 && count <= 4) return `${count} fotky`;
  return `${count} fotiek`;
}

export function formatDateSk(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("sk-SK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
