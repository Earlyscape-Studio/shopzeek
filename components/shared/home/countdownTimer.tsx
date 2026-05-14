// components/storefront/home/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";

type Props = { endsAt: string };

export function CountdownTimer({ endsAt }: Props) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`
      );
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded font-mono">
      {timeLeft}
    </span>
  );
}