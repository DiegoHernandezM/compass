<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalReport extends Model
{
    protected $table = 'personal_reports';
    protected $fillable = [
        'ticket_number','opened_at','closed_at','status','assignee',
        'client','unit','contact','description','source_filename',
        'sheet_index','row_index',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];
}
