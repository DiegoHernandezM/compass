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
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing as FileDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Illuminate\Support\Str;

class QuestionService
{
    protected $model;
    protected $mTypes;
    protected $mLevels;
    protected $mMultitaskQuestions;
    protected $mSubject;
    protected $mMemoryTest;
    protected $mQuestionSubject;

    public function __construct()
    {
        $this->model = new Question();
        $this->mTypes = new QuestionType();
        $this->mMultitaskQuestions = new MultitaskQuestion();
        $this->mSubject = new Subject();
        $this->mLevels = new QuestionLevel();
        $this->mMemoryTest = new MemoryTest();
        $this->mQuestionSubject = new QuestionSubject();
    }

    public function getAll()
    {
        return $this->model->get();
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
        $question = $this->model->find($id);
        if (isset($data['feedback_image'])) {
            if ($question->feedback_image) Storage::disk('s3')->delete($question->feedback_image);
            $data['feedback_image'] = $data['feedback_image']->store('atpl/feedback', 's3');
        }
        $question->update($data);
        return $question;
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
        $question = $this->model->find($id);
        if ($question->feedback_image) {
            Storage::disk('s3')->delete($question->feedback_image);
        }
        $question->delete();
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
            'game'
        ]);
        $type = $this->mTypes->find($data['question_type_id']);
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


    /*
    private function extractImagesWithMap(string $file, string $baseFolder, array $colKeyMap): array
    {
        $spreadsheet = IOFactory::load($file);
        $sheet = $spreadsheet->getActiveSheet();
        $drawings = $sheet->getDrawingCollection();

        $imagesByKey = [];

        foreach ($drawings as $drawing) {
            $coordinates = $drawing->getCoordinates(); // e.g. B3
            $column = preg_replace('/[0-9]/', '', $coordinates); // B
            $row    = preg_replace('/[^0-9]/', '', $coordinates); // 3

            $baseKey = $colKeyMap[strtoupper($column)] ?? null;
            if (!$baseKey) continue;

            $tmpPath = tempnam(sys_get_temp_dir(), 'img_');

            if ($drawing instanceof MemoryDrawing) {
                ob_start();
                call_user_func(
                    $drawing->getRenderingFunction(),
                    $drawing->getImageResource()
                );
                $imageData = ob_get_clean();
                file_put_contents($tmpPath, $imageData);
            } else {
                file_put_contents($tmpPath, file_get_contents($drawing->getPath()));
            }

            // putFile retorna algo como "spatial/questions/archivo.png"
            $s3Path = Storage::disk('s3')->putFile($baseFolder, $tmpPath);

            @unlink($tmpPath);

            $key = "{$baseKey}_{$row}";
            $imagesByKey[$key] = $s3Path; // <-- aquí ya es solo la key, sin URL pública
        }

        return $imagesByKey;
    }
    */

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

    /*
    private function putToS3FromBytes(string $baseFolder, string $hash, string $ext, string $bytes): string
    {
        // Nombre estable basado en hash (evita duplicados en S3):
        $key = trim($baseFolder, '/').'/'.$hash.'.'.$ext;
        if (!Storage::disk('s3')->exists($key)) {
            Storage::disk('s3')->put($key, $bytes, ['visibility' => 'public']);
        }
        return $key; // guarda esto en DB
    }
    */

    private function makeTmpFromBytes(string $bytes, string $ext = 'png'): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'img_');
        file_put_contents($tmp, $bytes);

        // renombra para conservar extensión (ayuda a detectar mimetype)
        $tmpWithExt = $tmp.'.'.ltrim($ext, '.');
        @rename($tmp, $tmpWithExt);

        return $tmpWithExt;
    }

}
