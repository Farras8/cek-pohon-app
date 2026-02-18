import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BlockMissingTrees } from '@/types';

interface MissingTreesChartProps {
    data: Record<string, BlockMissingTrees>;
}

export default function MissingTreesChart({ data }: MissingTreesChartProps) {
    const chartData = useMemo(() => {
        return Object.values(data)
            .map(block => ({
                name: `${block.division === '01' ? 'A' : 'B'}${block.block.replace(/\D/g, '').padStart(2, '0')}`,
                block: block.block,
                division: block.division,
                missing: block.total,
            }))
            .sort((a, b) => {
                const divCompare = a.division.localeCompare(b.division);
                if (divCompare !== 0) return divCompare;
                const numA = parseInt(a.block.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.block.replace(/\D/g, '')) || 0;
                return numA - numB;
            });
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No missing trees data to display.
            </div>
        );
    }

    const getBarColor = (division: string) => {
        return division === '01'
            ? 'hsl(152, 60%, 40%)'
            : 'hsl(152, 60%, 55%)';
    };

    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 700 }}
                    height={30}
                    className="fill-muted-foreground"
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                    formatter={(value: number | undefined) => [`${value ?? 0} trees`, 'Missing']}
                />
                <Bar dataKey="missing" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry.division)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
