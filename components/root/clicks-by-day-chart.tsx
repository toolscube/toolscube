'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { date: string; clicks: number };

export default function ClicksByDayChart({ data, height = 220 }: { data: Point[]; height?: number }) {
  return (
    <div className="h-[220px] w-full md:h-[240px]">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopOpacity={0.5} />
              <stop offset="100%" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="date" tickMargin={6} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={30} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8 }} labelStyle={{ fontSize: 12 }} formatter={(v) => [String(v), 'Clicks']} />
          <Area type="monotone" dataKey="clicks" stroke="currentColor" fill="url(#fillClicks)" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
