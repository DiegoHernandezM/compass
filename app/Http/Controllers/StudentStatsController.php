<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestQuestion;


class StudentStatsController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // 1) Tests del usuario (solo columnas necesarias) + subject compacto
        $tests = Test::with(['subject:id,name'])
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get([
                'id','user_id','subject_id','question_level_id',
                'is_completed','created_at','updated_at'
            ]);

        if ($tests->isEmpty()) {
            return Inertia::render('Student/Results/Index', [
                'stats' => [
                    'testsTaken'      => 0,
                    'testsCompleted'  => 0,
                    'completionRate'  => 0,
                    'avgPercent'      => 0,
                    'bestPercent'     => 0,
                    'latestPercent'   => 0,
                    'avgDurationSec'  => 0,
                    'timeline'        => [],
                    'byType'          => [],
                    'byLevel'         => [],
                    'subjectsChart'   => [],
                    'subjectSummary'  => [],
                    'recentMistakes'  => [], // si no lo vas a usar, bórralo
                ],
            ]);
        }

        $testIds = $tests->pluck('id');

        // 2) correct/total por test en UNA consulta
        $perTest = DB::table('test_questions')
            ->select(
                'test_id',
                DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) AS correct'),
                DB::raw('COUNT(*) AS total')
            )
            ->whereIn('test_id', $testIds)
            ->groupBy('test_id')
            ->get()
            ->keyBy('test_id');

        // 3) KPIs globales derivados de $perTest (sin otra query)
        $sumCorrect = (int) $perTest->sum('correct');
        $sumTotal   = (int) $perTest->sum('total');

        $taken      = $tests->count();
        $completed  = $tests->where('is_completed', 1)->count();
        $completionRate = $taken ? (int) round(100 * $completed / $taken) : 0;
        $avgPercent = $sumTotal > 0 ? (int) round(100 * $sumCorrect / $sumTotal) : 0;

        // 4) Timeline por test (usa $perTest ya calculado)
        $timeline = $tests->map(function ($t) use ($perTest) {
            $row = $perTest[$t->id] ?? null;
            $pct = ($row && $row->total > 0) ? (int) round(100 * $row->correct / $row->total) : 0;
            $duration = max(0, strtotime($t->updated_at) - strtotime($t->created_at));
            return [
                'test_id'    => $t->id,
                'subject_id' => $t->subject_id,
                'date'       => (string) $t->updated_at,
                'percent'    => $pct,
                'duration'   => $duration,
            ];
        });

        // 1) Seguimos necesitando $tests (con ->subject) y $perTest (correct/total por test)
        //     ya lo tienes arriba. Asegúrate de que $tests esté ordenado cronológicamente.
        $testsSorted = $tests->sortBy('updated_at');

        // 2) Contadores de intento por materia (por nombre).
        $attemptBySubject = [];
        $rowsByAttempt = [];   // matriz "wide": attempt => [ 'attempt'=>n, 'Mate'=>pct, 'ATPL'=>pct, ... ]
        $subjectKeys = [];     // lista de columnas (materias)

        foreach ($testsSorted as $t) {
            $subjName = optional($t->subject)->name ?? 'Sin materia';
            $row      = $perTest[$t->id] ?? null;
            $pct      = ($row && $row->total > 0) ? (int) round(100 * $row->correct / $row->total) : 0;

            // intento # para esta materia
            $attemptBySubject[$subjName] = ($attemptBySubject[$subjName] ?? 0) + 1;
            $attempt = $attemptBySubject[$subjName];

            // registra clave materia
            $subjectKeys[$subjName] = true;

            // crea fila para este attempt si no existe
            if (!isset($rowsByAttempt[$attempt])) {
                $rowsByAttempt[$attempt] = ['attempt' => $attempt];
            }
            // coloca el % en la columna de su materia para ese intento
            $rowsByAttempt[$attempt][$subjName] = $pct;
        }

        // 3) Normaliza a array indexado y ordenado por attempt
        $multiTimeline = collect($rowsByAttempt)->sortBy('attempt')->values()->all();
        // 4) Lista ordenada de materias (columnas) para el front
        $subjectKeys = array_keys($subjectKeys);

        $bestPercent   = (int) ($timeline->max('percent') ?? 0);
        $latestPercent = (int) (optional($timeline->first())['percent'] ?? 0);

        $avgDuration = $timeline->count() ? (int) round($timeline->avg('duration')) : 0;

        // 5) Acumulado por materia para gráfico de barras (sin query extra)
        $bySubjectAgg = [];
        foreach ($tests as $t) {
            $name = optional($t->subject)->name ?? 'Sin materia';
            $row  = $perTest[$t->id] ?? null;

            if (!isset($bySubjectAgg[$name])) {
                $bySubjectAgg[$name] = ['correct' => 0, 'total' => 0, 'tests' => 0];
            }
            if ($row) {
                $bySubjectAgg[$name]['correct'] += (int) $row->correct;
                $bySubjectAgg[$name]['total']   += (int) $row->total;
            }
            $bySubjectAgg[$name]['tests']++;
        }

        $subjectsChart = collect($bySubjectAgg)
            ->map(function ($v, $name) {
                $pct = $v['total'] > 0 ? (int) round(100 * $v['correct'] / $v['total']) : 0;
                return [
                    'name'    => $name,
                    'percent' => $pct,
                    'correct' => (int) $v['correct'],
                    'total'   => (int) $v['total'],
                    'tests'   => (int) $v['tests'],
                ];
            })
            ->sortByDesc('percent')
            ->values();

        // 6) Resumen por materia (mejor/peor/promedio/repeticiones), también sin query extra
        $subjectSummary = $tests
            ->map(function ($t) use ($perTest) {
                $row = $perTest[$t->id] ?? null;
                $pct = ($row && $row->total > 0) ? (int) round(100 * $row->correct / $row->total) : 0;
                return [
                    'subject_id' => $t->subject_id,
                    'subject'    => optional($t->subject)->name ?? 'Sin materia',
                    'percent'    => $pct,
                ];
            })
            ->groupBy('subject_id')
            ->map(function ($items, $subjectId) {
                $name  = $items->first()['subject'];
                $percs = $items->pluck('percent');
                return [
                    'subject_id'  => $subjectId,
                    'subject'     => $name,
                    'best'        => (int) $percs->max(),
                    'worst'       => (int) $percs->min(),
                    'repetitions' => $items->count(),
                    'avg'         => (int) round($percs->avg()),
                ];
            })
            ->sortByDesc('avg')
            ->values();

        // 7) Por nivel (sin query extra, usando $tests + $perTest)
        $byLevel = $tests->groupBy('question_level_id')->map(function ($group, $levelId) use ($perTest) {
            $correct = 0;
            $total   = 0;
            foreach ($group as $t) {
                $row = $perTest[$t->id] ?? null;
                if ($row) {
                    $correct += (int) $row->correct;
                    $total   += (int) $row->total;
                }
            }
            return [
                'question_level_id' => $levelId,
                'correct'           => $correct,
                'total'             => $total,
            ];
        })->values();

        // 8) Por tipo (necesita la columna type ⇒ 1 query)
        $byType = DB::table('test_questions')
            ->whereIn('test_id', $testIds)
            ->groupBy('type')
            ->select('type')
            ->selectRaw('SUM(is_correct = 1) AS correct, COUNT(*) AS total')
            ->get();

        // 9) Errores recientes (si lo sigues usando; si no, bórralo para reducir otra query)
        $recentMistakes = DB::table('test_questions')
            ->whereIn('test_id', $testIds)
            ->where('is_correct', 0)
            ->orderBy('updated_at','desc')
            ->limit(10)
            ->get(['test_id','question_text','correct_answer','user_answer','updated_at','type']);

        // 10) Empaquetar stats
        $stats = [
            'testsTaken'      => $taken,
            'testsCompleted'  => $completed,
            'completionRate'  => $completionRate,
            'avgPercent'      => $avgPercent,
            'bestPercent'     => $bestPercent,
            'latestPercent'   => $latestPercent,
            'avgDurationSec'  => $avgDuration,
            'multiTimeline'   => $multiTimeline,
            'timeline'        => $timeline,       // para línea/área temporal
            'subjectsChart'   => $subjectsChart,  // para barra por materias
            'subjectSummary'  => $subjectSummary, // tabla top materias
            'byType'          => $byType,         // dona/barras por tipo
            'byLevel'         => $byLevel,        // barras por nivel
            'subjectKeys'     => $subjectKeys,    // para gráfico de líneas
            'recentMistakes'  => $recentMistakes, // opcional
        ];

        return Inertia::render('Student/Results/Index', [
            'stats' => $stats
        ]);
    }
}
