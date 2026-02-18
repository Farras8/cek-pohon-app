import { Head } from '@inertiajs/react';
import TreeLayout from '@/layouts/tree-layout';
import DuplicateCoordinatesTable from '@/components/duplicate-coordinates-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DuplicateCoordinateGroup } from '@/types';
import { Download, MapPinned } from 'lucide-react';

interface DuplicatesProps {
    duplicateCoordinates: DuplicateCoordinateGroup[];
}

export default function Duplicates({ duplicateCoordinates }: DuplicatesProps) {
    const hasData = duplicateCoordinates.length > 0;
    const totalTrees = duplicateCoordinates.reduce((sum, g) => sum + g.count, 0);

    return (
        <TreeLayout>
            <Head title="Duplicate Coordinates - Cek Pohon" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Duplicate Coordinates</h1>
                        <p className="text-sm text-muted-foreground">
                            Trees sharing the same latitude/longitude position
                        </p>
                    </div>
                    {hasData && (
                        <Button variant="outline" size="sm" asChild>
                            <a href="/trees/export-duplicates">
                                <Download className="mr-1 size-4" />
                                Export Excel
                            </a>
                        </Button>
                    )}
                </div>

                {hasData && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Duplicate Groups</CardTitle>
                                <MapPinned className="size-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{duplicateCoordinates.length}</div>
                                <p className="text-xs text-muted-foreground">Unique coordinate pairs shared by multiple trees</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Trees Affected</CardTitle>
                                <MapPinned className="size-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTrees}</div>
                                <p className="text-xs text-muted-foreground">Total trees with duplicate positions</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {hasData ? (
                    <DuplicateCoordinatesTable data={duplicateCoordinates} />
                ) : (
                    <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
                        <div className="text-center">
                            <h3 className="mb-2 text-lg font-semibold">No Duplicates Found</h3>
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
