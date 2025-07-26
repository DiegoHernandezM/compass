<?php

namespace App\Http\Services;

use App\Models\Question;
use App\Models\QuestionType;
use App\Models\Subject;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use App\Imports\QuestionsImport;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\MultitaskQuestion;

class QuestionService
{
    protected $model;
    protected $mTypes;
    protected $mMultitaskQuestions;
    protected $mSubject;

    public function __construct()
    {
        $this->model = new Question();
        $this->mTypes = new QuestionType();
        $this->mMultitaskQuestions = new MultitaskQuestion();
        $this->mSubject = new Subject();
    }

    public function getAll()
    {
        return $this->model->get();
    }

    public function getTypes()
    {
        return $this->mTypes->with([
            'levels' => function ($query) {
                $query->withCount('questions')
                    ->withCount('multitaskQuestions');
            }
        ])
        ->withCount('questions', 'multitaskQuestions')
        ->get()
        ->map(function ($type) {
            if ($type->name === 'MULTITASKING') {
                $type->questions_count = intval(($type->multitask_questions_count ?? 0) / 2);
                $type->levels->each(function ($level) {
                    $level->questions_count = intval(($level->multitask_questions_count ?? 0) / 2);
                });
            }
            return $type;
        });
    }

    public function allBySubject($subjectId)
    {
        $subject = $this->mSubject->findOrFail($subjectId);

        $isMultitask = $subject->question_type === 'MULTITASKING';
        $questions = $isMultitask ? $subject->multitaskQuestions : $subject->questions;
        $subject->questions = $questions;

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
            'game'
        ]);
        $type = $this->mTypes->find($data['question_type_id']);
        if ($type->name === 'MULTITASKING') {
            $total = (int) $data['question_count'] * 2;
            $half = (int) ceil($total / 2); 
            $mathQuestions = $this->mMultitaskQuestions
                ->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->where('type', 'math')
                ->inRandomOrder()
                ->limit($half)
                ->get();
            $figureQuestions = $this->mMultitaskQuestions
                ->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->where('type', 'figure')
                ->inRandomOrder()
                ->limit($total - $mathQuestions->count())
                ->get();
            $questions = $mathQuestions->concat($figureQuestions)->shuffle();
        } else {
            $questions = $this->model->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->inRandomOrder()
                ->limit($data['question_count'])
                ->get();
        }
        
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
        $subject = $this->mSubject->find($data['subject_id']);
        $subject->question_type = $type->name;
        $subject->save();
        return $questions;
    }

    public function importTypeQuestions($typeId, $levelId, $file)
    {
        $type = $this->mTypes->find($typeId);
        //Aqui va la distribucion para el tipo de examen
        switch ($type->name) {
            case 'ORIENTACION ESPACIAL':
                # code...
                break;
            case 'RAZONAMIENTO LOGICO':
                # code...
                break;
            case 'MEMORIA A CORTO PLAZO - MEMORAMA':
                # code...
                break;
            case 'MEMORIA A CORTO PLAZO - PARAMETROS':
                # code...
                break;
            case 'MULTITASKING':
                # code...
                break;
            case 'ATPL':
                return $this->importAtpl($type, $file);
                break;
            default:
                # code...
                break;
        }

    }

    private function importAtpl($type, $file)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();
        // Subir imágenes y asociarlas con la fila
        $imagesByRow = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates();
            $row = preg_replace('/[^0-9]/', '', $coordinates);

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

            $s3Path = Storage::disk('s3')->putFile('feedback', $tmpPath);
            $imagesByRow[(int)$row] = $s3Path;

            @unlink($tmpPath);
        }

        // Pasa las imágenes al importador
        $importer = new QuestionsImport($type->id, $imagesByRow);
        Excel::import($importer, $file);
        return true;
    }
}
