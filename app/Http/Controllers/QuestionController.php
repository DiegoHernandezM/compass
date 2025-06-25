<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\QuestionService;
use App\Http\Services\SubjectService;
use App\Http\Requests\QuestionRequest;
use Inertia\Inertia;
use App\Exports\QuestionsExport;
use PhpOffice\PhpSpreadsheet\IOFactory;
use App\Imports\QuestionsImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    protected $service;
    protected $subjectService;

    public function __construct()
    {
        $this->service = new QuestionService();
        $this->subjectService = new SubjectService();
    }

    public function index()
    {
        try {
            $questions = $this->service->getAll();
            $subjects = $this->subjectService->getAll();
            return Inertia::render('Admin/Questions/Index', [
                'questions' => $questions,
                'subjects' => $subjects,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al obtener las preguntas.');
        }
        
    }

    public function getQuestions($subjectId)
    {
        try {
            $questions = $this->service->allBySubject($subjectId);
            return response()->json($questions);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al obtener las preguntas.');
        }
    }


    public function store(QuestionRequest $request)
    {
        try {
            $this->service->create($request->validated());
            return redirect()->back()->with('success', 'Pregunta creada con éxito.');    
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al crear la pregunta.');
        }
        
    }

    public function update(QuestionRequest $request, $id)
    {
        try {
            $this->service->update($id, $request->validated());
            return redirect()->back()->with('success', 'Pregunta actualizada.');    
        } catch(\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar la pregunta.');
        }
        
    }

    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return redirect()->back()->with('success', 'Pregunta eliminada.');    
        } catch(\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar la pregunta.');
        }
    }

    public function import(Request $request)
    {
        try {
            $subjectId = $request->subject_id;
            $file = $request->file('file');

            // Carga con PhpSpreadsheet para acceder a imágenes
            $spreadsheet = IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $drawings = $sheet->getDrawingCollection();

            // Subir imágenes y asociarlas con la fila
            $imagesByRow = [];

            foreach ($drawings as $drawing) {
                $coordinates = $drawing->getCoordinates();
                $row = preg_replace('/[^0-9]/', '', $coordinates);

                $tmpPath = tempnam(sys_get_temp_dir(), 'img_');
                file_put_contents($tmpPath, file_get_contents($drawing->getPath()));

                $s3Path = Storage::disk('s3')->putFile('feedback', $tmpPath);
                $imagesByRow[(int)$row] = $s3Path;

                @unlink($tmpPath);
            }

            // Pasa las imágenes al importador
            $importer = new QuestionsImport($subjectId, $imagesByRow);
            Excel::import($importer, $file);

            return redirect()->back()->with('success', 'Preguntas importadas con éxito.');
        } catch (\Exception $e) {
            dd($e->getMessage());
            return redirect()->back()->with('error', 'Error al importar las preguntas.');
        }
    }

    public function exportExcel($subjectId)
    {
        try {
            return Excel::download(new QuestionsExport($subjectId), 'preguntas_materia_imagenes.xlsx');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al exportar las preguntas.');
        }
    }
}
