<?php

namespace App\Exports;

use App\Models\Tree;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class MissingTreesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Tree::all()->map(function ($tree) {
            return [
                'Company ID' => $tree->company_id,
                'Company Name' => $tree->company_name,
                'Asset ID' => $tree->asset_id,
                'Variant ID' => $tree->variant_id,
                'Variant Name' => $tree->variant_name,
                'Planting Date' => $tree->planting_date,
                'Tagging Date' => $tree->tagging_date,
                'Tagging By' => $tree->tagging_by,
                'Estate ID' => $tree->estate_id,
                'Estate Name' => $tree->estate_name,
                'Division ID' => $tree->division,
                'Division Name' => $tree->division_name,
                'Block ID' => $tree->block_id,
                'Block Name' => $tree->block,
                'Tree Number' => $tree->tree_number,
                'Latitude' => $tree->latitude,
                'Longitude' => $tree->longitude,
                'Sended At' => $tree->sended_at,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Company ID',
            'Company Name',
            'Asset ID',
            'Variant ID',
            'Variant Name',
            'Planting Date',
            'Tagging Date',
            'Tagging By',
            'Estate ID',
            'Estate Name',
            'Division ID',
            'Division Name',
            'Block ID',
            'Block Name',
            'Tree Number',
            'Latitude',
            'Longitude',
            'Sended At',
        ];
    }
}
