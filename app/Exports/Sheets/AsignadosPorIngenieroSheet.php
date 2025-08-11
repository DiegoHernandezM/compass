<?php

namespace App\Exports\Sheets;

use App\Models\PersonalReport;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\{
    FromArray, WithTitle, WithStyles, WithColumnWidths, WithCharts
};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Chart\{
    Chart, Title, Legend, PlotArea, DataSeries, DataSeriesValues
};

class AsignadosPorIngenieroSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths, WithCharts
{
    private array $rows = [];

    public function title(): string
    {
        return 'Asignados por Ingeniero';
    }

    public function array(): array
    {
        // Agrupa por ingeniero (assignee). Considera "abierto" cuando closed_at es NULL.
        $records = PersonalReport::selectRaw('COALESCE(NULLIF(TRIM(assignee), ""), "Sin asignar") as assignee, COUNT(*) as total')
            ->whereNull('closed_at')
            ->groupBy('assignee')
            ->orderByDesc('total')
            ->get();

        $data = [['Ingeniero', 'Tickets abiertos']];
        foreach ($records as $r) {
            $data[] = [$r->assignee, (int)$r->total];
        }

        // Guarda para el gráfico
        $this->rows = $data;
        return $data;
    }

    public function styles(Worksheet $sheet)
    {
        // Encabezado
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'color' => ['rgb' => 'D9D9D9']
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER
                ]
            ],
            'A' => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30, // Ingeniero
            'B' => 20, // Tickets abiertos
        ];
    }

    public function charts(): array
    {
        // Si no hay datos (solo encabezado), no dibujar gráfico
        $rowCount = max(count($this->rows), 1);
        if ($rowCount <= 1) return [];

        // Rango de categorías y valores (A2:A{n}, B2:B{n})
        $endRow = $rowCount; // incluye encabezado
        $catRange = new DataSeriesValues('String', "'{$this->title()}'!A2:A{$endRow}", null, $rowCount - 1);
        $valRange = new DataSeriesValues('Number', "'{$this->title()}'!B2:B{$endRow}", null, $rowCount - 1);

        $series = new DataSeries(
            DataSeries::TYPE_BARCHART,          // tipo
            DataSeries::GROUPING_CLUSTERED,     // agrupación
            range(0, 0),                        // plot order
            [new DataSeriesValues('String', "'{$this->title()}'!B1", null, 1)], // serie name (encabezado de B1)
            [$catRange],                        // categorías
            [$valRange]                         // valores
        );
        $series->setPlotDirection(DataSeries::DIRECTION_COL);

        $plotArea = new PlotArea(null, [$series]);
        $legend   = new Legend(Legend::POSITION_RIGHT, null, false);
        $title    = new Title('Tickets abiertos por ingeniero');

        // Coloca el gráfico a la derecha de la tabla
        $chart = new Chart(
            'chart_asignados',
            $title,
            $legend,
            $plotArea,
            true,
            0,
            null,
            null
        );

        // Posición (columna D fila 2 hasta columna L fila ~20)
        $chart->setTopLeftPosition('D2');
        $chart->setBottomRightPosition('L22');

        return [$chart];
    }
}
