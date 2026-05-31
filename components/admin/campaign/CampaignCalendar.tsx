"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CampaignStatus, CampaignType } from "@prisma/client";

interface CampaignEntry {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startsAt: Date | string;
  endsAt: Date | string | null;
  priority: number;
}

const TYPE_COLORS: Record<string, string> = {
  FLASH_SALE: "bg-red-100 text-red-700 border-red-200",
  CART_DISCOUNT: "bg-blue-100 text-blue-700 border-blue-200",
  COUPON: "bg-purple-100 text-purple-700 border-purple-200",
  FREE_SHIPPING: "bg-green-100 text-green-700 border-green-200",
  BUY_X_PAY_Y: "bg-orange-100 text-orange-700 border-orange-200",
  BIRTHDAY: "bg-pink-100 text-pink-700 border-pink-200",
  WIN_BACK: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CASHBACK: "bg-teal-100 text-teal-700 border-teal-200",
};

const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export function CampaignCalendar({ campaigns }: { campaigns: CampaignEntry[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "list">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Pazartesi=0

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

  function getCampaignsForDay(day: number): CampaignEntry[] {
    const date = new Date(year, month, day);
    return campaigns.filter((c) => {
      const start = new Date(c.startsAt);
      const end = c.endsAt ? new Date(c.endsAt) : null;
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
        (!end || date <= new Date(end.getFullYear(), end.getMonth(), end.getDate()));
    });
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-bold text-gray-900 text-lg">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === "month" ? "bg-honey text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Aylık
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === "list" ? "bg-honey text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {view === "month" ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d) => (
              <div key={d} className="px-2 py-3 text-xs font-semibold text-gray-500 text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayCampaigns = day ? getCampaignsForDay(day) : [];
              const isToday = day !== null &&
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === day;

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-2 border-b border-r border-gray-50 ${!day ? "bg-gray-50/30" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? "bg-honey text-white" : "text-gray-600"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayCampaigns.slice(0, 3).map((c) => (
                          <Link
                            key={c.id}
                            href={`/admin/kampanyalar/${c.id}`}
                            className={`block text-[10px] font-medium px-1.5 py-0.5 rounded border truncate ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                          >
                            {c.name}
                          </Link>
                        ))}
                        {dayCampaigns.length > 3 && (
                          <p className="text-[10px] text-gray-400 pl-1">+{dayCampaigns.length - 3} daha</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {campaigns.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">Bu dönemde kampanya yok</p>
            )}
            {campaigns.map((c) => (
              <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  c.status === "ACTIVE" ? "bg-green-400" :
                  c.status === "PAUSED" ? "bg-orange-400" :
                  c.status === "DRAFT" ? "bg-gray-300" : "bg-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <Link href={`/admin/kampanyalar/${c.id}`} className="font-semibold text-gray-900 hover:text-honey-dark text-sm">
                    {c.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(c.startsAt).toLocaleDateString("tr-TR")}
                    {c.endsAt && ` → ${new Date(c.endsAt).toLocaleDateString("tr-TR")}`}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {c.type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renk açıklamaları */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-3">Kampanya Tipleri</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_COLORS).map(([type, className]) => (
            <span key={type} className={`text-[10px] font-medium px-2 py-0.5 rounded border ${className}`}>
              {type.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
