<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Test extends Model
{

    protected $fillable = [
        'user_id',
        'subject_id',
        'question_subject_id',
        'is_completed',
        'progress',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function testQuestions()
    {
        return $this->hasMany(TestQuestion::class);
    }

    public function questionSubject()
    {
        return $this->belongsTo(QuestionSubject::class);
    }
}
