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
        Schema::create('personal_reports', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();          // "250130037", etc.
            $table->timestamp('opened_at')->nullable();          // "F. de alta"
            $table->timestamp('closed_at')->nullable();          // "F. de cierre"
            $table->string('status')->nullable();                // "En atencion"
            $table->string('assignee')->nullable();              // "Ing. ... "
            $table->string('client')->nullable();                // "GDA", "PRIVADO", etc.
            $table->string('unit')->nullable();                  // "LAB. RUIZ PUEBLA", etc.
            $table->string('contact')->nullable();               // nombre/telefono
            $table->text('description')->nullable();  
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_reports');
    }
};
