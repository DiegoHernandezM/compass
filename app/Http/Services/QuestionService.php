<?php

namespace App\Http\Services;

use App\Models\Question;
use App\Models\QuestionType;
use App\Models\Subject;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use App\Imports\QuestionsImport;
use App\Imports\SpatialQuestionsImport;
use App\Imports\LogicalReasoningImport;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\MultitaskQuestion;
use App\Models\QuestionLevel;
use App\Models\MemoryTest;
use App\Models\MemoryIcon;
use App\Models\QuestionSubject;

class QuestionService
{
    protected $model;
    protected $mTypes;
    protected $mLevels;
    protected $mMultitaskQuestions;
    protected $mSubject;
    protected $mMemoryTest;
    protected $mQuestionSubject;

    public function __construct()
    {
        $this->model = new Question();
        $this->mTypes = new QuestionType();
        $this->mMultitaskQuestions = new MultitaskQuestion();
        $this->mSubject = new Subject();
        $this->mLevels = new QuestionLevel();
        $this->mMemoryTest = new MemoryTest();
        $this->mQuestionSubject = new QuestionSubject();
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
        $subject = $this->mSubject->find($data['subject_id']);
        $subject->question_type = $type->name;
        $subject->save();
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
        } elseif ($type->name === 'MEMORIA A CORTO PLAZO - MEMORAMA') {
            return $this->mMemoryTest->create([
                'subject_id' => $data['subject_id'],
                'question_type_id' => $data['question_type_id'],
                'question_level_id' => $data['question_level_id'],
                'questions_counts' => $data['question_count'],
                'time_limit' => $data['has_time_limit'] ? $data['time_limit'] : null,
            ]);
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
        return $questions;
    }

    public function importTypeQuestions($typeId, $levelId, $file)
    {
        $type = $this->mTypes->find($typeId);
        $level = $levelId ? $this->mLevels->find($levelId) : null;
        $name = $type->name;

        $importMap = [
            'ORIENTACION ESPACIAL' => 'importSpatial',
            'RAZONAMIENTO LOGICO' => 'importLogical',
            'MEMORIA A CORTO PLAZO - PARAMETROS' => 'importParameters',
            'ATPL' => 'importAtpl',
        ];

        if (!isset($importMap[$name])) {
            throw new \Exception("Importación no soportada para el tipo: {$name}");
        }

        return $this->{$importMap[$name]}($type, $file, $level);
    }

    private function extractImagesByRow($file, $folder)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();

        $imagesByRow = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates();
            $row = (int) preg_replace('/[^0-9]/', '', $coordinates);

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

            $s3Path = Storage::disk('s3')->putFile($folder, $tmpPath);
            $imagesByRow[$row] = $s3Path;

            @unlink($tmpPath);
        }

        return $imagesByRow;
    }

    private function extractImages($file, $baseFolder)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();

        $imagesByKey = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates(); // Ej: B3
            $column = preg_replace('/[0-9]/', '', $coordinates); // B
            $row = preg_replace('/[^0-9]/', '', $coordinates);   // 3

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

            $s3Path = Storage::disk('s3')->putFile($baseFolder, $tmpPath);
            @unlink($tmpPath);

            $columnKey = match (strtoupper($column)) {
                'A' => "question_{$row}",
                'B' => "a_{$row}",
                'C' => "b_{$row}",
                'D' => "c_{$row}",
                'E' => "d_{$row}",
                default => null,
            };

            if ($columnKey) {
                $imagesByKey[$columnKey] = $s3Path;
            }
        }

        return $imagesByKey;
    }

    public function getByTypeSubject($typeId, $levelId)
    {
        $type = $this->mTypes->findOrFail($typeId);
        if ($type->bypass_levels_and_questions) {
            return MemoryIcon::where('question_type_id', $typeId)->get();
        }

        if ($type->name === 'MULTITASKING') {
            return $this->mMultitaskQuestions->where('question_type_id', $typeId)
                ->where('question_level_id', $levelId)
                ->get();
        }

        return $this->model->where('question_type_id', $typeId)
            ->where('question_level_id', $levelId)
            ->get();
    }

    public function checkIfExist($subject, $level, $type)
    {
        $findType = $this->mTypes->findOrFail($type);
        if ($findType->bypass_levels_and_questions) {
            return $this->mMemoryTest
                ->where(subject_id, $subject)
                ->where(question_type_id, $type)
                ->where(question_level_id, $level)
                ->firts();
        }
        if ($findType->name === 'MULTITASKING') {
            return $this->mQuestionSubject->where('subject_id', $subject)
                    ->whereHas('multitaskQuestion', function ($query) use ($type, $level) {
                        $query->where('question_type_id', $type)
                            ->where('question_level_id', $level);
                    })
                    ->get();
        }
            return $this->mQuestionSubject->where('subject_id', $subject)
                    ->whereHas('question', function ($query) use ($type, $level) {
                        $query->where('question_type_id', $type)
                            ->where('question_level_id', $level);
                    })
                    ->get();
    }


    private function importAtpl($type, $file, $level)
    {
        $imagesByRow = $this->extractImagesByRow($file, 'atpl/feedback');
        $importer = new QuestionsImport($type->id, $imagesByRow);
        Excel::import($importer, $file);
        return true;
    }

    private function importSpatial($type, $file, $level)
    {
        $imagesByRow = $this->extractImages($file, 'spatial/questions');
        $importer = new SpatialQuestionsImport($type->id, $level->id, $imagesByRow);
        Excel::import($importer, $file);
        return true;
    }

    private function importLogical($type, $file, $level)
    {
        $imagesByRow = $this->extractImages($file, 'logical/questions');
        $importer = new LogicalReasoningImport($type->id, $level->id, $imagesByRow);
        Excel::import($importer, $file);
        return true;
    }

}
