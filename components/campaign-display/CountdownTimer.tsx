"use client";

import { useState, useEffect } from "react";

interface Props {
  endsAt: Date | string;
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ endsAt, className = "" }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds, expired: false });
    }

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.expired) {
    return <span className={`text-red-500 font-bold text-xs ${className}`}>Sona erdi</span>;
  }

  return (
    <div className={`flex items-center gap-1 font-mono font-bold ${className}`}>
      {timeLeft.hours > 0 && (
        <>
          <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>
          <span className="text-gray-600 text-xs">s</span>
        </>
      )}
      <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>
      <span className="text-gray-600 text-xs">dk</span>
      <span className="bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
      <span className="text-gray-600 text-xs">sn</span>
    </div>
  );
}
