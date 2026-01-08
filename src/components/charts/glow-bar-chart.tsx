'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface GlowBarChartProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  colors?: string[];
  height?: number;
}

const defaultColors = [
  'hsl(var(--glow-primary))',
  'hsl(var(--glow-accent))',
  'hsl(var(--glow-success))',
  'hsl(var(--glow-warning))',
  'hsl(var(--glow-error))',
];

export function GlowBarChart({ 
  data, 
  dataKey, 
  colors = defaultColors,
  height = 300 
}: GlowBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            if (state?.activeTooltipIndex !== undefined && typeof state.activeTooltipIndex === 'number') {
              setHoveredIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {data.map((_, index) => {
              const color = colors[index % colors.length];
              const gradientId = `gradient-bar-${index}`;
              return (
                <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.15}
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card) / 0.95)',
              border: '1px solid hsl(var(--primary) / 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px hsl(var(--glow-primary) / 0.2)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            itemStyle={{ fontWeight: 500 }}
          />
          <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => {
              const color = colors[index % colors.length];
              const gradientId = `gradient-bar-${index}`;
              const isHovered = hoveredIndex === index;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#${gradientId})`}
                  opacity={isHovered ? 1 : 0.8}
                  style={{
                    filter: isHovered 
                      ? `drop-shadow(0 0 12px ${color}80) drop-shadow(0 4px 16px ${color}50)`
                      : `drop-shadow(0 0 6px ${color}50)`,
                    transition: 'all 0.2s ease',
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
