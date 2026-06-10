export function getOrderDateRange(preset: string | undefined | null) {
  if (!preset || preset === "all") return undefined;
  const now = new Date();
  switch (preset) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: start, lte: new Date(start.getTime() + 86400000) };
    }
    case "7d":
      return { gte: new Date(now.getTime() - 7 * 86400000) };
    case "30d":
      return { gte: new Date(now.getTime() - 30 * 86400000) };
    case "month":
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    default:
      return undefined;
  }
}
