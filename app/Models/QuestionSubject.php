<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionSubject extends Model
{
    protected $table = 'question_subject';

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
