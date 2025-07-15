<?php

namespace App\Http\Services;

use App\Models\Question;

class QuestionFactoryService
{
    public function generateMathQuestions(int $typeId)
    {
        $questions = [];

        // Nivel 1: Sumas y restas
        foreach (range(1, 30) as $i) {
            $a = rand(1, 50);
            $b = rand(1, 50);
            $isAddition = rand(0, 1);
            $questionText = $isAddition
                ? "¿Cuánto es $a + $b?"
                : "¿Cuánto es $a - $b?";
            $correct = $isAddition ? $a + $b : $a - $b;
            $questions[] = $this->buildQuestion($typeId, 1, $questionText, $correct);
        }

        // Nivel 2: Multiplicación, división, fracciones, porcentajes, conversiones
        foreach (range(1, 30) as $i) {
            $op = rand(1, 5);
            switch ($op) {
                case 1:
                    $a = rand(1, 12); $b = rand(1, 12);
                    $text = "¿Cuánto es $a × $b?"; $correct = $a * $b;
                    break;
                case 2:
                    $b = rand(1, 12); $correct = rand(1, 12); $a = $b * $correct;
                    $text = "¿Cuánto es $a ÷ $b?";
                    break;
                case 3:
                    $a = rand(1, 9); $b = rand(2, 10);
                    $text = "¿Cuánto es $a/$b?"; $correct = round($a / $b, 2);
                    break;
                case 4:
                    $base = rand(50, 200); $percent = rand(10, 90);
                    $text = "¿Cuánto es $percent% de $base?"; $correct = round($base * $percent / 100, 2);
                    break;
                case 5:
                    $cm = rand(100, 1000);
                    $text = "¿Cuántos metros son $cm cm?"; $correct = round($cm / 100, 2);
                    break;
            }
            $questions[] = $this->buildQuestion($typeId, 2, $text, $correct);
        }

        // Nivel 3: Pitágoras, ecuaciones, volumen
        foreach (range(1, 30) as $i) {
            $op = rand(1, 3);
            switch ($op) {
                case 1:
                    $a = rand(3, 10); $b = rand(3, 10);
                    $text = "Si un triángulo tiene catetos $a y $b, ¿cuánto mide la hipotenusa?";
                    $correct = round(sqrt($a**2 + $b**2), 2);
                    break;
                case 2:
                    $x = rand(1, 20); $a = rand(1, 10); $b = $a * $x;
                    $text = "Si $a × x = $b, ¿cuánto vale x?"; $correct = $x;
                    break;
                case 3:
                    $l = rand(2, 10); $v = $l ** 3;
                    $text = "¿Cuál es el volumen de un cubo con lado $l cm?"; $correct = $v;
                    break;
            }
            $questions[] = $this->buildQuestion($typeId, 3, $text, $correct);
        }

        Question::insert($questions);
    }

    private function buildQuestion($typeId, $levelId, $questionText, $correct)
    {
        $options = $this->generateOptions($correct);
        return [
            'question' => $questionText,
            'answer_a' => (string)$options['a'],
            'answer_b' => (string)$options['b'],
            'answer_c' => (string)$options['c'],
            'answer_d' => (string)$options['d'],
            'correct_answer' => $options['correct_key'],
            'question_type_id' => $typeId,
            'question_level_id' => $levelId,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function generateOptions($correct)
    {
        $keys = ['a', 'b', 'c', 'd'];
        $correctKey = $keys[array_rand($keys)];

        $options = [];
        foreach ($keys as $key) {
            if ($key === $correctKey) {
                $options[$key] = $correct;
            } else {
                $delta = rand(1, 10);
                $value = is_numeric($correct) && is_float($correct)
                    ? round($correct + ($delta * (rand(0, 1) ? 1 : -1)), 2)
                    : $correct + ($delta * (rand(0, 1) ? 1 : -1));
                $options[$key] = $value;
            }
        }
        $options['correct_key'] = $correctKey;

        return $options;
    }
}
