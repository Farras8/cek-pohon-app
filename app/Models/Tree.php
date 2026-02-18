<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tree extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'company_id',
        'company_name',
        'variant_id',
        'variant_name',
        'planting_date',
        'tagging_date',
        'tagging_by',
        'estate_id',
        'estate_name',
        'division',
        'division_name',
        'block_id',
        'block',
        'tree_number',
        'latitude',
        'longitude',
        'sended_at',
    ];

    public static function generateAssetId(string $division, string $blockId, string $treeNumber): string
    {
        $paddedDivision = str_pad((int) $division, 2, '0', STR_PAD_LEFT);
        $blockPrefix = $paddedDivision === '01' ? 'A' : 'B';
        $blockNumber = preg_replace('/[^0-9]/', '', $blockId);
        $paddedBlockNumber = str_pad($blockNumber, 2, '0', STR_PAD_LEFT);
        return "IPSRES01{$paddedDivision}{$blockPrefix}{$paddedBlockNumber}{$treeNumber}";
    }

    public static function parseAssetId(string $assetId): ?array
    {
        $pattern = '/^IPSRES01(\d{2})([A-B]\d{2})(\d{4})$/';
        
        if (!preg_match($pattern, $assetId, $matches)) {
            return null;
        }

        return [
            'division' => $matches[1],
            'block' => $matches[2],
            'tree_number' => $matches[3],
        ];
    }

    public static function isValidAssetId(string $assetId): bool
    {
        return self::parseAssetId($assetId) !== null;
    }

    public function scopeByDivision($query, string $division)
    {
        return $query->where('division', $division);
    }

    public function scopeByBlock($query, string $block)
    {
        return $query->where('block', $block);
    }
}
