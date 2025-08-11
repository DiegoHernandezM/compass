<?php

namespace App\Exports\Sheets;

use App\Models\PersonalReport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\{
    FromArray, WithTitle, WithColumnFormatting
};
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class ResumenSheet implements FromArray, WithTitle, WithColumnFormatting
{
    public function title(): string
    {
        return 'Resumen';
    }

    public function columnFormats(): array
    {
        return [
            'B2' => NumberFormat::FORMAT_NUMBER,
            'B3' => NumberFormat::FORMAT_NUMBER,
            'B4' => NumberFormat::FORMAT_NUMBER,
            'B5' => NumberFormat::FORMAT_NUMBER,
            'B6' => NumberFormat::FORMAT_NUMBER,
            'B7' => NumberFormat::FORMAT_NUMBER,
        ];
    }

    public function array(): array
    {
        // Definición "abierto": closed_at NULL
        $q = PersonalReport::query()->whereNull('closed_at');
        $now = Carbon::now();
        $days = fn($d) => $now->copy()->subDays($d);

        $total = (clone $q)->count();
        $w1   = (clone $q)->where('opened_at', '>=', $days(7))->count();
        $w2   = (clone $q)->whereBetween('opened_at', [$days(14), $days(7)])->count();
        $w3   = (clone $q)->whereBetween('opened_at', [$days(21), $days(14)])->count();
        $m1   = (clone $q)->whereBetween('opened_at', [$days(31), $days(21)])->count();
        $gt1m = (clone $q)->where('opened_at', '<', $days(31))->count();

        // Top ingeniero (asignado)
        $topEngineer = PersonalReport::query()
            ->select('assignee', DB::raw('COUNT(*) as abiertos'))
            ->whereNull('closed_at')
            ->whereNotNull('assignee')
            ->groupBy('assignee')
            ->orderByDesc('abiertos')
            ->first();

        // Top cliente
        $topClient = PersonalReport::query()
            ->select('client', DB::raw('COUNT(*) as abiertos'))
            ->whereNull('closed_at')
            ->whereNotNull('client')
            ->groupBy('client')
            ->orderByDesc('abiertos')
            ->first();

        return [
            ['Métrica', 'Valor'],
            ['Total abiertos',                 $total],
            ['Abiertos hace ≤ 1 semana',       $w1],
            ['Abiertos hace 2 semanas',        $w2],
            ['Abiertos hace 3 semanas',        $w3],
            ['Abiertos hace 1 mes (~21-31d)',  $m1],
            ['Abiertos > 1 mes',               $gt1m],
            [],
            ['Ingeniero con más abiertos', $topEngineer->assignee ?? 'N/D'],
            ['# tickets (ingeniero)',      $topEngineer->abiertos ?? 0],
            [],
            ['Cliente con más abiertos',   $topClient->client ?? 'N/D'],
            ['# tickets (cliente)',        $topClient->abiertos ?? 0],
        ];
    }
}
