<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\DB;
use \App\Models\Test;

class TestService
{
    protected $mTest;

    public function __construct()
    {
        $this->mTest = new Test();
    }

    public function saveStudentAnswer($data)
    {
        return DB::transaction(function () use ($data) {
            // 1) Cargar el test con sus preguntas
            $test = Test::with('testQuestions')->findOrFail($data['test_id']);

            // 2) Determinar el ID de la pregunta (del objeto current_question)
            $questionArr = $data['current_question'] ?? [];
            $questionId  = $questionArr['id']
                ?? ($questionArr['question_id'] ?? null);

            // 3) Validar que la pregunta exista en el test
            if (!$questionId) {
                throw new \RuntimeException('No se pudo determinar el ID de la pregunta.');
            }

            // 4) Ubicar la fila de TestQuestion correspondiente a esta pregunta dentro del test
            $testQuestion = $test->testQuestions()
                ->where('id', $questionId)
                ->first();

            // Fallback opcional por texto si fuera necesario
            if (!$testQuestion && !empty($questionArr['question_text'])) {
                $testQuestion = $test->testQuestions()
                    ->where('question_text', $questionArr['question_text'])
                    ->first();
            }

            if (!$testQuestion) {
                throw new \RuntimeException('La pregunta no pertenece a este test.');
            }

            // 4) Guardar respuesta del usuario y si fue correcta
            $testQuestion->update([
                'user_answer' => $data['user_answer'] ?? null,  
                'is_correct'  => !empty($data['is_correct']) ? 1 : 0,
            ]);

            // 5) Recalcular progreso
            $total    = $test->testQuestions()->count();
            $answered = $test->testQuestions()
                ->whereNotNull('is_correct')
                ->count();

            // 6) Calcular progreso
            $progress = $total > 0 ? (int) round(($answered / $total) * 100) : 0;
            $isCompleted = ($answered === $total) ? 1 : 0;

            // 7) Actualizar el test con el progreso
            $test->progress = $progress;
            $test->is_completed = $isCompleted;


            $test->save();

            // 8) Retornar algo útil al frontend (opcional)
            return [
                'progress'      => $progress,
                'is_completed'  => (int) $isCompleted,
                'answered'      => $answered,
                'total'         => $total,
                'question_id'   => $questionId,
            ];
        });
    }
}
