const STATUS_CONFIG = {
  ACTIVE: { label: "Aktif", className: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Pasif", className: "bg-gray-100 text-gray-600" },
  SUSPENDED: { label: "Askıda", className: "bg-orange-100 text-orange-700" },
  LOCKED: { label: "Kilitli", className: "bg-red-100 text-red-700" },
  INVITED: { label: "Davetli", className: "bg-blue-100 text-blue-700" },
};

export function UserStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
