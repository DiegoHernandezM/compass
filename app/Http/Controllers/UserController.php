<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\UserService;
use App\Http\Requests\UserRequest;
use Inertia\Inertia;

class UserController extends Controller
{
    
    protected $service;
    public function __construct()
    {
        $this->service = new UserService();
    }

    public function getAdmins() 
    {
        try {
            $administrators = $this->service->getAdmins();
            return Inertia::render('Admin/Administrators/Index', [
                'administrators' => $administrators
            ]);
        } catch(\Exception $e) {
            return $e->getMessage();
        }
    }

    public function store(UserRequest $request)
    {
        try {
            $data = $request->validated();
            $administrators = $this->service->storeUser($data);
            return redirect()->back()->with('success', 'Administrador creado correctamente.');
        } catch(\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function update(UserRequest $request, $id)
    {
        try {
            $data = $request->validated();
            $administrators = $this->service->updateUser($data, $id);
            $administrators = $this->service->getAdmins();
            return redirect()->back()->with('success', 'Administrador actualizado correctamente.');
        } catch(\Exception $e) {
            return redirect()->back()->with('errror', $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $administrators = $this->service->deleteUser($id);
            return redirect()->back()->with('success', 'Administrador eliminado correctamente.');
        } catch(\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
    
    public function getStudents()
    {
        dd('getStudents');
    }
}
