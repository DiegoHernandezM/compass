<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class MathQuestionsImport implements ToCollection, WithHeadingRow
{
    public int $importedCount = 0;

    public function __construct(
        private readonly int $typeId,
        private readonly int $levelId,
        private readonly array $imagesByRow = [],
    ) {}

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $questionText = $this->cell($row, ['question', 'pregunta']);
            $answers = [
                'answer_a' => $this->cell($row, ['answer_a']),
                'answer_b' => $this->cell($row, ['answer_b']),
                'answer_c' => $this->cell($row, ['answer_c']),
                'answer_d' => $this->cell($row, ['answer_d']),
            ];

            if ($questionText === null && collect($answers)->every(fn ($answer) => $answer === null)) {
                continue;
            }

            // Los renglones de sección del archivo original no son preguntas.
            if ($questionText !== null && collect($answers)->every(fn ($answer) => $answer === null)) {
                continue;
            }

            if ($questionText === null || collect($answers)->contains(fn ($answer) => $answer === null)) {
                throw new InvalidArgumentException("La fila {$rowNumber} debe incluir pregunta y respuestas A, B, C y D.");
            }

            $correctAnswer = strtoupper((string) $this->cell($row, ['correct_answer', 'respuesta']));
            if (! in_array($correctAnswer, ['A', 'B', 'C', 'D'], true)) {
                throw new InvalidArgumentException("La fila {$rowNumber} debe indicar A, B, C o D como respuesta correcta.");
            }

            $newImagePath = $this->imagesByRow[$rowNumber] ?? null;
            $question = Question::firstOrNew([
                'question_type_id' => $this->typeId,
                'question_level_id' => $this->levelId,
                'question' => $questionText,
            ]);

            $oldImagePath = $question->getRawOriginal('feedback_image');
            if ($oldImagePath && $oldImagePath !== $newImagePath) {
                Storage::disk('s3')->delete($oldImagePath);
            }

            $question->fill([
                ...$answers,
                'correct_answer' => $correctAnswer,
                'feedback_text' => $this->cell($row, ['feedback_text', 'justificacion']),
                'feedback_image' => $newImagePath,
            ])->save();

            $this->importedCount++;
        }

        if ($this->importedCount === 0) {
            throw new InvalidArgumentException('El archivo no contiene preguntas completas con opciones A, B, C y D.');
        }
    }

    private function cell(Collection $row, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (! $row->has($key)) {
                continue;
            }

            $value = trim((string) $row->get($key));
            if ($value !== '') {
                return $value;
            }
        }

        return null;
    }
}
