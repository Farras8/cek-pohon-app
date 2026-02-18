<?php

use App\Http\Controllers\TreeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [TreeController::class, 'dashboard'])->name('home');

Route::get('/trees', [TreeController::class, 'dashboard'])->name('trees.dashboard');
Route::get('/trees/missing', [TreeController::class, 'missing'])->name('trees.missing');
Route::get('/trees/duplicates', [TreeController::class, 'duplicates'])->name('trees.duplicates');
Route::post('/trees/upload', [TreeController::class, 'upload'])->name('trees.upload');
Route::get('/trees/export', [TreeController::class, 'export'])->name('trees.export');
Route::get('/trees/export-duplicates', [TreeController::class, 'exportDuplicates'])->name('trees.export-duplicates');
Route::delete('/trees', [TreeController::class, 'destroy'])->name('trees.destroy');

require __DIR__.'/settings.php';
