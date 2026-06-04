"use client";

import { useState } from "react";
import { type TelegramAlertConfig } from "@prisma/client";
import { TelegramConfigForm } from "@/components/admin/logs/TelegramConfigForm";

interface Props {
  initialConfigs: TelegramAlertConfig[];
}

export function TelegramPageClient({ initialConfigs }: Props) {
  const [configs, setConfigs] = useState(initialConfigs);

  async function handleRefresh() {
    const res = await fetch("/api/admin/logs/telegram");
    if (res.ok) {
      const data = await res.json();
      setConfigs(data);
    }
  }

  return <TelegramConfigForm configs={configs} onRefresh={handleRefresh} />;
}
