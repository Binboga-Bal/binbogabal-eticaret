"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  queryString: string;
}

export function LogExportButton({ queryString }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport(format: "csv" | "json") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs/export?${queryString}&format=${format}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={loading}>
        CSV İndir
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={loading}>
        JSON İndir
      </Button>
    </div>
  );
}
