<?php

namespace App\Imports;

use App\Models\Question;
use Illuminate\Http\File;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SpatialQuestionsImport implements ToCollection, WithHeadingRow
{
    private int $typeId;
    private int $levelId;
    private array $imagesByRow;
    private string $qFolder;
    private string $fbFolder;
    private int $headerRow = 1;

    public function __construct(
        int $typeId,
        int $levelId,
        array $imagesByRow,
        string $qFolder = 'logical/questions',
        string $fbFolder = 'logical/feedback'
    ) {
        $this->typeId      = $typeId;
        $this->levelId     = $levelId;
        $this->imagesByRow = $imagesByRow;
        $this->qFolder     = $qFolder;
        $this->fbFolder    = $fbFolder;
    }

    public function headingRow(): int { return $this->headerRow; }

    public function collection(Collection $rows)
    {
        // Log de sanity: ver qué keys trae extractImages
        Log::info('imagesByRow keys (sample)', [
            'first20' => array_slice(array_keys($this->imagesByRow), 0, 20),
            'total'   => count($this->imagesByRow),
        ]);

        $now  = now();
        $bulk = [];

        foreach ($rows as $idx => $row) {
            $rowNumber = $this->headerRow + 1 + $idx;

            // --- Fallbacks de keys para diferentes extractImages
            $qImg = $this->imagesByRow["question_image_{$rowNumber}"]
                ?? $this->imagesByRow["question_{$rowNumber}"]
                ?? $this->imagesByRow["q_{$rowNumber}"]
                ?? null;

            $fbImg = $this->imagesByRow["feedback_image_{$rowNumber}"]
                ?? $this->imagesByRow["fb_{$rowNumber}"]
                ?? null;

            if (!$qImg || empty($qImg['tmp_path'])) {
                Log::warning('Fila sin question_image', [
                    'row' => $rowNumber,
                    'tried' => [
                        "question_image_{$rowNumber}", "question_{$rowNumber}", "q_{$rowNumber}"
                    ]
                ]);
                continue;
            }

            // --- respuestas/textos (acepta answare_* también)
            $ansA    = strtoupper(trim((string)($row['answer_a'] ?? $row['answare_a'] ?? '')));
            $ansB    = strtoupper(trim((string)($row['answer_b'] ?? $row['answare_b'] ?? '')));
            $ansC    = strtoupper(trim((string)($row['answer_c'] ?? $row['answare_c'] ?? '')));
            $ansD    = strtoupper(trim((string)($row['answer_d'] ?? $row['answare_d'] ?? '')));
            $correct = strtoupper(trim((string)($row['correct_answer'] ?? '')));
            $fbText  = trim((string)($row['feedback_text'] ?? ''));

            if (!in_array($correct, ['A','B','C','D'], true)) {
                Log::warning('correct_answer inválido', ['row' => $rowNumber, 'value' => $row['correct_answer'] ?? null]);
                continue;
            }

            // --- hashes (texto → hash, img ya trae hash)
            $qHash = $qImg['hash'];
            $aHash = $ansA !== '' ? hash('sha256', $ansA) : null;
            $bHash = $ansB !== '' ? hash('sha256', $ansB) : null;
            $cHash = $ansC !== '' ? hash('sha256', $ansC) : null;
            $dHash = $ansD !== '' ? hash('sha256', $ansD) : null;

            // --- subidas (idempotentes por hash)
            $qPath = $this->putFileAsOrFail($qImg, $this->qFolder);
            $fbPath = $fbImg ? $this->putFileAsOrFail($fbImg, $this->fbFolder) : null;

            // --- firmas
            $baseSig   = hash('sha256', implode('|', [$qHash, $this->typeId, $this->levelId]));
            $fbSig     = $fbImg['hash'] ?? '';
            $signature = hash('sha256', implode('|', [
                $baseSig, $ansA, $ansB, $ansC, $ansD, $correct, $fbText, $fbSig
            ]));

            $bulk[] = [
                'question'           => null,
                'question_image'     => $qPath,
                'answer_a'           => $ansA,
                'answer_b'           => $ansB,
                'answer_c'           => $ansC,
                'answer_d'           => $ansD,
                'correct_answer'     => $correct,
                'feedback_text'      => $fbText !== '' ? $fbText : null,
                'feedback_image'     => $fbPath,
                'question_type_id'   => $this->typeId,
                'question_level_id'  => $this->levelId,
                'signature'          => $signature,
                'q_hash'             => $qHash,
                'a_hash'             => $aHash,
                'b_hash'             => $bHash,
                'c_hash'             => $cHash,
                'd_hash'             => $dHash,
                'created_at'         => $now,
                'updated_at'         => $now,
            ];
        }

        if (!$bulk) {
            Log::warning('Bulk vacío: ninguna fila pasó validación.', [
                'rows_count' => $rows->count()
            ]);
            return;
        }

        $updateCols = [
            'question_image','answer_a','answer_b','answer_c','answer_d',
            'correct_answer','feedback_text','feedback_image',
            'signature','a_hash','b_hash','c_hash','d_hash','updated_at'
        ];

        Question::upsert(
            $bulk,
            ['q_hash','question_type_id','question_level_id'], // identidad
            $updateCols
        );

        Log::info('Upsert completado', ['affected' => count($bulk)]);
    }

    private function putFileAsOrFail(array $img, string $folder): string
    {
        $folder = trim($folder, '/');
        $name   = "{$img['hash']}.{$img['ext']}";
        $tmp    = $img['tmp_path'];

        if (!is_file($tmp)) {
            throw new \RuntimeException("Tmp file no existe: {$tmp}");
        }

        try {
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
