'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface GradientAreaChartProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  color?: string;
  height?: number;
}

export function GradientAreaChart({ 
  data, 
  dataKey, 
  color = 'hsl(var(--glow-primary))',
  height = 300 
}: GradientAreaChartProps) {
  const gradientId = `gradient-${dataKey}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="50%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
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
            itemStyle={{ color: color, fontWeight: 500 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            style={{
              filter: `drop-shadow(0 0 8px ${color}50)`,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
