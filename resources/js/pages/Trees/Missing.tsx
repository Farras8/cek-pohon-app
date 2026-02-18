import { Head } from '@inertiajs/react';
import TreeLayout from '@/layouts/tree-layout';
import TreesTable from '@/components/trees-table';
import TreesSummary from '@/components/trees-summary';
import { Button } from '@/components/ui/button';
import type { BlockMissingTrees } from '@/types';
import { Download } from 'lucide-react';

interface MissingProps {
    missingTrees: Record<string, BlockMissingTrees>;
}

export default function Missing({ missingTrees }: MissingProps) {
    const hasData = Object.keys(missingTrees).length > 0;

    return (
        <TreeLayout>
            <Head title="Missing Trees - Cek Pohon" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Missing Trees</h1>
                        <p className="text-sm text-muted-foreground">
                            Trees not found in the uploaded data sequence
                        </p>
                    </div>
                    {hasData && (
                        <Button variant="outline" size="sm" asChild>
                            <a href="/trees/export">
                                <Download className="mr-1 size-4" />
                                Export Excel
                            </a>
                        </Button>
                    )}
                </div>

                {hasData ? (
                    <div className="space-y-6">
                        <TreesSummary data={missingTrees} />
                        <TreesTable data={missingTrees} />
                    </div>
                ) : (
                    <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold">No Data</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload an Excel file from the Dashboard first
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </TreeLayout>
    );
}
