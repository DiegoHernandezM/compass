<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingContent extends Model
{
    protected $fillable = [
        'main_title',
        'subtitle',
        'principal_text',
        'compatible_text',
        'lower_title',
        'lower_text_1',
        'lower_text_2',
        'lower_text_3',
        'lower_text_4',
        'video_path',
        'subscribe_button',
        'login_button',
        'whatsapp_number',
        'subscription_price',
    ];
}
