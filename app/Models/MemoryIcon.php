<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoryIcon extends Model
{
    protected $fillable = ['icon_name', 'question_type_id'];

    public function questionType()
    {
        return $this->belongsTo(QuestionType::class);
    }
}
