<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

    public function getQuestionImageAttribute($value)
    {
        if ($value && Storage::disk('s3')->exists($value)) {
            return Storage::disk('s3')->url($value);
        }
        return null;
    }

    public function getAnswerAAttribute($value)
    {
        return $this->shouldReturnS3Url($value) ? Storage::disk('s3')->url($value) : $value;
    }

    public function getAnswerBAttribute($value)
    {
        return $this->shouldReturnS3Url($value) ? Storage::disk('s3')->url($value) : $value;
    }

    public function getAnswerCAttribute($value)
    {
        return $this->shouldReturnS3Url($value) ? Storage::disk('s3')->url($value) : $value;
    }

    public function getAnswerDAttribute($value)
    {
        return $this->shouldReturnS3Url($value) ? Storage::disk('s3')->url($value) : $value;
    }

    private function shouldReturnS3Url($value)
    {
        return is_null($this->question) &&
            !is_null($this->question_image) &&
            $value &&
            Storage::disk('s3')->exists($value);
    }

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
