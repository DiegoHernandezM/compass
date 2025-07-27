<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'question_image',
        'answer_a',
        'answer_b',
        'answer_c',
        'answer_d',
        'correct_answer',
        'feedback_text',
        'feedback_image',
        'question_type_id',
        'question_level_id'
    ];

    public function subjects()
    {
    return $this->belongsToMany(Subject::class, 'question_subject');
    }

    public function type()
    {
        return $this->belongsTo(QuestionType::class, 'question_type_id');
    }

    public function level()
    {
        return $this->belongsTo(QuestionLevel::class, 'question_level_id');
    }
}
