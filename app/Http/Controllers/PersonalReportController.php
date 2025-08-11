<?php

namespace App\Http\Controllers;

use App\Imports\PersonalReportsImport;
use App\Models\PersonalReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use App\Exports\PersonalReportsDashboardExport;

class PersonalReportController extends Controller
{
    protected $mTicket;
    
    public function __construct()
    {
        $this->mTicket = new PersonalReport();
    }
    
    public function __invoke()
    {
        $filename = 'dashboard_tickets_'.now()->format('Y-m-d_H-i').'.xlsx';
        return Excel::download(new PersonalReportsDashboardExport(), $filename);
    }

    public function index()
    {
        // Puedes paginar si prefieres
        $latest = PersonalReport::where('active', 1)->get();

        return Inertia::render('Admin/Report/Index', [
            'latest' => $latest,
        ]);
    }

    public function store(Request $request)
    {
        try{
            $request->validate([
                'file' => ['required','file','mimes:xlsx,xls,csv'],
            ]);
            $file = $request->file('file');
            $filename = $file->getClientOriginalName();
            // Procesar TODAS las hojas
            try {
                $spreadsheet = IOFactory::load($file->getRealPath());
            } catch(\Exception $e) {
                return redirect()->back()->with('error', 'Error al leer el archivo: ' . $e->getMessage());
            }
            
            foreach ($spreadsheet->getAllSheets() as $idx => $sheet) {
                Excel::import(new PersonalReportsImport($filename, $idx), $file);
            }
            return redirect()->back()->with('success', 'Reporte importado correctamente.');
        } catch(\Exception $e){
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
