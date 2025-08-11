<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Exports\Sheets\ResumenSheet;
use App\Exports\Sheets\AsignadosPorIngenieroSheet;

class PersonalReportsDashboardExport implements WithMultipleSheets
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        //
    }

    public function sheets(): array
    {
        return [
            new ResumenSheet(),              // <- con paréntesis
            new AsignadosPorIngenieroSheet() // <- con paréntesis
        ];
    }
}
