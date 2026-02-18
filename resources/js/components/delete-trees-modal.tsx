import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

interface TreeItem {
    tree_number: string;
    asset_id: string;
}

interface DeleteTreesModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: (assetIds: string[]) => void;
    blockName: string;
    division: string;
    trees: TreeItem[];
}

export default function DeleteTreesModal({ open, onClose, onDelete, blockName, division, trees }: DeleteTreesModalProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const allSelected = selected.size === trees.length && trees.length > 0;

    const toggleTree = (assetId: string) => {
        const next = new Set(selected);
        if (next.has(assetId)) {
            next.delete(assetId);
        } else {
            next.add(assetId);
        }
        setSelected(next);
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(trees.map(t => t.asset_id)));
        }
    };

    const handleDelete = () => {
        onDelete(Array.from(selected));
        setSelected(new Set());
    };

    const handleClose = () => {
        setSelected(new Set());
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Delete Missing Trees — {blockName} (Div {division})
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                        <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleAll}
                            id="select-all"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer flex-1">
                            Select All ({trees.length} trees)
                        </label>
                    </div>

                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                        {trees.map(tree => (
                            <div
                                key={tree.asset_id}
                                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                            >
                                <Checkbox
                                    checked={selected.has(tree.asset_id)}
                                    onCheckedChange={() => toggleTree(tree.asset_id)}
                                    id={tree.asset_id}
                                />
                                <label htmlFor={tree.asset_id} className="cursor-pointer flex-1 font-mono text-xs">
                                    {tree.asset_id}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={selected.size === 0}
                    >
                        <Trash2 className="mr-1 size-4" />
                        Delete {selected.size > 0 ? `(${selected.size})` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
