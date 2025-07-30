<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemoryTest extends Model
{
    protected $table = 'memory_tests';
    protected $fillable = [
        'subject_id',
        'question_type_id',
        'question_level_id',
        'questions_counts',
        'time_limit',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
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
