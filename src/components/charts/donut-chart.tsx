'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  showLabel?: boolean;
}

const defaultColors = [
  'hsl(var(--glow-primary))',
  'hsl(var(--glow-accent))',
  'hsl(var(--glow-success))',
  'hsl(var(--glow-warning))',
  'hsl(var(--glow-error))',
];

export function DonutChart({ 
  data, 
  colors = defaultColors,
  height = 300
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={90}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                style={{
                  filter: `drop-shadow(0 0 8px ${colors[index % colors.length]}50)`,
                }}
              />
            ))}
          </Pie>
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
          {/* Center value and label */}
          <text 
            x="50%" 
            y="45%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fill="hsl(var(--foreground))"
            fontSize="32"
            fontWeight="300"
          >
            {total}
          </text>
          <text 
            x="50%" 
            y="55%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize="12"
            fontWeight="500"
            style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Total
          </text>
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
