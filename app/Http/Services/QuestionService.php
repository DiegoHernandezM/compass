<?php

namespace App\Http\Services;

use App\Models\Question;
use App\Models\QuestionType;
use App\Models\Subject;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use App\Imports\QuestionsImport;
use App\Imports\SpatialQuestionsImport;
use App\Imports\LogicalReasoningImport;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Models\MultitaskQuestion;
use App\Models\QuestionLevel;
use App\Models\MemoryTest;
use App\Models\MemoryIcon;
use App\Models\QuestionSubject;
use App\Models\TestQuestion;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing as FileDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;

class QuestionService
{
    protected $model;
    protected $mTypes;
    protected $mLevels;
    protected $mMultitaskQuestions;
    protected $mSubject;
    protected $mMemoryTest;
    protected $mQuestionSubject;
    protected $mTestQuestion;

    public function __construct()
    {
        $this->model = new Question();
        $this->mTypes = new QuestionType();
        $this->mMultitaskQuestions = new MultitaskQuestion();
        $this->mSubject = new Subject();
        $this->mLevels = new QuestionLevel();
        $this->mMemoryTest = new MemoryTest();
        $this->mQuestionSubject = new QuestionSubject();
        $this->mTestQuestion = new TestQuestion();
    }

    public function getAll()
    {
        return $this->model->get();
    }

    public function getAllPaginated(int $perPage = 25)
    {
        return $this->model
            ->with([
                'subjects:id,name',
                'type:id,name',
                'level:id,name'
            ])
            ->latest('id')
            ->paginate($perPage);
    }

    public function getTypes()
    {
        return $this->mTypes->with([
            'levels' => function ($query) {
                $query->withCount('questions')
                    ->withCount('multitaskQuestions');
            }
        ])
        ->withCount('questions', 'multitaskQuestions')
        ->get()
        ->map(function ($type) {
            if ($type->name === 'MULTITASKING') {
                $type->questions_count = intval(($type->multitask_questions_count ?? 0) / 2);
                $type->levels->each(function ($level) {
                    $level->questions_count = intval(($level->multitask_questions_count ?? 0) / 2);
                });
            }
            return $type;
        });
    }

    public function getTypesLight()
    {
        return Cache::remember('types-with-counts-v2', 300, function () {
            return $this->mTypes
                ->select(['id','name','description'])
                ->with([
                    'levels' => function ($q) {
                        $q->select(['id','name','description','question_type_id']) // <- si NO la usas en el front, puedes omitirla
                        ->withCount(['questions','multitaskQuestions']);
                    }
                ])
                ->withCount(['questions','multitaskQuestions'])
                ->orderBy('name')
                ->get()
                ->map(function ($type) {
                    // Ajuste especial para MULTITASKING
                    if ($type->name === 'MULTITASKING') {
                        $type->questions_count = intdiv(($type->multitask_questions_count ?? 0), 2);
                        $type->levels->each(function ($level) {
                            $level->questions_count = intdiv(($level->multitask_questions_count ?? 0), 2);
                        });
                    }

                    // Recorta el payload (opcional)
                    $levels = $type->levels->map(function ($l) {
                        return [
                            'id' => $l->id,
                            'name' => $l->name,
                            'type_id' => $l->question_type_id, // solo si lo necesitas en el front
                            'questions_count' => (int) ($l->questions_count ?? 0),
                        ];
                    });

                    return [
                        'id' => $type->id,
                        'name' => $type->name,
                        'description' => $type->description,
                        'questions_count' => (int) ($type->questions_count ?? 0),
                        'levels' => $levels,
                    ];
                });
        });
    }

    public function allBySubject($subjectId)
    {
        $subject = $this->mSubject->findOrFail($subjectId);

        $isMultitask = $subject->question_type === 'MULTITASKING';
        $questions = $isMultitask ? $subject->multitaskQuestions : $subject->questions;
        $subject->questions = $questions;

        return $subject->questions;
    }

    public function find($id)
    {
        return $this->model->find($id);
    }

