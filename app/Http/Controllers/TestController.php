<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\TestService;

class TestController extends Controller
{
    protected $sTest;

    public function __construct()
    {
        $this->sTest = new TestService();
    }

    public function saveAnswerNormal(Request $request)
    {
        try {
            $data = $request->validate([
                'test_id'          => ['required','integer'],
                'subject_id'       => ['nullable','integer'],
                'is_correct'       => ['required','in:0,1'],
                'current_question' => ['required','array'],
                'user_answer'      => ['nullable','string','max:10'],
            ]);

            $this->sTest->saveStudentAnswer($data);
            return response()->noContent();
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
