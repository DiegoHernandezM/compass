<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionType extends Model
{
    protected $fillable = ['name', 'description'];

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
