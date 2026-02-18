import { useState } from 'react';
import { BlockMissingTrees } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TreesTableProps {
    data: Record<string, BlockMissingTrees>;
}

export default function TreesTable({ data }: TreesTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDivision, setSelectedDivision] = useState<string>('all');

    const blocks = Object.values(data).sort((a, b) => {
        const divCompare = a.division.localeCompare(b.division);
        if (divCompare !== 0) return divCompare;
        const numA = parseInt(a.block.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.block.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    const filteredBlocks = blocks.filter(block => {
        const matchesDivision = selectedDivision === 'all' || block.division === selectedDivision;
        const matchesSearch = searchQuery === '' ||
            block.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
            block.trees.some(tree => tree.tree_number.includes(searchQuery) || tree.asset_id.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesDivision && matchesSearch;
    });

    const divisions = Array.from(new Set(blocks.map(b => b.division))).sort();

    if (blocks.length === 0) {
        return (
            <div className="rounded-lg border border-border p-12 text-center">
                <p className="text-muted-foreground">No missing trees data. Upload an Excel file to begin.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                    placeholder="Search by block or tree number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sm:max-w-xs"
                />

                <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger className="sm:w-40">
                        <SelectValue placeholder="Division" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Divisions</SelectItem>
                        {divisions.map(div => (
                            <SelectItem key={div} value={div}>
                                Division {div}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                {filteredBlocks.map(block => (
                    <div key={`${block.division}::${block.block}`} className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Block {block.block}</h3>
                                <Badge variant="secondary">
                                    Division {block.division}
                                </Badge>
                            </div>
                            <Badge variant="destructive">
                                {block.total} missing
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {block.trees.map(tree => (
                                <code
                                    key={tree.tree_number}
                                    className="rounded bg-muted px-2 py-1 text-xs font-mono"
                                    title={`Tree #${tree.tree_number}`}
                                >
                                    {tree.asset_id}
                                </code>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredBlocks.length === 0 && (
                <div className="rounded-lg border border-border p-8 text-center">
                    <p className="text-muted-foreground">No results found for your search.</p>
                </div>
            )}
        </div>
    );
}
