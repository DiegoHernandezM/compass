<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionType extends Model
{
    protected $fillable = ['name', 'description', 'bypass_levels_and_questions', 'is_automatic'];

    public function levels()
    {
        return $this->hasMany(QuestionLevel::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function multitaskQuestions()
    {
        return $this->hasMany(MultitaskQuestion::class);
    }
}
