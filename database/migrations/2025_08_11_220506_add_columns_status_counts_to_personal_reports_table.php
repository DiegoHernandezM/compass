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
        Schema::table('personal_reports', function (Blueprint $table) {
            $table->boolean('active')->default(false);
            $table->integer('count')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_reports', function (Blueprint $table) {
            $table->dropColumn(['status', 'count']);
        });
    }
};
