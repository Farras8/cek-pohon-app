<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadedTree extends Model
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
}
