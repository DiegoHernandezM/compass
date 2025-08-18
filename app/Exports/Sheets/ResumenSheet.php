<?php

namespace App\Exports\Sheets;

use App\Models\PersonalReport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\{WithTitle, WithEvents};
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ResumenSheet implements WithTitle, WithEvents
{
    public function title(): string
    {
        return 'Resumen';
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $ws = $event->sheet->getDelegate();

                // ===== KPIs base (tickets abiertos)
                $now = Carbon::now();

                $openQuery = PersonalReport::query()->whereNull('closed_at');

                $totalOpen = (clone $openQuery)->count();

                $oneWeek     = (clone $openQuery)->where('opened_at', '>=', $now->copy()->subDays(7))->where('active' , 1)->count();
                $twoWeeks    = (clone $openQuery)->whereBetween('opened_at', [$now->copy()->subDays(14), $now->copy()->subDays(8)])->where('active' , 1)->count();
                $threeWeeks  = (clone $openQuery)->whereBetween('opened_at', [$now->copy()->subDays(21), $now->copy()->subDays(15)])->where('active' , 1)->count();
                $oneMonth    = (clone $openQuery)->whereBetween('opened_at', [$now->copy()->subDays(31), $now->copy()->subDays(22)])->where('active' , 1)->count();
                $gtOneMonth  = (clone $openQuery)->where('opened_at', '<', $now->copy()->subDays(31))->count();

                // Top cliente con más tickets abiertos
                $topClient = (clone $openQuery)
                    ->selectRaw('COALESCE(NULLIF(TRIM(client),""), "SIN CLIENTE") as client, COUNT(*) as total')
                    ->groupBy('client')
                    ->orderByDesc('total')
                    ->first();

                // Ticket abierto más antiguo
                $oldest = (clone $openQuery)
                    ->select(['ticket_number','opened_at','client','assignee','status'])
                    ->orderBy('opened_at', 'asc')
                    ->first();

                // Tabla: tickets abiertos por cliente (Top 10)
                $byClient = (clone $openQuery)
                    ->selectRaw('COALESCE(NULLIF(TRIM(client),""), "SIN CLIENTE") as client, COUNT(*) as total')
                    ->groupBy('client')
                    ->orderByDesc('total')
                    ->limit(10)
                    ->get();

                // Tabla: tickets sin descripción (Top 20 por antigüedad)
                $noDesc = (clone $openQuery)
                    ->where(function($q){
                        $q->whereNull('description')
                          ->orWhereRaw('TRIM(description) = ""');
                    })
                    ->orderBy('opened_at','asc')
                    ->limit(20)
                    ->get(['ticket_number','client','assignee','opened_at','status']);

                // ===== Estilos helpers
                $titleStyle = [
                    'font' => ['bold' => true, 'size' => 16],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
                ];
                $cardTitleStyle = [
                    'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => '555555']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
                ];
                $cardNumberStyle = [
                    'font' => ['bold' => true, 'size' => 18],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ];
                $cardBoxStyle = [
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'F5F6FA']],
                    'borders' => ['outline' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DDDDDD']]],
                ];
                $tableHeaderStyle = [
                    'font' => ['bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'E9ECEF']],
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CCCCCC']]
                    ],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ];
                $tableCellStyle = [
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'EEEEEE']]
                    ]
                ];

                // ===== Título
                $ws->setCellValue('A1', 'Dashboard de tickets (abiertos)');
                $ws->getStyle('A1')->applyFromArray($titleStyle);

                // ===== Cards (cuadros) con métricas
                // Distribución:
                // A3:D6  -> Total abiertos
                // E3:H6  -> Cliente con más tickets abiertos
                // I3:L6  -> Ticket abierto más antiguo

                // 1) Total abiertos
                $ws->mergeCells('A3:D3');
                $ws->mergeCells('A4:D6');
                $ws->setCellValue('A3', 'Total abiertos');
                $ws->getStyle('A3')->applyFromArray($cardTitleStyle);
                $ws->getStyle('A4:D6')->applyFromArray($cardBoxStyle);
                $ws->setCellValue('A4', $totalOpen);
                $ws->mergeCells('A4:D6');
                $ws->getStyle('A4:D6')->applyFromArray($cardBoxStyle);
                $ws->getStyle('A4')->applyFromArray($cardNumberStyle);

                // 2) Top cliente
                $ws->mergeCells('E3:H3');
                $ws->mergeCells('E4:H6');
                $ws->setCellValue('E3', 'Cliente con más tickets abiertos');
                $ws->getStyle('E3')->applyFromArray($cardTitleStyle);
                $ws->getStyle('E4:H6')->applyFromArray($cardBoxStyle);
                $ws->setCellValue('E4', ($topClient?->client ?? 'N/A') . "\n" . ($topClient?->total ?? 0));
                $ws->mergeCells('E4:H6');
                $ws->getStyle('E4:H6')->applyFromArray($cardBoxStyle);
                $ws->getStyle('E4')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER)
                    ->setWrapText(true);
                $ws->getStyle('E4')->getFont()->setBold(true)->setSize(14);

                // 3) Ticket más antiguo
                $ws->mergeCells('I3:L3');
                $ws->mergeCells('I4:L6');
                $ws->setCellValue('I3', 'Ticket abierto más antiguo');
                $ws->getStyle('I3')->applyFromArray($cardTitleStyle);
                $ws->getStyle('I4:L6')->applyFromArray($cardBoxStyle);
                if ($oldest) {
                    $ws->setCellValue('I4', 'Ticket: '.$oldest->ticket_number);
                    $ws->setCellValue('I5', 'Cliente: '.($oldest->client ?? 'N/A'));
                    $ws->setCellValue('I6', 'Abierto: '.optional($oldest->opened_at)->format('Y-m-d H:i'));
                } else {
                    $ws->setCellValue('I5', 'N/A');
                }
                $ws->getStyle('I4:L6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);

                // ===== Tabla de rangos de antigüedad
                // A8:D13
                $ws->setCellValue('A8', 'Antigüedad (tickets abiertos)');
                $ws->getStyle('A8')->getFont()->setBold(true);
                $ws->fromArray(
                    [
                        ['Rango', 'Cantidad'],
                        ['≤ 1 semana', $oneWeek],
                        ['> 1 y ≤ 2 semanas', $twoWeeks],
                        ['> 2 y ≤ 3 semanas', $threeWeeks],
                        ['> 3 y ≤ 4 semanas', $oneMonth],
                        ['> 1 mes', $gtOneMonth],
                    ],
                    null,
                    'A10',
                    true
                );
                $ws->getStyle('A10:B10')->applyFromArray($tableHeaderStyle);
                $ws->getStyle('A11:B15')->applyFromArray($tableCellStyle);
                $ws->getColumnDimension('A')->setWidth(28);
                $ws->getColumnDimension('B')->setWidth(16);

                // ===== Tabla: Tickets abiertos por cliente (Top 10)
                // D8:H(…)
                $ws->setCellValue('D8', 'Tickets abiertos por cliente');
                $ws->getStyle('D8')->getFont()->setBold(true);
                $ws->fromArray([['Cliente','Tickets']], null, 'D10', true);
                $ws->getStyle('D10:E10')->applyFromArray($tableHeaderStyle);
                $start = 11;
                foreach ($byClient as $i => $row) {
                    $ws->setCellValue("D".($start+$i), $row->client);
                    $ws->setCellValue("E".($start+$i), (int)$row->total);
                }
                if ($byClient->count() > 0) {
                    $ws->getStyle("D11:E".($start + $byClient->count() - 1))->applyFromArray($tableCellStyle);
                }
                $ws->getColumnDimension('D')->setWidth(32);
                $ws->getColumnDimension('E')->setWidth(16);

                // ===== Tabla: Tickets sin descripción (Top 20)
                // I8:N(…)
                $ws->setCellValue('I8', 'Tickets sin descripción (Por antigüedad)');
                $ws->getStyle('I8')->getFont()->setBold(true);
                $ws->fromArray([['Ticket','Cliente','Asignado','F. Alta','Estado']], null, 'I10', true);
                $ws->getStyle('I10:M10')->applyFromArray($tableHeaderStyle);

                $start2 = 11;
                foreach ($noDesc as $i => $row) {
                    $r = $start2 + $i;
                    $ws->setCellValue("I{$r}", $row->ticket_number);
                    $ws->setCellValue("J{$r}", $row->client ?: 'N/A');
                    $ws->setCellValue("K{$r}", $row->assignee ?: 'N/A');
                    $ws->setCellValue("L{$r}", optional($row->opened_at)->format('Y-m-d H:i'));
                    $ws->setCellValue("M{$r}", $row->status ?: '');
                }
                if ($noDesc->count() > 0) {
                    $ws->getStyle("I11:M".($start2 + $noDesc->count() - 1))->applyFromArray($tableCellStyle);
                }
                $ws->getColumnDimension('I')->setWidth(16);
                $ws->getColumnDimension('J')->setWidth(28);
                $ws->getColumnDimension('K')->setWidth(24);
                $ws->getColumnDimension('L')->setWidth(20);
                $ws->getColumnDimension('M')->setWidth(14);
            }
        ];
    }
}
