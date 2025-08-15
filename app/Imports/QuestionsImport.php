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
    private int $levelId;
    private array $imagesByRow;
    private string $baseFolder;

    public function __construct(int $typeId, int $levelId, array $imagesByRow = [], string $baseFolder = 'logical/questions')
    {
        $this->typeId = $typeId;
        $this->levelId = $levelId;
        $this->imagesByRow = $imagesByRow;
    }

    public function collection(\Illuminate\Support\Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // encabezado en fila 1

            // Recuperar hashes/bytes de cada celda-Imagen
            $q = $this->imagesByRow["question_{$rowNumber}"] ?? null;
            $a = $this->imagesByRow["a_{$rowNumber}"] ?? null;
            $b = $this->imagesByRow["b_{$rowNumber}"] ?? null;
            $c = $this->imagesByRow["c_{$rowNumber}"] ?? null;
            $d = $this->imagesByRow["d_{$rowNumber}"] ?? null;

            // Si falta algo crítico, continúa o registra error
            if (!$q || !$a || !$b || !$c || !$d) {
                // opcional: loggear fila incompleta
                continue;
            }

            $correct = strtoupper((string)($row['correct_answer'] ?? ''));

            // Firma estable por fila (usa hashes ya normalizados)
            $signature = hash('sha256', implode('|', [
                $q['hash'], $a['hash'], $b['hash'], $c['hash'], $d['hash'],
                $correct, $this->typeId, $this->levelId,
            ]));

            // ¿Ya existe? Si sí, saltamos (no tocamos IDs)
            if (Question::where('signature', $signature)->exists()) {
                continue;
            }

            // Subir a S3 SOLAMENTE si es nueva
            $qPath = $this->put("{$q['hash']}.{$q['ext']}", $q['bytes']);
            $aPath = $this->put("{$a['hash']}.{$a['ext']}", $a['bytes']);
            $bPath = $this->put("{$b['hash']}.{$b['ext']}", $b['bytes']);
            $cPath = $this->put("{$c['hash']}.{$c['ext']}", $c['bytes']);
            $dPath = $this->put("{$d['hash']}.{$d['ext']}", $d['bytes']);

            Question::create([
                'question'           => null,
                'question_image'     => $qPath,
                'answer_a'           => $aPath,
                'answer_b'           => $bPath,
                'answer_c'           => $cPath,
                'answer_d'           => $dPath,
                'correct_answer'     => $correct,
                'question_type_id'   => $this->typeId,
                'question_level_id'  => $this->levelId,
                'signature'          => $signature,
                'q_hash'             => $q['hash'],
                'a_hash'             => $a['hash'],
                'b_hash'             => $b['hash'],
                'c_hash'             => $c['hash'],
                'd_hash'             => $d['hash'],
            ]);
        }
    }

    private function put(string $fileName, string $bytes): string
    {
        $key = rtrim($this->baseFolder, '/').'/'.$fileName;
        if (!Storage::disk('s3')->exists($key)) {
            Storage::disk('s3')->put($key, $bytes, ['visibility' => 'public']);
        }
        return $key;
    }
}
