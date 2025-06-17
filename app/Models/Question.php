<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id', 'question', 'answer_a', 'answer_b', 'answer_c', 'answer_d',
        'correct_answer', 'feedback_text', 'feedback_image', 'has_dynamic'
    ];

    public function subject() {
        return $this->belongsTo(Subject::class);
    }
}
