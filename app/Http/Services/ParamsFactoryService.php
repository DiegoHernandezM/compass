<?php

namespace App\Http\Services;

use App\Models\Question;

class ParamsFactoryService
{
    public function generateMemoryVisualQuestions(int $typeId): void
    {
        
        Question::where('question_type_id', $typeId)->delete();
        $questions = [];

        // Definir niveles y cuántos parámetros deben recordarse
        $levels = [
            ['id' => 14, 'param_count' => 1],
            ['id' => 15, 'param_count' => 2],
            ['id' => 16, 'param_count' => 4],
        ];

        foreach ($levels as $level) {
            foreach (range(1, 100) as $i) {
                $paramCount = $level['param_count'];
                $levelId = $level['id'];

                // Elegir parámetros aleatorios
                $allParams = ['ALTITUDE', 'HEADING', 'SPEED', 'FREQUENCY'];
                shuffle($allParams);
                $selected = array_slice($allParams, 0, $paramCount);

                $allValues = $this->generateMemoryParameterValues();

                // Armar bloque de texto con todos los parámetros visibles
                $questionText = "";
                foreach ($allParams as $param) {
                    $questionText .= "$param: " . $allValues[$param] . "\n";
                }
                // Respuestas posibles (se mezclan todos los valores aunque no todos sean preguntados)
                $answers = array_values($allValues);
                shuffle($answers);
                $questions[] = [
                    'question' => trim($questionText),
                    'answer_a' => $answers[0] ?? '',
                    'answer_b' => $answers[1] ?? '',
                    'answer_c' => $answers[2] ?? '',
                    'answer_d' => $answers[3] ?? '',
                    'correct_answer' => 'A',
                    'question_type_id' => $typeId,
                    'question_level_id' => $levelId,
                    'has_dynamic' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        Question::insert($questions);
    }

    private function generateMemoryParameterValues(): array
    {
        return [
            'ALTITUDE' => (rand(1, 430) * 100),
            'HEADING' => str_pad(rand(0, 359), 3, '0', STR_PAD_LEFT),
            'SPEED' => rand(1, 999),
            'FREQUENCY' => number_format(rand(1080, 1370) / 10, 1),
        ];
    }

}
