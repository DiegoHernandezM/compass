<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TestQuestion extends Model
{
    protected $table = 'test_questions';

    protected $fillable = [
        'test_id',
        'question_id',
        'question_text',
        'options',
        'correct_answer',
        'user_answer',
        'is_correct',
        'feedback_test',
        'feedback_image',
        'limit_time',
        'type',
    ];

    protected $casts = [
        'options' => 'array',
    ];

    CONST TYPE = [
        'MATEMATICAS' => 'text',
        'ORIENTACION ESPACIAL' => 'text',
        'RAZONAMIENTO LOGICO' => 'image',
        'MEMORIA A CORTO PLAZO - MEMORAMA' => 'image',
        'MEMORIA A CORTO PLAZO - PARAMETROS' => 'text',
        'MULTITASKING' => 'multitask',
        'ATPL' => 'text'
    ];

    public function getFeedbackImageAttribute($value)
    {
        if ($value && Storage::disk('s3')->exists($value)) {
            return Storage::disk('s3')->url($value);
        }
        return null;
    }

    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function multitaskQuestion()
    {
        return $this->belongsTo(MultitaskQuestion::class);
    }
}
