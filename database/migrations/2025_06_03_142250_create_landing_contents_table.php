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
        Schema::create('landing_contents', function (Blueprint $table) {
            $table->id();
            $table->string('main_title')->nullable(); // Bienvenido Capitán
            $table->string('subtitle')->nullable();   // Aviation In Sight
            $table->text('principal_text')->nullable();
            $table->string('compatible_text')->nullable();

            $table->string('lower_title')->nullable(); // En Aviation In Sight podrás...
            $table->string('lower_text_1')->nullable();
            $table->string('lower_text_2')->nullable();
            $table->string('lower_text_3')->nullable();
            $table->string('lower_text_4')->nullable();

            $table->string('video_path')->nullable(); // Ruta del video en storage
            $table->string('subscribe_button')->nullable();
            $table->string('login_button')->nullable();
            $table->string('whatsapp_number')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_contents');
    }
};
