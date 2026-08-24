<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('question_types')
            ->where('name', 'MATEMATICAS')
            ->update(['is_automatic' => false]);
    }

    public function down(): void
    {
        DB::table('question_types')
            ->where('name', 'MATEMATICAS')
            ->update(['is_automatic' => true]);
    }
};
