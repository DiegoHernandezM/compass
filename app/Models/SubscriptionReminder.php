<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionReminder extends Model
{
    protected $fillable = [
        'paypal_user_id',
        'reminder_date',
        'days_remaining',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }
}
