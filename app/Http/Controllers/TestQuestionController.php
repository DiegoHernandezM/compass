<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Services\TestQuestionService;
use Inertia\Inertia;
use App\Http\Services\SubjectService;

class TestQuestionController extends Controller
{
    protected $service;
    protected $sSubject;

    public function __construct()
    {
        $this->service = new TestQuestionService();
        $this->sSubject = new SubjectService();
    }

    public function createTest(Request $request)
    {
        try {
            $userId = Auth::id();
            $subjectId = $request->input('subject_id');
            $test = $this->service->createOrFindTest($userId, $subjectId);
            return response()->json([
                'success' => true,
                'test' => ['test' => $test],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
        
    }

    public function getTest($test, $subjectId)
    {
        $test = $this->service->findTest($test);
        $subject = $this->sSubject->findSubject($subjectId);
        return Inertia::render('Student/Test/Index', [
            'test' => $test->load('testQuestions'),
            'subject' => $subject
        ]);
    }
}
