'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { date: string; clicks: number };

type Props = {
  data: Point[];
  height?: number;
  color?: string;
};

export default function ClicksByDayChart({ data, height = 220, color = '#8e51ff' }: Props) {
  const id = React.useId();
  const gradientId = `fillClicks-${id}`;

  const grid = '#636365';
  const tick = '#000000';
  const tooltipBg = '#000000';
  const tooltipFg = '#FFFFFF';
  const tooltipBorder = '#000000';
  const dotFill = '#ffffff';

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={grid} strokeDasharray="4 4" />

          <XAxis dataKey="date" tickMargin={8} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: tick }} />

          <YAxis
            allowDecimals={false}
            width={32}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: tick }}
            domain={[0, (max: number) => Math.max(2, Math.ceil(max))]} // a little headroom
          />

          <Tooltip
            cursor={{ stroke: grid }}
            formatter={(v: unknown) => [String(v), 'Clicks']}
            labelStyle={{ color: tooltipFg, fontSize: 12, marginBottom: 4 }}
            itemStyle={{ color: tooltipFg, fontSize: 12 }}
            contentStyle={{
              background: tooltipBg,
              color: tooltipFg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              padding: '6px 10px',
            }}
            wrapperStyle={{ outline: 'none', zIndex: 50 }}
          />

          <Area type="monotone" dataKey="clicks" stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} dot={{ r: 3, strokeWidth: 2, fill: dotFill }} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
