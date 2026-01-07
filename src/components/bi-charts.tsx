'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';


interface ChartProps {
    data: Record<string, unknown>[];
    title: string;
    type: 'line' | 'bar' | 'area';
    color?: string;
}

export function BIChart({ data, title, type, color = '#a855f7' }: ChartProps) {
    const isLine = type === 'line';
    const isBar = type === 'bar';

    return (
        <div className="glass-panel p-6 w-full h-[400px] min-h-[400px] flex flex-col space-y-4 neon-glow overflow-hidden material-entrance">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: color }} />
                </div>
            </div>

            <div className="flex-1 w-full relative min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    {isLine ? (
                        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#ffffff60"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#ffffff60"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#ffffff20' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={3}
                                dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#0a0a1a' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    ) : isBar ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: '#ffffff05' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={color} fillOpacity={0.9} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`colorValue-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#ffffff60" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid #ffffff20', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fillOpacity={1}
                                fill={`url(#colorValue-${title.replace(/\s+/g, '-')})`}
                                strokeWidth={2}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
