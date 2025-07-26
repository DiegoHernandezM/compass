<?php

namespace App\Http\Services;

use \App\Models\TestQuestion;
use \App\Models\Test;
use \App\Models\QuestionSubject;

class TestQuestionService
{
    protected $mTestQuestion;
    protected $mTest;
    protected $mQuestionSubject;

    public function __construct()
    {
        $this->mTestQuestion = new TestQuestion();
        $this->mTest = new Test();
        $this->mQuestionSubject = new QuestionSubject();
    }

    public function createOrFindTest($userId, $subjectId)
    {
        dd($subjectId);
        $existingTest = $this->mTest->where('user_id', $userId)
            ->where('subject_id', $subjectId)
            ->where('is_completed', false)
            ->with('testQuestions')
            ->first();
        if ($existingTest) {
            return $existingTest;
        }
        $test = $this->mTest->create([
            'user_id' => $userId,
            'subject_id' => $subjectId,
            'is_completed' => false,
            'progress' => 0,
        ]);
        
        $questionSubjects = $this->mQuestionSubject
            ->where('subject_id', $subjectId)
            ->with('question')
            ->inRandomOrder()
            ->get();

        foreach ($questionSubjects as $qs) {
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
                'question_text' => $question->question,
                'options' => json_encode($options),
                'correct_answer' => $question->correct_answer,
                'feedback_text' => $question->feedback_text,
                'feedback_image' => $question->feedback_image,
                'user_answer' => null
            ]);
        }

        return $test->load('testQuestions');
    }

    public function findTest($test)
    {
        return $this->mTest->find($test);
    }
}
