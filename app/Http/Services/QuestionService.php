<?php

namespace App\Http\Services;

use App\Models\Question;
use App\Models\QuestionType;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class QuestionService
{
    protected $model;
    protected $mTypes;

    public function __construct()
    {
        $this->model = new Question();
        $this->mTypes = new QuestionType();
    }

    public function getAll()
    {
        return $this->model->get();
    }

    public function getTypes()
    {
        return $this->mTypes->with(['levels' => function ($query) {
            $query->withCount('questions');
        }])->get();
    }

    public function allBySubject($subjectId)
    {
        $subject = Subject::find($subjectId);
        return $subject->questions;
    }

    public function find($id)
    {
        return $this->model->find($id);
    }

    public function create(array $data)
    {
        if (isset($data['feedback_image'])) {
            $data['feedback_image'] = $data['feedback_image']->store('feedback', 's3');
        }

        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $question = $this->model->find($id);
        if (isset($data['feedback_image'])) {
            if ($question->feedback_image) Storage::disk('s3')->delete($question->feedback_image);
            $data['feedback_image'] = $data['feedback_image']->store('feedback', 's3');
        }
        $question->update($data);
        return $question;
    }

    public function delete($id)
    {
        $question = $this->model->find($id);
        if ($question->feedback_image) {
            Storage::disk('s3')->delete($question->feedback_image);
        }
        $question->delete();
    }
}
