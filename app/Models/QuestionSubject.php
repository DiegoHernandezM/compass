<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionSubject extends Model
{
    protected $table = 'question_subject';

    protected $fillable = [
        'question_id',
        'subject_id',
        'time_limit',
        'question_type_id',
        'question_level_id'
    ];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function multitaskQuestion()
    {
        return $this->belongsTo(MultitaskQuestion::class, 'question_id');
    }
}
