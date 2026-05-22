"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ProductTabsProps {
  description: string;
  shortDescription: string;
}

const tabs = [
  { id: "description", label: "Ürün Açıklaması" },
  { id: "beekeeper", label: "Hangi Balcıdan" },
];

export function ProductTabs({ description, shortDescription }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div>
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-honey-dark text-honey-dark"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-h-96 overflow-y-auto">
        {activeTab === "description" && (
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: description || shortDescription }}
          />
        )}
        {activeTab === "beekeeper" && (
          <div className="text-sm text-gray-600 space-y-3">
            <p>Bu ürün 745 Sayılı Kozan Bal Tarım Satış Kooperatifi üyesi arıcılarımız tarafından üretilmektedir.</p>
            <p>Ürünümüz Toroslar bölgesinde, doğal alanlardan elde edilen nektarlardan üretilmiştir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
