<?php

namespace App\Http\Services;

use \App\Models\TestQuestion;
use \App\Models\Test;
use \App\Models\QuestionSubject;
use \App\Models\Subject;
use \App\Models\MemoryTest;
use \App\Models\MemoryIcon;
use Illuminate\Support\Facades\Storage;

class TestQuestionService
{
    protected $mTestQuestion;
    protected $mTest;
    protected $mQuestionSubject;
    protected $mSubject;
    protected $mMTests;
    protected $mIcons;

    public function __construct()
    {
        $this->mTestQuestion = new TestQuestion();
        $this->mTest = new Test();
        $this->mQuestionSubject = new QuestionSubject();
        $this->mSubject = new Subject();
        $this->mMTests = new MemoryTest();
        $this->mIcons = new MemoryIcon();
    }

    public function createOrFindTest($userId, $subjectId, $levelId)
    {
        $subject = $this->mSubject->find($subjectId);
        $existingTest = $this->mTest->where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->where('question_level_id', $levelId)
            ->where('is_completed', false)
            ->with('testQuestions')
            ->with('subject')
            ->first();
        
        if ($existingTest) {
            return $existingTest;
        }
        
        $test = $this->mTest->create([
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'is_completed' => false,
            'question_level_id' => $levelId,
            'progress' => 0,
        ]);
        
        if($subject->question_type === 'MULTITASKING') {
            return $this->createMultitaskTest($test, $subjectId, $levelId);
        } elseif($subject->question_type === 'MEMORIA A CORTO PLAZO - MEMORAMA') {
            return $this->createMemoryTest($test, $subjectId, $levelId);
        }
        
        $questionSubjects = $this->mQuestionSubject
            ->where('subject_id', $subjectId)
            ->where('question_level_id', $levelId)
            ->with('question')
            ->inRandomOrder()
            ->get();

        foreach ($questionSubjects as $qs) {
            $time = $qs->time_limit;
            $question = $qs->question;
            $options = [
                'a' => $question->answer_a, 
                'b' => $question->answer_b, 
                'c' => $question->answer_c, 
                'd' => $question->answer_d,
            ];

            $this->mTestQuestion->create([
                'test_id' => $test->id,
                'question_id' => $question->id,
                'question_text' => $question->question ?? $question->question_image,
                'options' => json_encode($options),
                'correct_answer' => $question->correct_answer,
                'feedback_text' => $question->feedback_text ?? null,
                'feedback_image' => $question->feedback_image ?? null,
                'limit_time' => $time ?? null,
                'user_answer' => null,
                'type' => $question->question === null ? 'image' : 'text',
            ]);
        }
        return $test->load('testQuestions');
    }

    public function findTest($test)
    {
        return $this->mTest->with('subject')->find($test);
    }

    public function createMultitaskTest($test, $subjectId, $levelId)
    {
        $questionSubjects = $this->mQuestionSubject
            ->where('subject_id', $subjectId)
            ->where('question_level_id', $levelId)
            ->with('multitaskQuestion')
            ->inRandomOrder()
            ->get();
        foreach ($questionSubjects as $qs) {
            $question = $qs->multitaskQuestion;
            if (!$question) {
                continue;
            }
            $options = [
                'a' => $question->option_a,
                'b' => $question->option_b,
                'c' => $question->option_c,
            ];
            $this->mTestQuestion->create([
                'test_id'         => $test->id,
                'question_id'     => $question->id,
                'question_text'   => $question->question,
                'options'         => json_encode($options),
                'correct_answer'  => $question->answer,
                'feedback_text'   => null,
                'feedback_image'  => null,
                'user_answer'     => null,
                'type'            => $question->type,
            ]);
        }
        return $test->load('testQuestions');
    }

    public function createMemoryTest($test, $subject, $levelId)
    { 
        $settings = $this->mMTests
            ->where('subject_id', $subject)
            ->where('question_level_id', $levelId)
            ->first();
        if (!$settings) {
            throw new \Exception('No hay configuración de memorama para esta materia.');
        }
        $icons = $this->mIcons
            ->where('question_type_id', $settings->question_type_id)
            ->pluck('name')
            ->toArray();

        if (count($icons) < $settings->questions_counts) {
            throw new \Exception('No hay suficientes íconos disponibles para generar el test.');
        }

        for ($i = 0; $i < $settings->questions_counts; $i++) {
            $iconsToRemember = collect($icons)->shuffle()->take($this->getIconsCountByLevel($settings->question_level_id))->values()->all();
            $iconString = implode(',', $iconsToRemember);

            $this->mTestQuestion->create([
                'test_id' => $test->id,
                'question_id' => null,
                'question_text' => $iconString,
                'options' => $iconString,
                'correct_answer' => $iconString,
                'feedback_text'   => null,
                'feedback_image'  => null,
                'user_answer'     => null,
                'type'            => null,
            ]);
        }
        return $test->load('testQuestions');
    }

    private function getIconsCountByLevel($levelId)
    {
        return match($levelId) {
            11 => 3,
            12 => 4,
            13 => 5,
            default => 3,
        };
    }

    private function getOptionUrl($value, $isImage)
    {
        if (!$value) return null;
        return $isImage ? Storage::disk('s3')->url($value) : $value;
    }

}
