<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paypal_user_id')->constrained('paypal_user')->cascadeOnDelete();
            $table->date('reminder_date');
            $table->unsignedTinyInteger('days_remaining');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->unique(['paypal_user_id', 'reminder_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_reminders');
    }
};
