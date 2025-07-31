<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubjectRequest;
use Inertia\Inertia;
use App\Http\Services\SubjectService;
use Illuminate\Support\Facades\Auth;


class SubjectController extends Controller
{

    protected $service;

    public function __construct()
    {
        $this->service = new SubjectService();
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subjects = $this->service->getAll();
        return Inertia::render('Admin/Subject/Index', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SubjectRequest $request)
    {
        try {
            $data = $request->validated();
            $this->service->createSubject($data);
            return redirect()->back()->with('success', 'Materia creada con éxito.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SubjectRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $this->service->updateSubject($data, $id);
            return redirect()->back()->with('success', 'Materia actualizada con éxito.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $this->service->deleteSubject($id);
            return redirect()->back()->with('success', 'Materia eliminada con éxito.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function getSubjects()
    {
        $userId = Auth::id();
        $subjects = $this->service->getForStudent($userId);
        //dd($subjects);
        
        return Inertia::render('Student/Subject/Index', [
            'subjects' => $subjects,
        ]);
    }
}
