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
        Schema::table('question_subject', function (Blueprint $table) {
            $table->foreignId('question_type_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_level_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_subject', function (Blueprint $table) {
            $table->dropForeign(['question_type_id']);
            $table->dropForeign(['question_level_id']);
            $table->dropColumn('question_type_id');
            $table->dropColumn('question_level_id');
        });
    }
};
