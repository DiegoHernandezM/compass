<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\StudentService;
use App\Http\Requests\StudentRequest;
use Inertia\Inertia;

class StudentController extends Controller
{
    protected $service;

    public function __construct()
    {
        $this->service = new StudentService();
    }

    public function index()
    {
        try {
            $students = $this->service->getStudents();
            return Inertia::render('Admin/Students/Index', [
                'students' => $students
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function store(StudentRequest $request)
    {
        try {
            $data = $request->validated();
            $this->service->createStudent($data);
            return redirect()->back()->with('success', 'Estudiante creado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function update(StudentRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $this->service->updateStudent($id, $data);
            return redirect()->back()->with('success', 'Estudiante actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->service->deleteStudent($id);
            return redirect()->back()->with('success', 'Estudiante eliminado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function restore($id)
    {
        try {
            $this->service->restoreStudent($id);
            return redirect()->back()->with('success', 'Estudiante recuperado correctamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
