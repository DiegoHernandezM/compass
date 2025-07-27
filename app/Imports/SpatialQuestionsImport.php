<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use App\Models\Question;

class SpatialQuestionsImport implements ToCollection
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
            $rowNumber = $index + 2; // +2 por encabezado en Excel
            $questionImage = $this->imagesByRow["question_{$rowNumber}"] ?? null;
            $answerAImage = $this->imagesByRow["a_{$rowNumber}"] ?? null;
            $answerBImage = $this->imagesByRow["b_{$rowNumber}"] ?? null;
            $answerCImage = $this->imagesByRow["c_{$rowNumber}"] ?? null;

            // Construcción del texto de la pregunta si aplica
            $questionText = $row['question'] ?? '';

            Question::create([
                'question' => $questionText,
                'question_image' => $questionImage,
                'answer_a' => $answerAImage,
                'answer_b' => $answerBImage,
                'answer_c' => $answerCImage,
                'correct_answer' => strtoupper($row['correct_answer']),
                'question_type_id' => $this->typeId,
                'question_level_id' => $this->levelId,
            ]);
        }
    }
}
