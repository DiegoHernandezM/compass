<?php

namespace App\Http\Services;

use App\Models\Question;
use App\Models\QuestionType;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

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

    public function allSaveTest($request)
    {
        $data = $request->only([
            'subject_id',
            'question_type_id',
            'question_level_id',
            'question_count',
            'has_time_limit',
            'time_limit',
        ]);
        $questions = $this->model->where('question_type_id', $data['question_type_id'])
            ->where('question_level_id', $data['question_level_id'])
            ->inRandomOrder()
            ->limit($data['question_count'])
            ->get();
        if ($questions->count() < $data['question_count']) {
            return "No hay suficientes preguntas disponibles para este tipo y nivel.";
        }

        // Guarda en la tabla pivote question_subject
        foreach ($questions as $question) {
            DB::table('question_subject')->insert([
                'question_id' => $question->id,
                'subject_id' => $data['subject_id'],
                'time_limit' => $data['has_time_limit'] ? $data['time_limit'] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        return $questions;
    }
}
