<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
