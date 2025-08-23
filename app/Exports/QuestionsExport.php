<?php

namespace App\Exports;

use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\FromCollection;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use App\Models\Question;

class QuestionsExport implements FromCollection, WithHeadings, WithMapping, WithDrawings
{
    protected $typeId;
    protected $levelId;
    protected $rowIndex = 2;
    protected $drawings = [];
    protected $tmpFiles = [];

    public function __construct($typeId, $levelId)
    {
        $this->typeId = $typeId;
        $this->levelId = $levelId;
    }

    public function collection()
    {
        return Question::where('question_level_id', $this->levelId)
            ->where('question_type_id', $this->typeId)->get();
    }

    public function headings(): array
    {
        return [
            'question',       // A (texto o imagen)
            'answer_a',       // B
            'answer_b',       // C
            'answer_c',       // D
            'answer_d',       // E
            'correct_answer', // F
            'feedback_text',  // G
            'feedback_image', // H
        ];
    }

    public function map($question): array
    {
        $this->maybeAddImage($question, 'question_image', 'A');

        // Lo mismo para respuestas e imagen de feedback
        $this->maybeAddImage($question, 'answer_a', 'B');
        $this->maybeAddImage($question, 'answer_b', 'C');
        $this->maybeAddImage($question, 'answer_c', 'D');
        $this->maybeAddImage($question, 'answer_d', 'E');
        $this->maybeAddImage($question, 'feedback_image', 'H');

        $row = [
            // A: si hay texto lo ponemos, si no hay texto pero sí imagen, queda vacío (imagen va en Drawing)
            $question->question ?? '',

            // B–E: respuestas
            $this->hasImage($question, 'answer_a') ? '' : ($question->answer_a ?? ''),
            $this->hasImage($question, 'answer_b') ? '' : ($question->answer_b ?? ''),
            $this->hasImage($question, 'answer_c') ? '' : ($question->answer_c ?? ''),
            $this->hasImage($question, 'answer_d') ? '' : ($question->answer_d ?? ''),

            // F: correct answer
            $question->correct_answer ?? '',

            // G: feedback text
            $question->feedback_text ?? '',

            // H: feedback image (si es imagen, queda vacío porque va en Drawing)
            $this->hasImage($question, 'feedback_image') ? '' : '',
        ];

        $this->rowIndex++;
        return $row;
    }

    public function drawings()
    {
        return $this->drawings;
    }

    protected function hasImage(Question $q, string $attr): bool
    {
        $key = $q->getRawOriginal($attr);
        return $key && Storage::disk('s3')->exists($key);
    }

    protected function maybeAddImage(Question $q, string $attr, string $columnLetter): void
    {
        $s3Key = $q->getRawOriginal($attr);
        if (!$s3Key || !Storage::disk('s3')->exists($s3Key)) {
            return;
        }

        $localPath = $this->downloadToTmp($s3Key);

        $drawing = new Drawing();
        $drawing->setName(ucfirst(str_replace('_', ' ', $attr)));
        $drawing->setDescription($attr);
        $drawing->setPath($localPath);
        $drawing->setHeight(60);
        $drawing->setCoordinates($columnLetter . $this->rowIndex);

        $this->drawings[] = $drawing;
    }

    protected function downloadToTmp(string $s3Key): string
    {
        $tmpDir = storage_path('app/tmp');
        if (!is_dir($tmpDir)) {
            @mkdir($tmpDir, 0775, true);
        }

        $basename = basename($s3Key);
        $local = $tmpDir . '/' . uniqid('img_') . '_' . $basename;

        file_put_contents($local, Storage::disk('s3')->get($s3Key));
        $this->tmpFiles[] = $local;

        return $local;
    }

    public function __destruct()
    {
        // Limpia todos los archivos temporales al final
        foreach ($this->tmpFiles as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }
    }
}
