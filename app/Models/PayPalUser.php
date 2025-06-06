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
        'expires_at'
    ];

    public function user()
    {
        return $this->belongTo(User::class);
    }
}
