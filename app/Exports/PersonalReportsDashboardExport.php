<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Exports\Sheets\ResumenSheet;
use App\Exports\Sheets\AsignadosPorIngenieroSheet;

class PersonalReportsDashboardExport implements WithMultipleSheets
{
   
    public function sheets(): array
    {
        return [
            new ResumenSheet(),
            new AsignadosPorIngenieroSheet(),
        ];
    }
}
