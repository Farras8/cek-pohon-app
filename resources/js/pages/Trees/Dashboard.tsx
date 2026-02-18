import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import FileUploader from '@/components/file-uploader';
import TreeLayout from '@/layouts/tree-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/confirm-modal';
import type { BlockMissingTrees, DuplicateCoordinateGroup } from '@/types';
import { TreePine, MapPinned, AlertTriangle, Trash2, Upload } from 'lucide-react';

interface DashboardProps {
    missingTrees: Record<string, BlockMissingTrees>;
    duplicateCoordinates: DuplicateCoordinateGroup[];
    totalUploadedTrees: number;
}

export default function Dashboard({ missingTrees, duplicateCoordinates, totalUploadedTrees }: DashboardProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleUploadSuccess = () => {
        router.reload();
    };

    const handleClearData = () => {
        router.delete('/trees', {
            onSuccess: () => {
                setShowConfirm(false);
                router.reload();
            },
        });
    };

    const blocks = Object.values(missingTrees);
    const totalMissing = blocks.reduce((sum, block) => sum + block.total, 0);
    const totalBlocks = blocks.length;
    const totalDuplicateGroups = duplicateCoordinates.length;
    const totalDuplicateTrees = duplicateCoordinates.reduce((sum, g) => sum + g.count, 0);
    const hasData = totalUploadedTrees > 0;

    return (
        <TreeLayout>
            <Head title="Dashboard - Cek Pohon" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Overview of tree data analysis</p>
                    </div>
                    {hasData && (
                        <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
                            <Trash2 className="mr-1 size-4" />
                            Clear All Data
                        </Button>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uploaded Trees</CardTitle>
                            <Upload className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUploadedTrees.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total records from Excel</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Missing Trees</CardTitle>
                            <AlertTriangle className="size-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMissing.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Across {totalBlocks} blocks</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Duplicate Coordinates</CardTitle>
                            <MapPinned className="size-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDuplicateGroups}</div>
                            <p className="text-xs text-muted-foreground">{totalDuplicateTrees} trees affected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Affected Blocks</CardTitle>
                            <TreePine className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalBlocks}</div>
                            <p className="text-xs text-muted-foreground">Blocks with issues</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Excel File</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FileUploader onUploadSuccess={handleUploadSuccess} />
                        </CardContent>
                    </Card>

                    {hasData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="size-5 text-destructive" />
                                        <div>
                                            <p className="text-sm font-medium">Missing Trees</p>
                                            <p className="text-xs text-muted-foreground">{totalMissing} trees need attention</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href="/trees/missing">View</a>
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between rounded-lg bg-orange-500/10 px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <MapPinned className="size-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium">Duplicate Coordinates</p>
                                            <p className="text-xs text-muted-foreground">{totalDuplicateGroups} coordinate groups</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href="/trees/duplicates">View</a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ConfirmModal
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleClearData}
                title="Clear All Data"
                message="This will permanently delete all uploaded, missing, and duplicate tree data. This action cannot be undone."
            />
        </TreeLayout>
    );
}
