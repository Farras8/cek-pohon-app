<?php

namespace App\Http\Controllers;

use App\Exports\DuplicateCoordinatesExport;
use App\Exports\MissingTreesExport;
use App\Http\Requests\UploadTreeRequest;
use App\Models\UploadedTree;
use App\Services\TreeService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class TreeController extends Controller
{
    public function __construct(
        private TreeService $treeService
    ) {}

    public function dashboard(): Response
    {
        return Inertia::render('Trees/Dashboard', [
            'missingTrees' => $this->treeService->getMissingTreesGroupedByBlock(),
            'duplicateCoordinates' => $this->treeService->getDuplicateCoordinatesGrouped(),
            'totalUploadedTrees' => UploadedTree::count(),
        ]);
    }

    public function missing(): Response
    {
        return Inertia::render('Trees/Missing', [
            'missingTrees' => $this->treeService->getMissingTreesGroupedByBlock(),
        ]);
    }

    public function duplicates(): Response
    {
        return Inertia::render('Trees/Duplicates', [
            'duplicateCoordinates' => $this->treeService->getDuplicateCoordinatesGrouped(),
        ]);
    }

    public function upload(UploadTreeRequest $request): JsonResponse
    {
        try {
            $file = $request->file('file');
            $filePath = $file->getRealPath();

            $result = $this->treeService->processExcelFile($filePath);

            return response()->json([
                'success' => true,
                'message' => 'File processed successfully',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            \Log::error('Upload error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to process file: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function export()
    {
        return Excel::download(new MissingTreesExport, 'missing_trees_' . date('Y-m-d_His') . '.xlsx');
    }

    public function exportDuplicates()
    {
        return Excel::download(new DuplicateCoordinatesExport, 'duplicate_coordinates_' . date('Y-m-d_His') . '.xlsx');
    }

    public function destroy(): JsonResponse
    {
        $this->treeService->clearAllData();

        return response()->json([
            'success' => true,
            'message' => 'All data cleared successfully',
        ]);
    }

    public function deleteSelected(): JsonResponse
    {
        $validated = request()->validate([
            'asset_ids' => 'required|array',
            'asset_ids.*' => 'string',
        ]);

        $deleted = \App\Models\Tree::whereIn('asset_id', $validated['asset_ids'])->delete();

        return response()->json([
            'success' => true,
            'message' => "$deleted tree(s) deleted successfully",
            'deleted_count' => $deleted,
        ]);
    }
}
