<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionLevel extends Model
{
    protected $fillable = ['name', 'description', 'question_type_id'];

    public function type()
    {
        return $this->belongsTo(QuestionType::class, 'question_type_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
