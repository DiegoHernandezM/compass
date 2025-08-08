<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use App\Models\Question;

class SpatialQuestionsImport implements ToCollection, WithHeadingRow
{
    private int $typeId;
    private int $levelId;
    private array $imagesByRow;

    public function __construct(int $typeId, int $levelId, array $imagesByRow = [])
    {
        $this->typeId = $typeId;
        $this->levelId = $levelId;
        $this->imagesByRow = $imagesByRow;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 por encabezado

            // IMÁGENES (si existen)
            $questionImage = $this->imagesByRow["question_image_{$rowNumber}"] ?? null;
            $answerAImg    = $this->imagesByRow["answer_a_{$rowNumber}"] ?? null;
            $answerBImg    = $this->imagesByRow["answer_b_{$rowNumber}"] ?? null;
            $answerCImg    = $this->imagesByRow["answer_c_{$rowNumber}"] ?? null;
            $answerDImg    = $this->imagesByRow["answer_d_{$rowNumber}"] ?? null;
            $feedbackImage = $this->imagesByRow["feedback_image_{$rowNumber}"] ?? null; // <- OJO: con guion bajo

            // TEXTO (fallback si no hay imagen en esa celda)
            $questionText = $row['question'] ?? null;

            $answerA = $answerAImg ?: ($row['answer_a'] ?? null);
            $answerB = $answerBImg ?: ($row['answer_b'] ?? null);
            $answerC = $answerCImg ?: ($row['answer_c'] ?? null);
            $answerD = $answerDImg ?: ($row['answer_d'] ?? null);

            Question::create([
                'question'           => $questionText,
                'question_image'     => $questionImage,
                'answer_a'           => $answerA,
                'answer_b'           => $answerB,
                'answer_c'           => $answerC,
                'answer_d'           => $answerD,
                'correct_answer'     => strtoupper($row['correct_answer']),
                'feedback_text'      => $row['feedback_text'] ?? null, // no forzaría mayúsculas si es texto explicativo
                'feedback_image'     => $feedbackImage,
                'question_type_id'   => $this->typeId,
                'question_level_id'  => $this->levelId,
            ]);
        }
    }
}
