<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\QuestionService;
use App\Http\Services\SubjectService;
use Inertia\Inertia;

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
            $this->service->delete($question);
            return redirect()->back()->with('success', 'Pregunta eliminada.');    
        } catch(\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar la pregunta.');
        }
    }
}