    public function create(array $data)
    {
        if (isset($data['feedback_image'])) {
            $data['feedback_image'] = $data['feedback_image']->store('feedback', 's3');
        }

        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $question = $this->find($id);
            $type  = $this->mTypes->where('id', $question->question_type_id)->first();
            $haveQuestionId = $this->getTypePath($type->name, false);
            $testQuestion = null;
            if ($haveQuestionId) {
                $testQuestion = $this->mTestQuestion->where('question_id', $question->id)->first();
            }

            $basePath = Str::finish(trim($this->getTypePath($type->name, true)), '/');
            if ($basePath !== null) {
                // Carpetas base (como en tu importador)
                $basePath = Str::finish(trim($this->getTypePath($type->name, true)), '/');
                $qFolder  = $basePath . 'questions';
                $aFolder  = $basePath . 'questions';
                $fbFolder = $basePath . 'feedback';

                // === Helpers ===
                $hashText = function (?string $txt): ?string {
                    $t = trim((string)($txt ?? ''));
                    return $t === '' ? null : hash('sha256', mb_strtoupper($t, 'UTF-8'));
                };

                $storeFileHashed = function (UploadedFile $file, string $folder) {
                    $folder = trim($folder, '/');
                    $ext  = strtolower($file->getClientOriginalExtension() ?: 'bin');
                    $hash = hash_file('sha256', $file->getRealPath());
                    $name = "{$hash}.{$ext}";
                    $key  = Storage::disk('s3')->putFileAs($folder, $file, $name);
                    if (!$key) { // fallback raro
                        $key = ($folder ? "{$folder}/" : '').$name;
                        Storage::disk('s3')->put($key, fopen($file->getRealPath(), 'r'));
                    }
                    return [
                        'key'  => $key,
                        'url'  => Storage::disk('s3')->url($key),
                        'hash' => $hash,
                        'name' => $name,
                    ];
                };

                $s3KeyFromUrl = function (?string $url): ?string {
                    if (!$url || !str_starts_with($url, 'http')) return $url; // ya es key
                    $parts = parse_url($url);
                    return $parts['path'] ?? null ? ltrim($parts['path'], '/') : null;
                };

                // Track si cambió algo que afecte firma/hashes
                $changedAnswer = ['a' => false, 'b' => false, 'c' => false, 'd' => false];
                $fbHash = ''; // para la firma (igual que importador)
            }

            // === PREGUNTA texto/imagen ===
            if (!empty($data['question_image']) && $data['question_image'] instanceof \Illuminate\Http\UploadedFile) {
                // Subieron una nueva imagen de pregunta
                $stored = $storeFileHashed($data['question_image'], $qFolder);

                // Si antes había imagen, bórrala (opcional)
                if ($question->question_image) {
                    $oldKey = $s3KeyFromUrl($question->question_image);
                    if ($oldKey) Storage::disk('s3')->delete($oldKey);
                }

                $question->question_image = $stored['key'];   // o $stored['url']
                $question->question       = null;
                $question->q_hash         = $stored['hash'];  // IMAGEN => hash binario

            } elseif (array_key_exists('question', $data)) {
                // Solo cambia a TEXTO si llega texto REAL; si llega null/'' NO borres lo existente
                $text = (string)($data['question'] ?? '');
                if (trim($text) !== '') {
                    $question->question       = $text;
                    $question->question_image = null;
                    $question->q_hash         = null; // TEXTO => sin q_hash
                }
                // Si viene vacío, no tocar question_image ni q_hash (conserva lo anterior)
            }

            // === RESPUESTAS A–D (texto o archivo) ===
            $letters = ['a','b','c','d'];
            foreach ($letters as $L) {
                $textKey = "answer_{$L}";
                $fileKey = "answer_{$L}_file";

                // 1) Si llega archivo => subir, setear URL/key y hash de archivo
                if (!empty($data[$fileKey]) && $data[$fileKey] instanceof UploadedFile) {
                    $stored = $storeFileHashed($data[$fileKey], $aFolder);
                    $question->{$textKey}   = $stored['key']; // o $stored['url']
                    $question->{$L.'_hash'} = $stored['hash'];
                    $changedAnswer[$L] = true;
                    continue;
                }

                // 2) Si llega texto explícito => setear texto y hash de texto
                if (array_key_exists($textKey, $data)) {
                    $question->{$textKey} = $data[$textKey]; // "1","2","Texto", etc.
                    $question->{$L.'_hash'} = $this->looksLikeUrl($data[$textKey] ?? '')
                        ? ($question->{$L.'_hash'} ?? null) // si es URL y no cambiaste archivo, conserva hash previo
                        : $hashText($data[$textKey]);
                    $changedAnswer[$L] = true;
                }
            }

            // === FEEDBACK IMAGE (opcional) ===
            if (!empty($data['feedback_image']) && $data['feedback_image'] instanceof UploadedFile) {
                if ($question->feedback_image) {
                    $oldKey = $s3KeyFromUrl($question->feedback_image);
                    if ($oldKey) Storage::disk('s3')->delete($oldKey);
                }
                $stored = $storeFileHashed($data['feedback_image'], $fbFolder);
                $question->feedback_image = $stored['key']; // o URL
                $fbHash = $stored['hash']; // para la firma
            }

            // === Otros campos directos ===
            if (array_key_exists('feedback_text', $data)) {
                $question->feedback_text = trim((string)$data['feedback_text']) ?: null;
            }
            if (array_key_exists('correct_answer', $data)) {
                $question->correct_answer = $data['correct_answer'];
            }
            if (array_key_exists('has_dynamic', $data)) {
                $question->has_dynamic = (bool)$data['has_dynamic'];
            }

            // === FIRMAS (igual idea que importador) ===
            $baseSig = hash('sha256', implode('|', [
                (string)($question->q_hash ?? ''),
                (string)$question->question_type_id,
                (string)$question->question_level_id,
            ]));

            $signature = hash('sha256', implode('|', [
                $baseSig,
                (string)$question->answer_a,
                (string)$question->answer_b,
                (string)$question->answer_c,
                (string)$question->answer_d,
                (string)$question->correct_answer,
                (string)$question->feedback_text,
                (string)$fbHash,
            ]));
            $question->signature = $signature;

            $question->save();

            // === Sincroniza TestQuestion (si existe)
            if ($testQuestion) {
                $options = [
                    'a' => $question->answer_a,
                    'b' => $question->answer_b,
                    'c' => $question->answer_c,
                    'd' => $question->answer_d,
                ];

                // Fuente para question_text: preferir texto, luego imagen
                $newQuestionText = $question->question ?: $question->question_image;

                // Si por cualquier motivo ambas están vacías, conserva lo que ya tenía (NOT NULL)
                if ($newQuestionText === null) {
                    $newQuestionText = $testQuestion->question_text;
                }

                $testQuestion->question_text   = $newQuestionText;
                $testQuestion->options         = json_encode($options);
                $testQuestion->correct_answer  = $question->correct_answer;
                $testQuestion->feedback_text   = $question->feedback_text;
                $testQuestion->feedback_image  = $question->feedback_image;

                if (!empty($data['time'])) {
                    $testQuestion->limit_time = $data['time'];
                }

                $testQuestion->save();
            }

            return $question;
        });
    }

    public function updateMultitiaskQuestion($id, $request)
    {
        $question = $this->mMultitaskQuestions->find($id);
        $question->question = $request['question'];
        $question->option_a = $request['option_a'];
        $question->option_b = $request['option_b'];
        $question->option_c = $request['option_c'];
        $question->answer = $request['answer'];
        $question->save();
        return $question;
    }

    public function delete($id)
    {
        $question = $this->model->findOrFail($id);

        // 1) Reunimos las posibles keys de S3 ANTES de borrar en BD
        $keys = $this->collectQuestionS3Keys($question); // array de keys únicos (solo imágenes)

        // 2) Borramos en BD dentro de transacción
        DB::transaction(function () use ($question) {
            // Si tienes relación con test_questions
            $this->mTestQuestion->where('question_id', $question->id)->delete();

            // Si usas SoftDeletes y quieres borrado duro: $question->forceDelete();
            $question->delete();
        });

        // 3) Tras el commit, borramos en S3 únicamente si ya no hay referencias
        DB::afterCommit(function () use ($keys) {
            foreach ($keys as $key) {
                if (!$this->isS3KeyInUse($key)) {
                    try {
                        Storage::disk('s3')->delete($key);
                    } catch (\Throwable $e) {
                        // Log opcional
                        \Log::warning("No se pudo borrar en S3: {$key}", ['err' => $e->getMessage()]);
                    }
                }
            }
        });
    }

    public function allSaveTest($request)
    {
        $data = $request->only([
            'subject_id',
            'question_type_id',
            'question_level_id',
            'question_count',
            'has_time_limit',
            'time_limit',
            'game',
            'reset'
        ]);

        $shouldReset = filter_var($data['reset'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $type = $this->mTypes->find($data['question_type_id']);

        if($shouldReset || $type->name === 'MEMORIA A CORTO PLAZO - MEMORAMA') {
            $this->mQuestionSubject
                ->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->delete();
        }

        $subject = $this->mSubject->find($data['subject_id']);
        $subject->question_type = $type->name;
        $subject->save();
        if ($type->name === 'MULTITASKING') {
            $total = (int) $data['question_count'] * 2;
            $half = (int) ceil($total / 2); 
            $mathQuestions = $this->mMultitaskQuestions
                ->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->where('type', 'math')
                ->inRandomOrder()
                ->limit($half)
                ->get();
            $figureQuestions = $this->mMultitaskQuestions
                ->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->where('type', 'figure')
                ->inRandomOrder()
                ->limit($total - $mathQuestions->count())
                ->get();
            $questions = $mathQuestions->concat($figureQuestions)->shuffle();
        } elseif ($type->name === 'MEMORIA A CORTO PLAZO - MEMORAMA') {
            $memory = $this->mMemoryTest->create([
                'subject_id' => $data['subject_id'],
                'question_type_id' => $data['question_type_id'],
                'question_level_id' => $data['question_level_id'],
                'questions_counts' => $data['question_count'],
                'time_limit' => $data['has_time_limit'] ? $data['time_limit'] : null,
            ]);
            $icons = MemoryIcon::where('question_type_id', $memory->question_type_id)
                ->pluck('name')
                ->toArray();
            for ($i = 0; $i < $data['question_count']; $i++) {
                $iconsToRemember = collect($icons)->shuffle()->take($this->getIconsCountByLevel($memory->question_level_id))->values()->all();
                $iconString = implode(',', $iconsToRemember);

                $this->model->create([
                        'question' => $iconString,
                        'answer_a' => $iconString,
                        'answer_b' => $iconString,
                        'answer_c' => $iconString,
                        'correct_answer' => 'A',
                        'feedback_text'   => null,
                        'feedback_image'  => null,
                        'question_type_id' => $memory->question_type_id,
                        'question_level_id' => $memory->question_level_id,
                ]);
            }
            $questions = $this->model->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->inRandomOrder()
                ->limit($data['question_count'])
                ->get();
        } else {
            $questions = $this->model->where('question_type_id', $data['question_type_id'])
                ->where('question_level_id', $data['question_level_id'])
                ->inRandomOrder()
                ->limit($data['question_count'])
                ->get();
        }
        
        if ($questions->count() < $data['question_count']) {
            return "No hay suficientes preguntas disponibles para este tipo y nivel.";
        }

        // Guarda en la tabla pivote question_subject
        foreach ($questions as $question) {
            DB::table('question_subject')->insert([
                'question_id' => $question->id,
                'subject_id' => $data['subject_id'],
                'question_type_id' => $data['question_type_id'],
                'question_level_id' => $data['question_level_id'],
                'time_limit' => $data['has_time_limit'] ? $data['time_limit'] : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        return $questions;
    }

    public function importTypeQuestions($typeId, $levelId, $file)
    {
        $type = $this->mTypes->find($typeId);
        $level = $levelId ? $this->mLevels->find($levelId) : null;
        $name = $type->name;

        $importMap = [
            'ORIENTACION ESPACIAL' => 'importSpatial',
            'RAZONAMIENTO LOGICO' => 'importLogical',
            'MEMORIA A CORTO PLAZO - PARAMETROS' => 'importParameters',
            'ATPL' => 'importAtpl',
        ];

        if (!isset($importMap[$name])) {
            throw new \Exception("Importación no soportada para el tipo: {$name}");
        }

        return $this->{$importMap[$name]}($type, $file, $level);
    }

    private function extractImagesByRow($file, $folder)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();

        $imagesByRow = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates();
            $row = (int) preg_replace('/[^0-9]/', '', $coordinates);

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

            $s3Path = Storage::disk('s3')->putFile($folder, $tmpPath);
            $imagesByRow[$row] = $s3Path;

            @unlink($tmpPath);
        }

        return $imagesByRow;
    }

    private function extractImages($file, $baseFolder)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();

        $imagesByKey = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates(); // Ej: B3
            $column = preg_replace('/[0-9]/', '', $coordinates); // B
            $row = preg_replace('/[^0-9]/', '', $coordinates);   // 3

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

            $s3Path = Storage::disk('s3')->putFile($baseFolder, $tmpPath);
            @unlink($tmpPath);

            $columnKey = match (strtoupper($column)) {
                'A' => "question_{$row}",
                'B' => "a_{$row}",
                'C' => "b_{$row}",
                'D' => "c_{$row}",
                'E' => "d_{$row}",
                default => null,
            };

            if ($columnKey) {
                $imagesByKey[$columnKey] = $s3Path;
            }
        }

        return $imagesByKey;
    }

    private function extractImagesLogical($file)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet       = $spreadsheet->getActiveSheet();
        $drawings    = $sheet->getDrawingCollection();

        $imagesByRow = [];

        foreach ($drawings as $drawing) {
            // --- Coordenadas robustas (soporta "A2" y rangos "A2:A3")
            $coord = $drawing->getCoordinates();
            if (strpos($coord, ':') !== false) {
                [$coord] = explode(':', $coord, 2); // esquina sup-izq
            }
            [$col, $row] = Coordinate::coordinateFromString($coord);
            $col = strtoupper(trim($col));
            $row = (int) $row;

            // --- Obtener bytes y extensión
            $bytes = null;
            $ext   = 'png';

            if ($drawing instanceof FileDrawing) {
                // getPath() puede venir como zip://... → igual sirve
                $path  = $drawing->getPath();
                $bytes = @file_get_contents($path);
                $ext   = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?? $path, PATHINFO_EXTENSION)) ?: 'png';
            } elseif ($drawing instanceof MemoryDrawing) {
                ob_start();
                $res  = $drawing->getImageResource();
                $mime = $drawing->getMimeType(); // image/png|image/jpeg
                if (str_contains($mime, 'jpeg')) {
                    imagejpeg($res);
                    $ext = 'jpg';
                } else {
                    imagepng($res);
                    $ext = 'png';
                }
                $bytes = ob_get_clean();
            }

            if (!$bytes) {
                continue; // no hay imagen real
            }

            // --- (Opcional) Normalización previa a hash (resize/compresión) aquí

            $hash = hash('sha256', $bytes);
            $tmp  = $this->makeTmpFromBytes($bytes, $ext); // ruta temporal real

            // --- Mapear columna a key
            $key = match ($col) {
                'A' => "question_{$row}",
                'B' => "a_{$row}",
                'C' => "b_{$row}",
                'D' => "c_{$row}",
                'E' => "d_{$row}",
                default => null,
            };
            if (!$key) {
                continue;
            }

            $imagesByKey[$key] = [
                'ext'      => $ext,
                'hash'     => $hash,
                'tmp_path' => $tmp,
                // 'bytes'  => $bytes, // si lo quieres para otra cosa
            ];
        }
        return $imagesByKey;
    }

    private function extractSpatialImages(string $file, int $headerRow = 1)
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();

        // Mapa Columna → header (normalizado)
        $colHeader = [];
        $highestCol = $sheet->getHighestColumn();
        for ($col = 'A'; ; $col = ++$col) {
            $val = (string) $sheet->getCell($col.$headerRow)->getValue();
            if ($val !== '') $colHeader[$col] = strtolower(trim($val));
            if ($col === $highestCol) break;
        }

        $imagesByKey = [];

        foreach ($sheet->getDrawingCollection() as $drawing) {
            $coord = $drawing->getCoordinates();
            if (str_contains($coord, ':')) {
                [$coord] = explode(':', $coord, 2); // esquina sup-izq
            }
            [$col, $row] = Coordinate::coordinateFromString($coord);
            $col = strtoupper(trim($col));
            $row = (int)$row;

            if ($row <= $headerRow) continue; // solo filas de datos

            $header = $colHeader[$col] ?? null;
            if (!in_array($header, ['question_image','feedback_image'], true)) continue;

            // bytes + ext
            $bytes = null; $ext = 'png';
            if ($drawing instanceof FileDrawing) {
                $path  = $drawing->getPath(); // puede ser zip://...
                $bytes = @file_get_contents($path);
                $ext   = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?? $path, PATHINFO_EXTENSION)) ?: 'png';
            } elseif ($drawing instanceof MemoryDrawing) {
                ob_start();
                $res  = $drawing->getImageResource();
                $mime = $drawing->getMimeType();
                if (str_contains($mime, 'jpeg')) { imagejpeg($res); $ext = 'jpg'; }
                else { imagepng($res); $ext = 'png'; }
                $bytes = ob_get_clean();
            }
            if (!$bytes) continue;

            // (Si normalizas imágenes, hazlo aquí y luego hashea)
            $hash = hash('sha256', $bytes);

            // crea tmp file con extensión (ayuda a S3 a detectar MIME)
            $tmp = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tmp, $bytes);
            $tmpWithExt = $tmp.'.'.$ext;
            @rename($tmp, $tmpWithExt);

            $key = "{$header}_{$row}"; // "question_image_2" o "feedback_image_2"
            $imagesByKey[$key] = [
                'ext'      => $ext,
                'hash'     => $hash,
                'tmp_path' => $tmpWithExt,
            ];
        }

        return $imagesByKey;
    }


    public function getByTypeSubject($typeId, $levelId)
    {
        $type = $this->mTypes->findOrFail($typeId);
        if ($type->bypass_levels_and_questions) {
            return MemoryIcon::where('question_type_id', $typeId)->get();
        }

        if ($type->name === 'MULTITASKING') {
            return $this->mMultitaskQuestions->where('question_type_id', $typeId)
                ->where('question_level_id', $levelId)
                ->get();
        }

        return $this->model->where('question_type_id', $typeId)
            ->where('question_level_id', $levelId)
            ->get();
    }

    public function checkIfExist($subject, $level, $type)
    {
        $findType = $this->mTypes->findOrFail($type);
        if ($findType->bypass_levels_and_questions) {
            return $this->mMemoryTest
                ->where('subject_id', $subject)
                ->where('question_type_id', $findType->id)
                ->where('question_level_id', $level)
                ->first();
        }
        if ($findType->name === 'MULTITASKING') {
            return $this->mQuestionSubject->where('subject_id', $subject)
                ->whereHas('multitaskQuestion', function ($query) use ($type, $level) {
                    $query->where('question_type_id', $type)
                        ->where('question_level_id', $level);
                })
                ->get();
        }
            return $this->mQuestionSubject->where('subject_id', $subject)
                ->whereHas('question', function ($query) use ($type, $level) {
                    $query->where('question_type_id', $type)
                        ->where('question_level_id', $level);
                })
                ->get();
    }


    private function importAtpl($type, $file, $level)
    {
        $imagesByRow = $this->extractImagesByRow($file, 'atpl/feedback');
        $importer = new QuestionsImport($type->id, $level->id, $imagesByRow);
        Excel::import($importer, $file);
        return true;
    }

    private function importSpatial($type, $file, $level)
    {
        $imagesByRow = $this->extractSpatialImages($file, headerRow: 1);

        $importer = new SpatialQuestionsImport(
            $type->id,
            $level->id,
            $imagesByRow,
            'spatial/questions',
            'spatial/feedback'
        );
        Excel::import($importer, $file);

        return true;
    }


    private function importLogical($type, $file, $level)
    {
        
        $imagesByRow = $this->extractImagesLogical($file); // << ya NO sube a S3 aquí
        $importer    = new LogicalReasoningImport(
            $type->id,
            $level->id,
            $imagesByRow,
            'logical/questions' // carpeta en S3
        );

        Excel::import($importer, $file);

        // Limpieza opcional: borra tmp files si los conservas fuera del import
        return true;
    }

    private function getIconsCountByLevel($levelId)
    {
        return match($levelId) {
            11 => 3,
            12 => 4,
            13 => 5,
            default => 3,
        };
    }

    private function makeTmpFromBytes(string $bytes, string $ext = 'png'): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'img_');
        file_put_contents($tmp, $bytes);

        // renombra para conservar extensión (ayuda a detectar mimetype)
        $tmpWithExt = $tmp.'.'.ltrim($ext, '.');
        @rename($tmp, $tmpWithExt);

        return $tmpWithExt;
    }

    private function getTypePath($name, $s3)
    {
        if($s3) {
            $arr = [
                'ORIENTACION ESPACIAL' => 'spatial/',
                'RAZONAMIENTO LOGICO' => 'logical/',
                'ATPL' => 'atpl/'
            ];
            return $arr[$name] ?? null;;
        } else {
            $arr = [
                'MEMORIA A CORTO PLAZO - MEMORAMA' => false,
                'MULTITASKING' => false,
                'ORIENTACION ESPACIAL' => true,
                'MATEMATICAS' => true,
                'RAZONAMIENTO LOGICO' => true,
                'MEMORIA A CORTO PLAZO - PARAMETROS' => true,
                'ATPL' => true
            ];
            return $arr[$name] ?? null;;
        }
        
    }

    private function looksLikeUrl(?string $v): bool
    {
        if (!is_string($v)) return false;
        $s = trim($v);
        if ($s === '') return false;
        return (bool)preg_match('#^https?://#i', $s);
    }

    /**
     * Obtiene todas las posibles keys de S3 (pregunta, respuestas y feedback) de una pregunta.
     * Devuelve solo archivos de imagen con key “limpia” (no URL) y sin duplicados.
     */
    private function collectQuestionS3Keys($q): array
    {
        $candidates = [
            $q->question_image,
            $q->feedback_image,
            $q->answer_a,
            $q->answer_b,
            $q->answer_c,
            $q->answer_d,
        ];

        $toKey = function ($v) {
            if (!$v) return null;
            // Si viene URL, obtenemos el path como key; si ya es key, la normalizamos
            if (is_string($v) && str_starts_with($v, 'http')) {
                $parts = parse_url($v);
                $path  = $parts['path'] ?? '';
                $key   = ltrim($path, '/');
            } else {
                $key = ltrim((string)$v, '/');
            }
            // Solo aceptamos imágenes
            if (!preg_match('/\.(png|jpe?g|gif|webp|svg)$/i', $key)) return null;
            return $key;
        };

        $keys = [];
        foreach ($candidates as $val) {
            $k = $toKey($val);
            if ($k) $keys[$k] = true; // set-like para evitar duplicados
        }

        return array_keys($keys);
    }

    /**
     * Verifica si la key de S3 sigue referenciada por OTRA pregunta.
     * Busca tanto por key directa como (por si acaso) por la URL pública.
     */
    private function isS3KeyInUse(string $key): bool
    {
        // Si guardas URL en BD, esta línea ayuda a cubrir ambos casos
        $url = Storage::disk('s3')->url($key);

        return $this->model->where(function ($q) use ($key, $url) {
            $q->orWhere('question_image', $key)
            ->orWhere('question_image', $url)
            ->orWhere('feedback_image', $key)
            ->orWhere('feedback_image', $url)
            ->orWhere('answer_a', $key)
            ->orWhere('answer_a', $url)
            ->orWhere('answer_b', $key)
            ->orWhere('answer_b', $url)
            ->orWhere('answer_c', $key)
            ->orWhere('answer_c', $url)
            ->orWhere('answer_d', $key)
            ->orWhere('answer_d', $url);
        })->exists();
    }
}
