<?php

namespace App\Http\Services;

use App\Models\MultitaskQuestion;
use App\Models\QuestionType;
use App\Models\QuestionLevel;

class MultitaskQuestionFactoryService
{
    public function generate()
    {
        $type = QuestionType::where('name', 'MULTITASKING')->first();
        MultitaskQuestion::where('question_type_id', $type->id)->delete();
        $level = QuestionLevel::where('question_type_id', $type->id)->where('name', "NIVEL 1")->first();


        if (!$type || !$level) {
            throw new \Exception("Falta el tipo de pregunta o nivel para multitask.");
        }

        $questions = [];

        // Generar preguntas tipo 'math'
        foreach (range(1, 100) as $i) {
            $a = rand(1, 12);
            $b = rand(1, 12);
            $result = $a * $b;
            $isCorrect = rand(0, 1);

            $question = "$a * $b = " . ($isCorrect ? $result : $result + rand(1, 3));

            $questions[] = [
                'question' => $question,
                'answer' => $isCorrect ? 'Correcto' : 'Incorrecto',
                'type' => 'math',
                'option_a' => 'Correcto',
                'option_b' => 'Incorrecto',
                'option_c' => null,
                'question_type_id' => $type->id,
                'question_level_id' => $level->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Generar preguntas tipo 'figure'
        foreach (range(1, 100) as $i) {
            // Figuras posibles
            $symbols = ['▲', '■', '★', '⬡', '●', '◆', '⬤'];

            // Elegir una figura que se repetirá
            $repeated = $symbols[array_rand($symbols)];

            // Elegir 4 figuras únicas diferentes a la repetida
            $others = collect($symbols)->filter(fn($s) => $s !== $repeated)->random(4)->toArray();

            // Insertar la figura repetida en una posición aleatoria 2 veces
            $figures = $others;
            array_splice($figures, rand(0, 4), 0, $repeated);
            array_splice($figures, rand(0, 5), 0, $repeated);
            $figures = array_slice($figures, 0, 5); // asegura solo 5

            // Respuesta correcta
            $correctCount = collect($figures)->filter(fn($f) => $f === $repeated)->count();

            $questions[] = [
                'question' => implode('|', $figures), // guarda las figuras en formato string
                'answer' => "x$correctCount",
                'type' => 'figure',
                'option_a' => 'x1',
                'option_b' => 'x2',
                'option_c' => 'x3',
                'question_type_id' => $type->id,
                'question_level_id' => $level->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }


        MultitaskQuestion::insert($questions);
    }
}
