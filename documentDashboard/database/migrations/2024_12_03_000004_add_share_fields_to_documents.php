<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('share_token', 64)->nullable()->unique()->after('content');
            $table->boolean('is_share_enabled')->default(false)->after('share_token');
            $table->enum('share_permission', ['view', 'edit'])->default('edit')->after('is_share_enabled');
            $table->timestamp('share_expires_at')->nullable()->after('share_permission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['share_token', 'is_share_enabled', 'share_permission', 'share_expires_at']);
        });
    }
};
