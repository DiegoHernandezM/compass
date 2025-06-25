<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToCollection, WithHeadingRow
{
    private int $subjectId;
    private array $imagesByRow;

    public function __construct(int $subjectId, array $imagesByRow = [])
    {
        $this->subjectId = $subjectId;
        $this->imagesByRow = $imagesByRow;
    }

    public function collection(\Illuminate\Support\Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if (!$row['question']) continue;

            $rowNumber = $index + 2; // Porque el encabezado está en la fila 1
            $imagePath = $this->imagesByRow[$rowNumber] ?? null;

            $data = [
                'subject_id' => $this->subjectId,
                'question' => $row['question'],
                'answer_a' => $row['answer_a'],
                'answer_b' => $row['answer_b'],
                'answer_c' => $row['answer_c'],
                'answer_d' => $row['answer_d'],
                'correct_answer' => strtoupper($row['correct_answer']),
                'feedback_text' => $row['feedback_text'] ?? null,
                'feedback_image' => $imagePath, // Aquí guardamos la URL
                'has_dynamic' => filter_var($row['has_dynamic'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ];

            Question::create($data);
        }
    }
}
