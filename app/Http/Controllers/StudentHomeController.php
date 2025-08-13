<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Test;
use Illuminate\Support\Facades\DB;

class StudentHomeController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Trae tests con lo mínimo necesario
        $tests = Test::with('subject:id,name')
            ->where('user_id', $userId)
            ->orderBy('updated_at', 'desc')
            ->get(['id','user_id','subject_id','question_level_id','is_completed','created_at','updated_at']);

        if ($tests->isEmpty()) {
            return [
                'kpis' => [
                    'testsTaken'      => 0,
                    'testsCompleted'  => 0,
                    'completionRate'  => 0,
                    'avgPercent'      => 0,
                    'bestPercent'     => 0,
                    'latestPercent'   => 0,
                ],
                'sparkline' => [],
                'quick' => [
                    'continueTest'     => null,
                    'weakestSubject'   => null,
                    'recommended'      => [],
                ],
                'subjectsTop' => [],
            ];
        }

        $testIds = $tests->pluck('id');

        // Agregados por test (correct/total)
        $perTest = DB::table('test_questions')
            ->select('test_id')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->whereIn('test_id', $testIds)
            ->groupBy('test_id')
            ->get()
            ->keyBy('test_id');

        // Totales globales
        $totals = DB::table('test_questions')
            ->whereIn('test_id', $testIds)
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->first();

        // Serie "sparkline": últimos N tests con % (usa updated_at para orden)
        $sparkline = $tests->take(8)->map(function ($t) use ($perTest) {
            $row = $perTest[$t->id] ?? null;
            $pct = ($row && $row->total > 0) ? (int) round(100 * $row->correct / $row->total) : 0;
            return [
                'label'   => $t->subject->name ?? '—',
                'percent' => $pct,
                'date'    => (string) $t->updated_at,
            ];
        })->reverse()->values(); // más antiguo -> más reciente

        // KPIs
        $testsTaken     = $tests->count();
        $testsCompleted = $tests->where('is_completed', 1)->count();
        $completionRate = $testsTaken ? round(100 * $testsCompleted / $testsTaken) : 0;
        $avgPercent     = ($totals && $totals->total > 0) ? (int) round(100 * $totals->correct / $totals->total) : 0;
        $bestPercent    = $sparkline->max('percent') ?? 0;
        $latestPercent  = optional($sparkline->last())['percent'] ?? 0;

        // Tiempo invertido (minutos) ~ suma de duraciones por test
        $timeSpentSec = $tests->sum(function ($t) {
            return max(0, strtotime($t->updated_at) - strtotime($t->created_at));
        });
        $timeSpentMin = (int) floor($timeSpentSec / 60);

        // Siguiente test a continuar (primero no completado más reciente)
        $continueTest = $tests->firstWhere('is_completed', 0);
        $continue = $continueTest ? [
            'test_id'    => $continueTest->id,
            'subject_id' => $continueTest->subject_id,
            'subject'    => optional($continueTest->subject)->name,
        ] : null;

        // Agregación por materia (para "Top materias")
        $aggBySubject = [];
        foreach ($tests as $t) {
            $name = optional($t->subject)->name ?? 'Sin materia';
            $row  = $perTest[$t->id] ?? null;

            if (!isset($aggBySubject[$name])) {
                $aggBySubject[$name] = ['correct'=>0, 'total'=>0, 'tests'=>0];
            }
            if ($row) {
                $aggBySubject[$name]['correct'] += (int) $row->correct;
                $aggBySubject[$name]['total']   += (int) $row->total;
            }
            $aggBySubject[$name]['tests']++;
        }

        $subjectsTop = collect($aggBySubject)
            ->map(function ($v, $name) {
                $pct = $v['total'] > 0 ? (int) round(100 * $v['correct'] / $v['total']) : 0;
                return [
                    'name'     => $name,
                    'best'     => $pct,        // como resumen rápido
                    'worst'    => $pct,        // (si quieres, puedes calcular real worst/best por test)
                    'average'  => $pct,
                    'attempts' => $v['tests'],
                ];
            })
            ->sortByDesc('average')
            ->take(5)
            ->values();

        // Materia más débil (para recomendación)
        $weakestSubject = collect($aggBySubject)
            ->map(function ($v, $name) {
                $pct = $v['total'] > 0 ? (int) round(100 * $v['correct'] / $v['total']) : 0;
                return ['name' => $name, 'average' => $pct, 'attempts'=>$v['tests']];
            })
            ->sortBy('average')
            ->first();

        $kpis = [
            'testsTaken'      => $testsTaken,
            'testsCompleted'  => $testsCompleted,
            'completionRate'  => $completionRate,
            'avgPercent'      => $avgPercent,
            'bestPercent'     => $bestPercent,
            'latestPercent'   => $latestPercent,
        ];

        return [
            'kpis'       => $kpis,
            'sparkline'  => $sparkline,
            'quick'      => [
                'continueTest'   => $continue,
                'weakestSubject' => $weakestSubject,
                'recommended'    => $subjectsTop->take(3),
            ],
            'subjectsTop'=> $subjectsTop,
        ];
    }
}
