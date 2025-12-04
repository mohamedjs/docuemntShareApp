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
    require $modulesPath . '/Auth/routes/api.php';
}

// Document Module Routes  
if (file_exists($modulesPath . '/Document/routes/api.php')) {
    require $modulesPath . '/Document/routes/api.php';
}
