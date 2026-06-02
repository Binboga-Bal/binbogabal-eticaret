export function RiskScoreBadge({ score }: { score: number }) {
  let className = "bg-gray-100 text-gray-600";
  let label = "Düşük";

  if (score >= 80) { className = "bg-red-100 text-red-700"; label = "Kritik"; }
  else if (score >= 50) { className = "bg-orange-100 text-orange-700"; label = "Yüksek"; }
  else if (score >= 25) { className = "bg-yellow-100 text-yellow-700"; label = "Orta"; }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {score > 0 && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {score} — {label}
    </span>
  );
}
