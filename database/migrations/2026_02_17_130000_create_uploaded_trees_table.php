<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('uploaded_trees', function (Blueprint $table) {
            $table->id();
            $table->string('asset_id');
            $table->string('company_id')->nullable();
            $table->string('company_name')->nullable();
            $table->string('variant_id')->nullable();
            $table->string('variant_name')->nullable();
            $table->string('planting_date')->nullable();
            $table->string('tagging_date')->nullable();
            $table->string('tagging_by')->nullable();
            $table->string('estate_id')->nullable();
            $table->string('estate_name')->nullable();
            $table->string('division', 10)->nullable();
            $table->string('division_name')->nullable();
            $table->string('block_id', 10)->nullable();
            $table->string('block', 50)->nullable();
            $table->string('tree_number', 10);
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->string('sended_at')->nullable();
            $table->timestamps();

            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('uploaded_trees');
    }
};
