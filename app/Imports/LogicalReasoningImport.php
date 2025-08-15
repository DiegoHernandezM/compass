<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Http\File;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class LogicalReasoningImport implements ToCollection, WithHeadingRow
{
    private int $typeId;
    private int $levelId;
    private array $imagesByRow;
    private string $baseFolder;
    private int $headerRow = 1; // tu header está en la fila 1

    /**
     * @param array $imagesByRow keys del tipo:
     *  question_{row}, a_{row}, b_{row}, c_{row}, d_{row} =>
     *  ['ext'=>'png|jpg','hash'=>'sha256','tmp_path'=>'/tmp/...']
     */
    public function __construct(int $typeId, int $levelId, array $imagesByRow = [], string $baseFolder = 'logical/questions')
    {
        $this->typeId      = $typeId;
        $this->levelId     = $levelId;
        $this->imagesByRow = $imagesByRow;
        $this->baseFolder  = $baseFolder;
    }

    public function headingRow(): int
    {
        return $this->headerRow;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            // Primera fila de datos = headerRow + 1
            $rowNumber = $this->headerRow + 1 + $index;

            $q = $this->imagesByRow["question_{$rowNumber}"] ?? null;
            $a = $this->imagesByRow["a_{$rowNumber}"] ?? null;
            $b = $this->imagesByRow["b_{$rowNumber}"] ?? null;
            $c = $this->imagesByRow["c_{$rowNumber}"] ?? null;
            $d = $this->imagesByRow["d_{$rowNumber}"] ?? null;

            // Log útil si te falta alguna imagen en esa fila
            if (!$q || !$a || !$b || !$c || !$d) {
                Log::warning('Fila sin imágenes completas', [
                    'row'     => $rowNumber,
                    'needed'  => ["question_{$rowNumber}","a_{$rowNumber}","b_{$rowNumber}","c_{$rowNumber}","d_{$rowNumber}"],
                    'present' => array_intersect(
                        ["question_{$rowNumber}","a_{$rowNumber}","b_{$rowNumber}","c_{$rowNumber}","d_{$rowNumber}"],
                        array_keys($this->imagesByRow)
                    ),
                ]);
                continue;
            }

            $correct = strtoupper(trim((string)($row['correct_answer'] ?? '')));
            if (!in_array($correct, ['A','B','C','D'], true)) {
                Log::warning('correct_answer inválido', ['row' => $rowNumber, 'value' => $row['correct_answer'] ?? null]);
                continue;
            }

            // Firma base (solo imágenes) para detectar "misma pregunta"
            $baseSig = hash('sha256', implode('|', [
                $q['hash'], $a['hash'], $b['hash'], $c['hash'], $d['hash'],
                $this->typeId, $this->levelId,
            ]));

            // Firma completa (incluye respuesta) — útil para idempotencia de insert
            $signature = hash('sha256', $baseSig.'|'.$correct);

            // 1) ¿Ya existe una pregunta con las MISMAS imágenes (independiente de la respuesta)?
            //    Busca por hashes (más directo) + tipo/nivel
            $existing = Question::where([
                    'q_hash' => $q['hash'],
                    'a_hash' => $a['hash'],
                    'b_hash' => $b['hash'],
                    'c_hash' => $c['hash'],
                    'd_hash' => $d['hash'],
                    'question_type_id'  => $this->typeId,
                    'question_level_id' => $this->levelId,
                ])->first();

            if ($existing) {
                // Si cambió la respuesta, actualiza correct_answer y la signature
                if ($existing->correct_answer !== $correct) {
                    $existing->update([
                        'correct_answer' => $correct,
                        'signature'      => $signature,
                    ]);
                }
                // No subas ni insertes nada más
                continue;
            }

            // 2) Si no hay "misma pregunta", verifica si YA insertamos esa misma firma completa (mismas imgs + misma resp)
            if (Question::where('signature', $signature)->exists()) {
                // Ya existe exactamente igual; no hagas nada
                continue;
            }

            // 3) Es una pregunta nueva → sube imágenes y crea
            $qPath = $this->uploadWithPutFileAsOrFail($q, $this->baseFolder);
            $aPath = $this->uploadWithPutFileAsOrFail($a, $this->baseFolder);
            $bPath = $this->uploadWithPutFileAsOrFail($b, $this->baseFolder);
            $cPath = $this->uploadWithPutFileAsOrFail($c, $this->baseFolder);
            $dPath = $this->uploadWithPutFileAsOrFail($d, $this->baseFolder);

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
                'q_hash'            => $q['hash'],
                'a_hash'            => $a['hash'],
                'b_hash'            => $b['hash'],
                'c_hash'            => $c['hash'],
                'd_hash'            => $d['hash'],
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
            // Sin ACL (algunos buckets bloquean ACLs)
            $key = Storage::disk('s3')->putFileAs($folder, new File($tmp), $name);
        } catch (\Throwable $e) {
            throw new \RuntimeException("S3 upload error ({$name}): ".$e->getMessage(), 0, $e);
        }

        if (!$key) {
            $key = ($folder ? "{$folder}/" : '').$name;
            $stream = fopen($tmp, 'r');
            Storage::disk('s3')->put($key, $stream);
            fclose($stream);
        }

        if (!Storage::disk('s3')->fileExists($key)) {
            throw new \RuntimeException("S3 no confirmó el archivo: {$key}");
        }

        return $key;
    }
}
