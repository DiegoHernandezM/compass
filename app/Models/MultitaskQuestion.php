<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MultitaskQuestion extends Model
{
    protected $fillable = [
        'question',
        'answer', 
        'option_a',
        'option_b',
        'option_c',
        'type',
        'question_type_id',
        'question_level_id'
    ];

    public const TYPES = [
        'math' => 'math',
        'figure' => 'figure',
    ];

    public function type()
    {
        return $this->belongsTo(QuestionType::class, 'question_type_id');
    }

    public function level()
    {
        return $this->belongsTo(QuestionLevel::class, 'question_level_id');
    }
}
