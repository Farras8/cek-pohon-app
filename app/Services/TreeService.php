<?php

namespace App\Services;

use App\Models\Tree;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use App\Models\UploadedTree;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TreeService
{
    public function processExcelFile(string $filePath): array
    {
        ini_set('memory_limit', '512M');

        $excelData = $this->isHtmlFile($filePath)
            ? $this->readHtmlFile($filePath)
            : $this->readExcelFile($filePath);

        // Save all uploaded rows
        $this->saveUploadedTrees($excelData);

        // Find and save missing trees
        $groupedByBlock = $this->groupTreesByBlock($excelData);
        $missingTrees = $this->findMissingTrees($groupedByBlock, $excelData);
        $missingResult = $this->saveMissingTrees($missingTrees);

        // Count duplicate coordinates
        $duplicateCount = $this->getDuplicateCoordinatesGrouped()->count();

        return array_merge($missingResult, [
            'duplicate_coordinates' => $duplicateCount,
        ]);
    }

    private function getColumnValue($row, array $keys)
    {
        foreach ($keys as $key) {
            if (isset($row[$key])) {
                return $row[$key];
            }
        }
        return null;
    }

    private function convertExcelDate($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            try {
                $dateTime = Date::excelToDateTimeObject($value);
                return $dateTime->format('d/m/Y H:i:s');
            } catch (\Exception $e) {
                return (string) $value;
            }
        }

        return (string) $value;
    }

    private function isHtmlFile(string $filePath): bool
    {
        $content = file_get_contents($filePath, false, null, 0, 1024);
        $trimmed = ltrim($content);
        return str_starts_with($trimmed, '<') && (
            stripos($trimmed, '<html') !== false ||
            stripos($trimmed, '<table') !== false ||
            stripos($trimmed, '<!DOCTYPE') !== false
        );
    }

    private function readHtmlFile(string $filePath): Collection
    {
        $content = file_get_contents($filePath);

        $content = mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8');

        $dom = new \DOMDocument();
        @$dom->loadHTML($content, LIBXML_NOERROR | LIBXML_NOWARNING);

        $tables = $dom->getElementsByTagName('table');
        if ($tables->length === 0) {
            throw new \Exception('No tables found in the uploaded HTML file.');
        }

        $table = $tables->item(0);
        $rows = $table->getElementsByTagName('tr');

        $headers = [];
        $data = [];

        foreach ($rows as $rowIndex => $row) {
            $cells = $row->getElementsByTagName($rowIndex === 0 ? 'th' : 'td');

            if ($cells->length === 0) {
                $cells = $row->getElementsByTagName('td');
            }

            $rowData = [];
            foreach ($cells as $cell) {
                $rowData[] = trim($cell->textContent);
            }

            if (empty(array_filter($rowData))) {
                continue;
            }

            if (empty($headers)) {
                $headers = array_map(function ($header) {
                    return strtolower(str_replace(' ', '_', trim($header)));
                }, $rowData);
                continue;
            }

            if (count($rowData) === count($headers)) {
                $data[] = array_combine($headers, $rowData);
            }
        }

        \Log::info('HTML columns:', $headers);
        \Log::info('HTML total rows:', ['count' => count($data)]);

        $collection = collect($data)->map(fn($row) => collect($row));

        return $this->mapRowsToTreeData($collection);
    }

    private function readExcelFile(string $filePath): Collection
    {
        $data = Excel::toCollection(new class implements ToCollection, WithHeadingRow {
            public function collection(Collection $collection)
            {
            }
        }, $filePath)->first();

        \Log::info('Excel columns:', $data->first() ? $data->first()->keys()->toArray() : []);
        \Log::info('Total rows:', ['count' => $data->count()]);

        return $this->mapRowsToTreeData($data);
    }

    private function formatCoordinate($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $str = (string) $value;

        // Already contains dots (e.g. from HTML source) — keep as-is
        if (str_contains($str, '.')) {
            return $str;
        }

        // Raw numeric without dots — re-insert dots every 3 digits from the right
        // e.g. 39416609 → 39.416.609, 966994526 → 966.994.526
        $reversed = strrev($str);
        $chunks = str_split($reversed, 3);
        return strrev(implode('.', $chunks));
    }

    private function mapRowsToTreeData(Collection $data): Collection
    {
        return $data->filter(function ($row) {
            $hasAssetId = isset($row['asset_id']) || isset($row['asset id']) || isset($row['assetid']);
            $hasDivision = isset($row['division_id']) || isset($row['division id']) || isset($row['divisionid']) || isset($row['division']);
            $hasBlock = isset($row['block_name']) || isset($row['block name']) || isset($row['blockname']) || isset($row['block']);
            $hasBlockId = isset($row['block_id']) || isset($row['block id']) || isset($row['blockid']);

            return $hasAssetId && $hasDivision && $hasBlock && $hasBlockId;
        })->map(function ($row) {
            $assetId = $this->getColumnValue($row, ['asset_id', 'asset id', 'assetid']);
            $rawDivision = $this->getColumnValue($row, ['division_id', 'division id', 'divisionid', 'division']);
            $division = str_pad((int) $rawDivision, 2, '0', STR_PAD_LEFT);
            $block = $this->getColumnValue($row, ['block_name', 'block name', 'blockname', 'block']);
            $blockId = $this->getColumnValue($row, ['block_id', 'block id', 'blockid']);

            $parsed = Tree::parseAssetId($assetId);

            return [
                'asset_id' => $assetId,
                'company_id' => $this->getColumnValue($row, ['company_id', 'company id', 'companyid']),
                'company_name' => $this->getColumnValue($row, ['company_name', 'company name', 'companyname']),
                'variant_id' => $this->getColumnValue($row, ['variant_id', 'variant id', 'variantid']),
                'variant_name' => $this->getColumnValue($row, ['variant_name', 'variant name', 'variantname']),
                'planting_date' => $this->convertExcelDate($this->getColumnValue($row, ['planting_date', 'planting date', 'plantingdate'])),
                'tagging_date' => $this->convertExcelDate($this->getColumnValue($row, ['tagging_date', 'tagging date', 'taggingdate'])),
                'tagging_by' => $this->getColumnValue($row, ['tagging_by', 'tagging by', 'taggingby']),
                'estate_id' => $this->getColumnValue($row, ['estate_id', 'estate id', 'estateid']),
                'estate_name' => $this->getColumnValue($row, ['estate_name', 'estate name', 'estatename']),
                'division' => $division,
                'division_name' => $this->getColumnValue($row, ['division_name', 'division name', 'divisionname']),
                'block_id' => $blockId,
                'block' => $block,
                'tree_number' => $parsed ? $parsed['tree_number'] : null,
                'latitude' => $this->formatCoordinate($this->getColumnValue($row, ['latitude', 'lat'])),
                'longitude' => $this->formatCoordinate($this->getColumnValue($row, ['longitude', 'lng', 'long'])),
                'sended_at' => $this->convertExcelDate($this->getColumnValue($row, ['created_at', 'created at', 'createdat'])),
            ];
        })->filter(fn($item) => $item['tree_number'] !== null);
    }

    private function saveUploadedTrees(Collection $excelData): void
    {
        UploadedTree::truncate();

        $records = $excelData->map(function ($row) {
            return array_merge($row, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        foreach ($records->chunk(500) as $chunk) {
            UploadedTree::insert($chunk->toArray());
        }
    }

    private function groupTreesByBlock(Collection $trees): Collection
    {
        return $trees->groupBy(fn($tree) => $tree['division'] . '::' . $tree['block'])->map(function ($blockTrees) {
            return [
                'block' => $blockTrees->first()['block'],
                'block_id' => $blockTrees->first()['block_id'],
                'division' => $blockTrees->first()['division'],
                'numbers' => $blockTrees->pluck('tree_number')->map(fn($n) => (int)$n)->sort()->values(),
            ];
        });
    }

    private function findMissingTrees(Collection $groupedTrees, Collection $allExcelData): Collection
    {
        $missing = collect();

        $blockSamples = $allExcelData->groupBy(fn($row) => $row['division'] . '::' . $row['block'])->map(fn($rows) => $rows->first());

        foreach ($groupedTrees as $blockData) {
            $numbers = $blockData['numbers'];
            
            if ($numbers->isEmpty()) {
                continue;
            }

            $min = $numbers->first();
            $max = $numbers->last();
            $existing = $numbers->flip();

            $divBlockKey = $blockData['division'] . '::' . $blockData['block'];
            $sample = $blockSamples[$divBlockKey] ?? [];

            for ($i = $min; $i <= $max; $i++) {
                if (!$existing->has($i)) {
                    $treeNumber = str_pad($i, 4, '0', STR_PAD_LEFT);
                    $missing->push([
                        'company_id' => $sample['company_id'] ?? null,
                        'company_name' => $sample['company_name'] ?? null,
                        'variant_id' => $sample['variant_id'] ?? null,
                        'variant_name' => $sample['variant_name'] ?? null,
                        'planting_date' => null,
                        'tagging_date' => null,
                        'tagging_by' => null,
                        'estate_id' => $sample['estate_id'] ?? null,
                        'estate_name' => $sample['estate_name'] ?? null,
                        'division' => $blockData['division'],
                        'division_name' => $sample['division_name'] ?? null,
                        'block_id' => $blockData['block_id'],
                        'block' => $blockData['block'],
                        'tree_number' => $treeNumber,
                        'latitude' => null,
                        'longitude' => null,
                        'sended_at' => null,
                    ]);
                }
            }
        }

        return $missing;
    }

    private function saveMissingTrees(Collection $missingTrees): array
    {
        Tree::truncate();

        $records = $missingTrees->map(function ($tree) {
            return array_merge($tree, [
                'asset_id' => Tree::generateAssetId(
                    $tree['division'],
                    $tree['block_id'],
                    $tree['tree_number']
                ),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        foreach ($records->chunk(500) as $chunk) {
            Tree::insert($chunk->toArray());
        }

        return [
            'total_missing' => $records->count(),
            'by_block' => $records->groupBy(fn($r) => $r['division'] . '::' . $r['block'])->map->count(),
        ];
    }

    public function getMissingTreesGroupedByBlock(): Collection
    {
        return Tree::all()
            ->groupBy(fn($tree) => $tree->division . '::' . $tree->block)
            ->map(function ($trees) {
                return [
                    'block' => $trees->first()->block,
                    'division' => $trees->first()->division,
                    'total' => $trees->count(),
                    'trees' => $trees->sortBy('tree_number')->map(fn($tree) => [
                        'tree_number' => $tree->tree_number,
                        'asset_id' => $tree->asset_id,
                    ])->values(),
                ];
            });
    }

    /**
     * Get trees with duplicate lat/lng coordinates, grouped by coordinate pair.
     */
    public function getDuplicateCoordinatesGrouped(): Collection
    {
        $trees = UploadedTree::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('latitude', '!=', '')
            ->where('longitude', '!=', '')
            ->get();

        return $trees->groupBy(function ($tree) {
            return $tree->latitude . ',' . $tree->longitude;
        })->filter(function ($group) {
            return $group->count() > 1;
        })->map(function ($group, $coordKey) {
            $parts = explode(',', $coordKey);
            $blocks = $group->pluck('block')->unique();
            return [
                'latitude' => $parts[0],
                'longitude' => $parts[1],
                'count' => $group->count(),
                'is_cross_block' => $blocks->count() > 1,
                'trees' => $group->map(fn($tree) => [
                    'asset_id' => $tree->asset_id,
                    'block' => $tree->block,
                    'block_id' => $tree->block_id,
                    'division' => $tree->division,
                    'tree_number' => $tree->tree_number,
                ])->values(),
            ];
        })->values();
    }

    public function clearAllData(): void
    {
        Tree::truncate();
        UploadedTree::truncate();
    }
}
