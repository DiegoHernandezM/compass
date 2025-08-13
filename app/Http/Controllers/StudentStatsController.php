<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class StudentStatsController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Tests del usuario
        $tests = DB::table('tests')
            ->select('id','subject_id','is_completed','progress','created_at','updated_at','question_level_id')
            ->where('user_id', $userId)
            ->orderBy('updated_at','desc')
            ->get();

        $testIds = $tests->pluck('id');

        // Totales correctas/total
        $totals = DB::table('test_questions')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->whereIn('test_id', $testIds)
            ->first();

        // Accuracy por test (para serie temporal)
        $perTest = DB::table('test_questions')
            ->select('test_id')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->whereIn('test_id', $testIds)
            ->groupBy('test_id')
            ->get()
            ->keyBy('test_id');

        // Accuracy por materia
        $bySubject = DB::table('tests as t')
            ->join('test_questions as q','q.test_id','=','t.id')
            ->where('t.user_id', $userId)
            ->groupBy('t.subject_id')
            ->select('t.subject_id')
            ->selectRaw('SUM(q.is_correct = 1) as correct, COUNT(*) as total')
            ->get();

        // Por tipo de pregunta
        $byType = DB::table('test_questions')
            ->whereIn('test_id', $testIds)
            ->groupBy('type')
            ->select('type')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->get();

        // Por nivel
        $byLevel = DB::table('tests as t')
            ->join('test_questions as q','q.test_id','=','t.id')
            ->where('t.user_id', $userId)
            ->groupBy('t.question_level_id')
            ->select('t.question_level_id')
            ->selectRaw('SUM(q.is_correct = 1) as correct, COUNT(*) as total')
            ->get();

        // Errores recientes
        $recentMistakes = DB::table('test_questions')
            ->whereIn('test_id', $testIds)
            ->where('is_correct', 0)
            ->orderBy('updated_at','desc')
            ->limit(10)
            ->get(['test_id','question_text','correct_answer','user_answer','updated_at','type']);

        // Construir serie temporal con puntaje por test
        $timeline = $tests->map(function($t) use ($perTest){
            $row = $perTest[$t->id] ?? null;
            $pct = $row && $row->total > 0 ? round(100 * $row->correct / $row->total) : 0;
            $duration = max(0, strtotime($t->updated_at) - strtotime($t->created_at));
            return [
                'test_id'   => $t->id,
                'subject_id'=> $t->subject_id,
                'date'      => (string) $t->updated_at,
                'percent'   => $pct,
                'duration'  => $duration,
            ];
        });

        // KPIs
        $taken = $tests->count();
        $completed = $tests->where('is_completed', 1)->count();
        $completionRate = $taken ? round(100 * $completed / $taken) : 0;
        $avgPercent = ($totals && $totals->total > 0) ? round(100 * $totals->correct / $totals->total) : 0;
        $best = $timeline->max('percent') ?? 0;
        $latest = optional($timeline->first())['percent'] ?? 0;
        $avgDuration = $timeline->count()
            ? intval($timeline->avg('duration'))
            : 0;

        $stats = [
            'testsTaken'      => $taken,
            'testsCompleted'  => $completed,
            'completionRate'  => $completionRate,
            'avgPercent'      => $avgPercent,
            'bestPercent'     => $best,
            'latestPercent'   => $latest,
            'avgDurationSec'  => $avgDuration,
            'timeline'        => $timeline,
            'bySubject'       => $bySubject,
            'byType'          => $byType,
            'byLevel'         => $byLevel,
            'recentMistakes'  => $recentMistakes,
        ];

        return Inertia::render('Student/Results/Index', [
                'stats' => $stats
            ]);
    }
}
