#!/bin/bash

# Document Editor Laravel Setup Script

echo "Setting up Document Editor Laravel Backend..."

# Copy environment file
cp .env.docker .env

# Generate application key
php artisan key:generate

# Install required packages
composer require tymon/jwt-auth
composer require nwidart/laravel-modules
composer require jeroennoten/laravel-adminlte

# Publish JWT configuration
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

# Generate JWT secret
php artisan jwt:secret

# Publish AdminLTE assets
php artisan adminlte:install

# Publish Laravel Modules configuration
php artisan vendor:publish --provider="Nwidart\Modules\LaravelModulesServiceProvider"

# Create modules
php artisan module:make Auth
php artisan module:make Document

# Run migrations
php artisan migrate

echo "Laravel backend setup complete!"
