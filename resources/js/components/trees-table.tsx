import { useState } from 'react';
import { router } from '@inertiajs/react';
import { BlockMissingTrees } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DeleteTreesModal from '@/components/delete-trees-modal';
import ResultModal from '@/components/result-modal';
import { Trash2 } from 'lucide-react';
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
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; block: BlockMissingTrees | null }>({ open: false, block: null });
    const [resultModal, setResultModal] = useState<{ open: boolean; success: boolean; message: string }>({ open: false, success: false, message: '' });

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

    const handleDelete = async (assetIds: string[]) => {
        try {
            const response = await fetch('/trees/delete-selected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ asset_ids: assetIds }),
            });

            const result = await response.json();

            if (result.success) {
                setDeleteModal({ open: false, block: null });
                setResultModal({ open: true, success: true, message: result.message });
                router.reload();
            } else {
                setResultModal({ open: true, success: false, message: result.message || 'Failed to delete trees' });
            }
        } catch {
            setResultModal({ open: true, success: false, message: 'An error occurred while deleting trees' });
        }
    };

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
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">
                                    {block.total} missing
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteModal({ open: true, block })}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
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

            {deleteModal.block && (
                <DeleteTreesModal
                    open={deleteModal.open}
                    onClose={() => setDeleteModal({ open: false, block: null })}
                    onDelete={handleDelete}
                    blockName={deleteModal.block.block}
                    division={deleteModal.block.division}
                    trees={deleteModal.block.trees}
                />
            )}

            <ResultModal
                open={resultModal.open}
                onClose={() => setResultModal({ ...resultModal, open: false })}
                type={resultModal.success ? 'success' : 'error'}
                title={resultModal.success ? 'Deleted' : 'Error'}
                message={resultModal.message}
            />
        </div>
    );
}
