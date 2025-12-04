<?php

use Illuminate\Support\Facades\Route;
use Modules\Document\App\Http\Controllers\DocumentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('documents')->group(function () {
    Route::get('/', [DocumentController::class, 'index']);
    Route::post('/', [DocumentController::class, 'store']);
    Route::get('/{id}', [DocumentController::class, 'show']);
    Route::put('/{id}', [DocumentController::class, 'update']);
    Route::delete('/{id}', [DocumentController::class, 'destroy']);
    
    // Collaborators
    Route::post('/{id}/collaborators', [DocumentController::class, 'addCollaborator']);
    Route::delete('/{id}/collaborators/{userId}', [DocumentController::class, 'removeCollaborator']);
    
    // Versions
    Route::get('/{id}/versions', [DocumentController::class, 'versions']);
    Route::post('/{id}/versions/{versionId}/restore', [DocumentController::class, 'restoreVersion']);
    
    // Share Links
    Route::post('/{id}/share', [DocumentController::class, 'generateShareLink']);
    Route::delete('/{id}/share', [DocumentController::class, 'revokeShareLink']);
});

// Public share link access (no auth required)
Route::get('/share/{token}', [DocumentController::class, 'getByShareToken']);
Route::put('/share/{token}', [DocumentController::class, 'updateByShareToken']);
