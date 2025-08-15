<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use App\Models\Question;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\File;

class LogicalReasoningImport implements ToCollection, WithHeadingRow
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
        $this->baseFolder = $baseFolder;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 por el encabezado en fila 1

            $q = $this->imagesByRow["question_{$rowNumber}"] ?? null;
            $a = $this->imagesByRow["a_{$rowNumber}"] ?? null;
            $b = $this->imagesByRow["b_{$rowNumber}"] ?? null;
            $c = $this->imagesByRow["c_{$rowNumber}"] ?? null;
            $d = $this->imagesByRow["d_{$rowNumber}"] ?? null;

            // Si la fila no está completa, omítela o registra log
            if (!$q || !$a || !$b || !$c || !$d) {
                continue;
            }

            $correct = strtoupper((string)($row['correct_answer'] ?? ''));
            if (!in_array($correct, ['A', 'B', 'C', 'D'], true)) {
                // sin respuesta válida, omite la fila
                continue;
            }

            // Firma estable por contenido (idempotencia)
            $signature = hash('sha256', implode('|', [
                $q['hash'], $a['hash'], $b['hash'], $c['hash'], $d['hash'],
                $correct, $this->typeId, $this->levelId,
            ]));

            // Si ya existe una pregunta con esta firma, no tocamos IDs → skip
            if (Question::where('signature', $signature)->exists()) {
                continue;
            }

            // Subir a S3 (nombre por hash → estable y deduplicable)
            $qPath = $this->uploadWithPutFileAsOrFail($q, $this->baseFolder);
            $aPath = $this->uploadWithPutFileAsOrFail($a, $this->baseFolder);
            $bPath = $this->uploadWithPutFileAsOrFail($b, $this->baseFolder);
            $cPath = $this->uploadWithPutFileAsOrFail($c, $this->baseFolder);
            $dPath = $this->uploadWithPutFileAsOrFail($d, $this->baseFolder);

            // Crear la pregunta (no afecta IDs existentes)
            Question::create([
                'question'          => null,
                'question_image'    => $qPath,
                'answer_a'          => $aPath,
                'answer_b'          => $bPath,
                'answer_c'          => $cPath,
                'answer_d'          => $dPath,
                'correct_answer'    => $correct,
                'question_type_id'  => $this->typeId,
                'question_level_id' => $this->levelId,
                'signature'         => $signature,
                'q_hash' => $q['hash'], 'a_hash' => $a['hash'], 'b_hash' => $b['hash'],
                'c_hash' => $c['hash'], 'd_hash' => $d['hash'],
            ]);
        }
    }

    private function uploadWithPutFileAsOrFail(array $img, string $baseFolder): string
    {
        $folder = trim($baseFolder, '/');
        $name   = "{$img['hash']}.{$img['ext']}";
        $tmp    = $img['tmp_path'];

        if (!is_file($tmp)) {
            throw new \RuntimeException("Tmp file no existe: {$tmp}");
        }
        
        try {
           // sin 'visibility' para evitar ACLs
            $key = Storage::disk('s3')->putFileAs($folder, new \Illuminate\Http\File($tmp), $name);
        } catch (\Throwable $e) {
            throw new \RuntimeException("S3 upload error ({$name}): ".$e->getMessage(), 0, $e);
        }

        if (!$key) {
            $key = ($folder ? "{$folder}/" : '').$name;
            $stream = fopen($tmp, 'r');
            Storage::disk('s3')->put($key, $stream); // sin ACL
            fclose($stream);
        }

        if (!Storage::disk('s3')->fileExists($key)) {
            throw new \RuntimeException("S3 no confirmó el archivo: {$key}");
        }

        return $key; // p.ej. logical/questions/abc123.png
    }

}
