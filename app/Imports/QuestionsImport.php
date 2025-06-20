<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Request;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToCollection, WithHeadingRow
{
    protected $subjectId;

    public function __construct($subjectId)
    {
        $this->subjectId = $subjectId;
    }

    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if (!$row['question']) continue;

            $exists = Question::where('subject_id', $this->subjectId)
                ->where('question', $row['question'])
                ->exists();

            if ($exists) continue;

            $data = [
                'subject_id' => $this->subjectId,
                'question' => $row['question'],
                'answer_a' => $row['answer_a'],
                'answer_b' => $row['answer_b'],
                'answer_c' => $row['answer_c'],
                'answer_d' => $row['answer_d'],
                'correct_answer' => strtoupper($row['correct_answer']),
                'feedback_text' => $row['feedback_text'] ?? null,
                'has_dynamic' => filter_var($row['has_dynamic'], FILTER_VALIDATE_BOOLEAN),
            ];

            $fileName = trim($row['feedback_image'] ?? '');
            if ($fileName && Request::hasFile('images')) {
                foreach (Request::file('images') as $file) {
                    if ($file->getClientOriginalName() === $fileName) {
                        $data['feedback_image'] = $file->store('feedback', 's3');
                        break;
                    }
                }
            }
            Question::create($data);
        }
    }
}
