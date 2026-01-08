'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  color?: string;
  height?: number;
  showDots?: boolean;
}

export function Sparkline({ 
  data, 
  dataKey, 
  color = 'hsl(var(--glow-primary))',
  height = 40,
  showDots = false
}: SparklineProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={showDots ? { fill: color, r: 4 } : false}
            activeDot={{ r: 5, fill: color }}
            style={{
              filter: `drop-shadow(0 0 8px ${color}70) drop-shadow(0 0 16px ${color}40)`,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card) / 0.95)',
              border: '1px solid hsl(var(--primary) / 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 12px hsl(var(--glow-primary) / 0.15)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
