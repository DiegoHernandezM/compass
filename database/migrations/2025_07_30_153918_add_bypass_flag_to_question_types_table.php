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
        Schema::table('question_types', function (Blueprint $table) {
            $table->boolean('bypass_levels_and_questions')->default(false)->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_types', function (Blueprint $table) {
            $table->dropColumn('bypass_levels_and_questions');
        });
    }
};
