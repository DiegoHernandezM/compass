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
        Schema::table('questions', function (Blueprint $t) {
            $t->string('signature', 128)->nullable();
            $t->unique('signature');
            $t->string('q_hash', 64)->nullable();
            $t->string('a_hash', 64)->nullable();
            $t->string('b_hash', 64)->nullable();
            $t->string('c_hash', 64)->nullable();
            $t->string('d_hash', 64)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $t) {
            $t->dropColumn('signature');
            $t->dropColumn('q_hash');
            $t->dropColumn('a_hash');
            $t->dropColumn('b_hash');
            $t->dropColumn('c_hash');
            $t->dropColumn('d_hash');
        });
    }
};
