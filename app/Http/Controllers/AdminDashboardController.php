<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
     public function index()
    {
        // --- KPIs básicos ---
        $studentsCount = DB::table('students')->count();
        $subjectsCount = DB::table('subjects')->count();

        // Ingresos (solo estados válidos)
        $revenueTotal = (float) DB::table('paypal_user')
            ->whereIn('status', ['COMPLETED', 'active'])
            ->sum(DB::raw('COALESCE(amount,0)'));

        // Suscripciones activas (expiran en el futuro)
        $activeSubscriptions = DB::table('paypal_user')
            ->where('expires_at', '>', now())
            ->count();

        // Promedio general de aciertos del sistema
        $totals = DB::table('test_questions')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->first();
        $avgPercent = ($totals && $totals->total > 0)
            ? (int) round(100 * $totals->correct / $totals->total)
            : 0;

        // --- Serie de ingresos por mes (últimos 12) ---
        $incomeSeries = DB::table('paypal_user')
            ->selectRaw("DATE_FORMAT(create_time, '%Y-%m') as ym")
            ->selectRaw('SUM(COALESCE(amount,0)) as amount')
            ->whereIn('status', ['COMPLETED', 'active'])
            ->where('create_time', '>=', now()->subMonths(12))
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Normaliza meses faltantes a 0
        $series = collect();
        for ($i = 11; $i >= 0; $i--) {
            $k = now()->subMonths($i)->format('Y-m');
            $found = $incomeSeries->firstWhere('ym', $k);
            $series->push([
                'ym'     => $k,
                'amount' => $found ? (float) $found->amount : 0.0,
            ]);
        }

        // --- Repetición de test por materia + % promedio ---
        // 1) por test: correct/total
        $perTest = DB::table('test_questions')
            ->select('test_id')
            ->selectRaw('SUM(is_correct = 1) as correct, COUNT(*) as total')
            ->groupBy('test_id')
            ->get()->keyBy('test_id');

        // 2) agrupa por materia
        $tests = DB::table('tests')->select('id','subject_id')->get();
        $bySubject = [];
        foreach ($tests as $t) {
            $key = $t->subject_id;
            $row = $perTest[$t->id] ?? null;
            if (!isset($bySubject[$key])) {
                $bySubject[$key] = ['tests'=>0,'correct'=>0,'total'=>0];
            }
            $bySubject[$key]['tests']++;
            if ($row) {
                $bySubject[$key]['correct'] += (int) $row->correct;
                $bySubject[$key]['total']   += (int) $row->total;
            }
        }

        // 3) trae nombres y arma dataset para BarChart
        $subjects = DB::table('subjects')->pluck('name','id');
        $testsBySubject = collect($bySubject)->map(function ($v, $subjectId) use ($subjects) {
            $pct = $v['total'] > 0 ? (int) round(100 * $v['correct'] / $v['total']) : 0;
            return [
                'name'        => $subjects[$subjectId] ?? "ID {$subjectId}",
                'tests'       => $v['tests'],
                'percent'     => $pct,
            ];
        })->sortByDesc('tests')->values();

        // --- Top estudiantes por cantidad de tests (y % promedio) ---
        $perStudent = DB::table('tests as t')
            ->join('students as s','s.user_id','=','t.user_id')
            ->leftJoin('test_questions as q','q.test_id','=','t.id')
            ->groupBy('t.user_id','s.name')
            ->select('t.user_id','s.name')
            ->selectRaw('COUNT(DISTINCT t.id) as tests_count')
            ->selectRaw('SUM(q.is_correct = 1) as correct')
            ->selectRaw('COUNT(q.id) as total')
            ->orderByDesc('tests_count')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                $avg = $r->total > 0 ? (int) round(100 * $r->correct / $r->total) : 0;
                return [
                    'user_id'     => $r->user_id,
                    'name'        => $r->name,
                    'tests_count' => (int) $r->tests_count,
                    'avg_percent' => $avg,
                ];
            });

        // KPIs pack
        $kpis = [
            'studentsCount'      => (int) $studentsCount,
            'revenueTotal'       => (float) $revenueTotal,
            'subjectsCount'      => (int) $subjectsCount,
            'activeSubscriptions'=> (int) $activeSubscriptions,
            'avgPercent'         => (int) $avgPercent,
        ];

        return [
            'kpis'           => $kpis,
            'incomeSeries'   => $series,          
            'testsBySubject' => $testsBySubject,  
            'topStudents'    => $perStudent,      
        ];
    }
}
