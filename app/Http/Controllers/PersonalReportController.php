<?php

namespace App\Http\Controllers;

use App\Imports\PersonalReportsImport;
use App\Models\PersonalReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class PersonalReportController extends Controller
{
    protected $mTicket;
    public function __construct()
    {
        $this->mTicket = new PersonalReport();
    }
    public function index()
    {
        // Puedes paginar si prefieres
        $latest = PersonalReport::all();

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
        $spreadsheet = IOFactory::load($file->getRealPath());
        foreach ($spreadsheet->getAllSheets() as $idx => $sheet) {
            Excel::import(new PersonalReportsImport($filename, $idx), $file);
        }

        return back()->with('success', 'Reporte importado correctamente.');
        } catch(\Exception $e){
            return back()->with('error', $e->getMessage());
        }
        
    }
}
