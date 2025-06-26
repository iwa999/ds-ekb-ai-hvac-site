"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LiveTicker() {
  const { data } = useSWR("/api/stats", fetcher, { refreshInterval: 15_000 });
  if (!data) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-white text-gray-900 rounded-xl shadow-lg p-4 w-72 z-50">
      <p className="text-sm font-semibold mb-1">
        {data.count24h} заявок за 24 ч
      </p>

      <ul className="h-16 overflow-hidden animate-marquee space-y-1 text-xs leading-tight">
        {data.latest.map((l: any, i: number) => (
          <li key={i}>{l.service} для {l.name ?? "клиент"}</li>
        ))}
      </ul>
    </div>
  );
}
