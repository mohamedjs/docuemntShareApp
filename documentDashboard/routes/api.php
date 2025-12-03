<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Load module routes
$modulesPath = base_path('Modules');

// Auth Module Routes
if (file_exists($modulesPath . '/Auth/routes/api.php')) {
    Route::prefix('api')->group($modulesPath . '/Auth/routes/api.php');
}

// Document Module Routes  
if (file_exists($modulesPath . '/Document/routes/api.php')) {
    Route::prefix('api')->group($modulesPath . '/Document/routes/api.php');
}
