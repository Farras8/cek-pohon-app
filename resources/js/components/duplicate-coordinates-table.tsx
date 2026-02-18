import { useState, useMemo } from 'react';
import { DuplicateCoordinateGroup } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface DuplicateCoordinatesTableProps {
    data: DuplicateCoordinateGroup[];
}

export default function DuplicateCoordinatesTable({ data }: DuplicateCoordinatesTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBlock, setSelectedBlock] = useState<string>('all');
    const [showCrossBlock, setShowCrossBlock] = useState(false);

    const blockSummary = useMemo(() => {
        const summary: Record<string, { groups: number; trees: number }> = {};
        data.forEach(group => {
            group.trees.forEach(tree => {
                if (!summary[tree.block]) {
                    summary[tree.block] = { groups: 0, trees: 0 };
                }
                summary[tree.block].trees += 1;
            });
            const blocks = new Set(group.trees.map(t => t.block));
            blocks.forEach(block => {
                if (!summary[block]) {
                    summary[block] = { groups: 0, trees: 0 };
                }
                summary[block].groups += 1;
            });
        });
        return Object.entries(summary)
            .sort(([a], [b]) => {
                const numA = parseInt(a.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.replace(/\D/g, '')) || 0;
                return numA - numB;
            });
    }, [data]);

    const crossBlockGroups = data.filter(g => g.is_cross_block);
    const crossBlockCount = crossBlockGroups.length;
    const crossBlockTreeCount = crossBlockGroups.reduce((sum, g) => sum + g.count, 0);

    const filteredData = data.filter(group => {
        if (showCrossBlock && !group.is_cross_block) return false;

        if (selectedBlock !== 'all') {
            const hasBlock = group.trees.some(t => t.block === selectedBlock);
            if (!hasBlock) return false;
        }

        if (searchQuery === '') return true;
        const q = searchQuery.toLowerCase();
        return (
            group.latitude.includes(q) ||
            group.longitude.includes(q) ||
            group.trees.some(tree =>
                tree.asset_id.toLowerCase().includes(q) ||
                tree.block.toLowerCase().includes(q) ||
                tree.tree_number.includes(q)
            )
        );
    });

    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">No duplicate coordinates found. All trees have unique positions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {blockSummary.length > 0 && (
                <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 text-sm font-semibold">Duplicates per Block</h3>
                    <div className="flex flex-wrap gap-2">
                        {blockSummary.map(([block, stats]) => (
                            <button
                                key={block}
                                onClick={() => setSelectedBlock(selectedBlock === block ? 'all' : block)}
                                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${selectedBlock === block
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-card hover:bg-accent'
                                    }`}
                            >
                                {block}
                                <span className="opacity-70">
                                    {stats.groups} groups · {stats.trees} trees
                                </span>
                            </button>
                        ))}
                    </div>

                    {crossBlockCount > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                            <button
                                onClick={() => setShowCrossBlock(!showCrossBlock)}
                                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${showCrossBlock
                                    ? 'border-orange-500 bg-orange-500 text-white'
                                    : 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                    }`}
                            >
                                <AlertTriangle className="size-3" />
                                Cross-Block Duplicates
                                <span className="opacity-80">
                                    {crossBlockCount} groups · {crossBlockTreeCount} trees
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                    placeholder="Search by coordinate, asset ID, block, or tree number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sm:max-w-md"
                />

                {selectedBlock !== 'all' && (
                    <button
                        onClick={() => setSelectedBlock('all')}
                        className="text-xs text-muted-foreground underline hover:text-foreground"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {filteredData.map((group, index) => (
                    <div
                        key={index}
                        className={`rounded-lg border p-4 ${group.is_cross_block
                            ? 'border-orange-300 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/30'
                            : 'border-border'
                            }`}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold font-mono text-sm">
                                    ({group.latitude}, {group.longitude})
                                </h3>
                                {group.is_cross_block && (
                                    <Badge className="bg-orange-500 text-white text-[10px]">
                                        <AlertTriangle className="mr-1 size-3" />
                                        Cross-Block
                                    </Badge>
                                )}
                            </div>
                            <Badge variant="destructive">
                                {group.count} trees
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {group.trees.map(tree => (
                                <div
                                    key={tree.asset_id}
                                    className="flex items-center gap-1.5 rounded bg-muted px-2 py-1"
                                >
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                        {tree.block}
                                    </Badge>
                                    <code className="text-xs font-mono">
                                        {tree.asset_id}
                                    </code>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredData.length === 0 && (
                <div className="rounded-lg border border-border p-8 text-center">
                    <p className="text-muted-foreground">No results found for your search.</p>
                </div>
            )}
        </div>
    );
}
