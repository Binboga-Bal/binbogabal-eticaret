export default function LogsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 w-28 animate-pulse rounded-lg bg-slate-200" />
        ))}
      </div>
      <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-96 animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}
