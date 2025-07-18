<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToCollection, WithHeadingRow
{
    private int $typeId;
    private array $imagesByRow;

    public function __construct(int $typeId, array $imagesByRow = [])
    {
        $this->typeId = $typeId;
        $this->imagesByRow = $imagesByRow;
    }

    public function collection(\Illuminate\Support\Collection $rows)
    {
        foreach ($rows as $index => $row) {
            if (!$row['question']) continue;
    
            $rowNumber = $index + 2;
            $newImagePath = $this->imagesByRow[$rowNumber] ?? null;
    
            // Buscar pregunta por texto
            $existing = Question::where('question', $row['question'])->first();
    
            if ($existing) {
                // Si hay una imagen antigua y NO hay imagen nueva → eliminar
                if ($existing->feedback_image && !$newImagePath) {
                    Storage::disk('s3')->delete($existing->feedback_image);
                    $existing->feedback_image = null;
                }
    
                // Si hay imagen nueva y EXISTÍA una → eliminar la vieja
                if ($newImagePath && $existing->feedback_image && $newImagePath !== $existing->feedback_image) {
                    Storage::disk('s3')->delete($existing->feedback_image);
                    $existing->feedback_image = $newImagePath;
                }
    
                // Si hay imagen nueva y no tenía imagen antes
                if ($newImagePath && !$existing->feedback_image) {
                    $existing->feedback_image = $newImagePath;
                }
    
                // Actualiza campos
                $existing->update([
                    'answer_a' => $row['answer_a'],
                    'answer_b' => $row['answer_b'],
                    'answer_c' => $row['answer_c'],
                    'answer_d' => $row['answer_d'],
                    'correct_answer' => strtoupper($row['correct_answer']),
                    'feedback_text' => $row['feedback_text'] ?? null,
                    'question_type_id' => $this->typeId,
                    // feedback_image ya se actualizó arriba si aplica
                ]);
            } else {
                // Crear nueva
                Question::create([
                    'question_type_id' => $this->typeId,
                    'question' => $row['question'],
                    'answer_a' => $row['answer_a'],
                    'answer_b' => $row['answer_b'],
                    'answer_c' => $row['answer_c'],
                    'answer_d' => $row['answer_d'],
                    'correct_answer' => strtoupper($row['correct_answer']),
                    'feedback_text' => $row['feedback_text'] ?? null,
                    'feedback_image' => $newImagePath,
                ]);
            }
        }
    }
}
