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

    public function import($file, $subjectId)
    {
        $rows = Excel::toCollection(null, $file)[0];

        foreach ($rows as $index => $row) {
            if (!$row['question']) {
                continue;
            }

            $exists = Question::where('subject_id', $subjectId)
                ->where('question', $row['question'])
                ->exists();

            if ($exists) {
                continue;
            }

            $data = [
                'subject_id' => $subjectId,
                'question' => $row['question'],
                'answer_a' => $row['answer_a'],
                'answer_b' => $row['answer_b'],
                'answer_c' => $row['answer_c'],
                'answer_d' => $row['answer_d'],
                'correct_answer' => strtoupper($row['correct_answer']),
                'feedback_text' => $row['feedback_text'] ?? null,
                'has_dynamic' => filter_var($row['has_dynamic'], FILTER_VALIDATE_BOOLEAN),
            ];

            if (request()->hasFile("images.{$index}")) {
                $image = request()->file("images.{$index}");
                $data['feedback_image'] = $image->store('feedback', 's3');
            }

            $this->model->create($data);
        }
    }
}
