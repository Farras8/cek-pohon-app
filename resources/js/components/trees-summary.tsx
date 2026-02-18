import { BlockMissingTrees } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, AlertTriangle, Layers } from 'lucide-react';

interface TreesSummaryProps {
    data: Record<string, BlockMissingTrees>;
}

export default function TreesSummary({ data }: TreesSummaryProps) {
    const blocks = Object.values(data);
    const totalMissing = blocks.reduce((sum, block) => sum + block.total, 0);
    const totalBlocks = blocks.length;
    const divisions = Array.from(new Set(blocks.map(b => b.division))).length;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Missing Trees</CardTitle>
                    <AlertTriangle className="size-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalMissing}</div>
                    <p className="text-xs text-muted-foreground">
                        Trees not found in uploaded data
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Affected Blocks</CardTitle>
                    <Layers className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalBlocks}</div>
                    <p className="text-xs text-muted-foreground">
                        Blocks with missing trees
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Divisions</CardTitle>
                    <TreePine className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{divisions}</div>
                    <p className="text-xs text-muted-foreground">
                        Total divisions processed
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
