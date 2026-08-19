<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayPalUser extends Model
{
    use HasFactory;

    protected $table = 'paypal_user';

    protected $fillable = [
        'user_id',
        'address',
        'amount',
        'payment_id',
        'status',
        'create_time',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'create_time' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
