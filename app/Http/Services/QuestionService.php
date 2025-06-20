<?php

namespace App\Http\Services;

use App\Models\Question;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class QuestionService
{
    protected $model;

    public function __construct()
    {
        $this->model = new Question();
    }

    public function getAll()
    {
        return $this->model->orderBy('subject_id')->get();
    }

    public function allBySubject($subjectId)
    {
        return $this->model->where('subject_id', $subjectId)->get();
    }

    public function find($id)
    {
        return $this->model->find($id);
    }

    public function create(array $data)
    {
        if (isset($data['feedback_image'])) {
            // $data['feedback_image'] = $data['feedback_image']->store('feedback', 's3');
            $data['feedback_image'] = 'se/guarda/en/s3';
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
            // Storage::disk('s3')->delete($question->feedback_image);
        }
        $question->delete();
    }
}
