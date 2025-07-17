<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Subject extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image',
        'color'
    ];

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtoupper($value);
    }

    public function setDescriptionAttribute($value)
    {
        $this->attributes['description'] = strtoupper($value);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_subject');
    }

    protected function questionsCount()
    {
        return Attribute::get(function () {
            return $this->questions()->count();
        });
    }

    public function tests()
    {
        return $this->hasMany(Test::class);
    }
}
