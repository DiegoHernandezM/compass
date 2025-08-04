<?php

namespace App\Http\Services;

use App\Models\Question;

class QuestionFactoryService
{
    public function generateMathQuestions(int $typeId)
    {
        // 1. Eliminar preguntas anteriores del tipo
        Question::where('question_type_id', $typeId)->delete();
        $questions = [];

        // Nivel 1: Sumas y restas
        foreach (range(1, 100) as $i) {
            $a = rand(1, 50);
            $b = rand(1, 50);
            $isAddition = rand(0, 1);
            $questionText = $isAddition
                ? "What is $a + $b?"
                : "What is $a - $b?";
            $correct = $isAddition ? $a + $b : $a - $b;
            $questions[] = $this->buildQuestion($typeId, 1, $questionText, $correct);
        }

        // Nivel 2: Multiplicación, división, fracciones, porcentajes, conversiones
        foreach (range(1, 100) as $i) {
            $op = rand(1, 5);

            switch ($op) {
                case 1: // Multiplication
                    $a = rand(1, 12);
                    $b = rand(1, 12);
                    $text = "What is $a × $b?";
                    $correct = $a * $b;
                    break;

                case 2: // Division
                    $b = rand(1, 12);
                    $correct = rand(1, 12);
                    $a = $b * $correct;
                    $text = "What is $a ÷ $b?";
                    break;

                case 3: // Fractions
                    $a = rand(1, 9);
                    $b = rand(2, 10);
                    $text = "What is the result of $a/$b?";
                    $correct = round($a / $b, 2);
                    break;

                case 4: // Percentages
                    $base = rand(50, 200);
                    $percent = rand(10, 90);
                    $text = "What is $percent% of $base?";
                    $correct = round($base * $percent / 100, 2);
                    break;

                case 5: // Unit conversion (cm to m)
                    $cm = rand(100, 1000);
                    $text = "How many meters are in $cm cm?";
                    $correct = round($cm / 100, 2);
                    break;
            }

            $questions[] = $this->buildQuestion($typeId, 2, $text, $correct);
        }

       // Nivel 3: Word problems, Pythagorean theorem, equations, volume
        foreach (range(1, 100) as $i) {
            $op = rand(1, 4);

            switch ($op) {
                case 1: // Pythagorean
                    $a = rand(3, 12);
                    $b = rand(3, 12);
                    $c = round(sqrt($a ** 2 + $b ** 2), 2);
                    $text = "If a triangle has legs $a and $b, what is the length of the hypotenuse?";
                    $correct = $c;
                    break;

                case 2: // Simple equation
                    $x = rand(1, 10);
                    $z = rand(1, 10);
                    $y = (-5 * $x + 2 * $z) / 3;
                    $text = "What is y in the equation 3x + 4y - 2z = y - 2x?";
                    $correct = "y = " . round($y, 2);
                    break;

                case 3: // Fuel consumption
                    $total = 750;
                    $usedPercent = rand(10, 50);
                    $used = $total * ($usedPercent / 100);
                    $left = $total - $used;
                    $text = "An airplane can store 750 liters of fuel. How much fuel is left when $usedPercent% has been used?";
                    $correct = round($left, 2) . " lt";
                    break;

                case 4: // Time duration
                    $startHour = rand(0, 22);
                    $startMinute = rand(0, 59);
                    $duration = rand(30, 360);
                    $end = \Carbon\Carbon::createFromTime($startHour, $startMinute)->addMinutes($duration);
                    $text = "An aircraft takes off at " . str_pad($startHour, 2, '0', STR_PAD_LEFT) . ":" . str_pad($startMinute, 2, '0', STR_PAD_LEFT) . " UTC and lands at " . $end->format('H:i') . " UTC. What is the total flight time in minutes?";
                    $correct = $duration . " min";
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
                $options[$key] = $this->generateFakeOption($correct);
            }
        }

        $options['correct_key'] = $correctKey;
        return $options;
    }

    private function generateFakeOption($correct)
    {
        if (is_numeric($correct)) {
            $delta = rand(1, 15);
            return $correct + ($delta * (rand(0, 1) ? 1 : -1));
        }

        if (preg_match('/^\d+(\.\d+)?\s?lt$/', $correct)) {
            $val = floatval($correct);
            return round($val + rand(-50, 50), 2) . " lt";
        }

        if (preg_match('/^\d+\s?min$/', $correct)) {
            $val = intval($correct);
            return ($val + rand(-30, 30)) . " min";
        }

        if (preg_match('/^y =/', $correct)) {
            return 'y = (' . rand(-10, 10) . 'x + ' . rand(-5, 5) . 'z) / ' . rand(1, 5);
        }

        return 'Option ' . rand(100, 999);
    }
}
