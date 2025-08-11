<?php
// app/Exports/Sheets/AsignadosPorIngenieroSheet.php
namespace App\Exports\Sheets;

use App\Models\PersonalReport;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\{
    FromArray, WithTitle, WithCharts
};
use PhpOffice\PhpSpreadsheet\Chart\{
    Chart, DataSeries, DataSeriesValues, Legend, PlotArea, Title
};

class AsignadosPorIngenieroSheet implements FromArray, WithTitle, WithCharts
{
    protected array $rows = [];

    public function __construct()
    {
        // Prepara los datos (ingeniero, abiertos)
        $data = PersonalReport::query()
            ->select('assignee', DB::raw('COUNT(*) as abiertos'))
            ->whereNull('closed_at')
            ->whereNotNull('assignee')
            ->groupBy('assignee')
            ->orderByDesc('abiertos')
            ->limit(20)
            ->get();

        $this->rows[] = ['Ingeniero', 'Abiertos'];
        foreach ($data as $r) {
            $this->rows[] = [$r->assignee, (int)$r->abiertos];
        }

        if (count($this->rows) === 1) {
            // Sin datos → deja una fila dummy para no romper el gráfico
            $this->rows[] = ['N/D', 0];
        }
    }

    public function title(): string
    {
        return 'Asignados por ingeniero';
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function charts()
    {
        // Rango de las celdas (A1:B{n})
        $rowCount = count($this->rows);
        $dataRange   = "Asignados por ingeniero!B2:B{$rowCount}";
        $labelsRange = "Asignados por ingeniero!A2:A{$rowCount}";
        $titleRange  = "Asignados por ingeniero!B1";

        // Series de datos
        $dataSeriesLabels = [new DataSeriesValues('String', $titleRange, null, 1)];
        $xAxisTickValues  = [new DataSeriesValues('String', $labelsRange, null, $rowCount - 1)];
        $dataSeriesValues = [new DataSeriesValues('Number', $dataRange, null, $rowCount - 1)];

        $series = new DataSeries(
            DataSeries::TYPE_BARCHART,
            DataSeries::GROUPING_CLUSTERED,
            range(0, count($dataSeriesValues) - 1),
            $dataSeriesLabels,
            $xAxisTickValues,
            $dataSeriesValues
        );
        $series->setPlotDirection(DataSeries::DIRECTION_COL);

        $plot   = new PlotArea(null, [$series]);
        $legend = new Legend(Legend::POSITION_RIGHT, null, false);
        $title  = new Title('Tickets abiertos por ingeniero');

        $chart = new Chart(
            'chart_asignados',
            $title,
            $legend,
            $plot
        );

        // Posición del gráfico en hoja (celda D2)
        $chart->setTopLeftPosition('D2');
        $chart->setBottomRightPosition('L25');

        return [$chart];
    }
}
