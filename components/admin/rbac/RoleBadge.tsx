export function RoleBadge({ name, color }: { name: string; color?: string | null }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color ?? "#6b7280" }}
    >
      {name}
    </span>
  );
}
