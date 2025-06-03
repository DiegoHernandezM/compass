<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\UserService;
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
            $users = $this->service->getAdmins();
            return Inertia::render('Admin/Administrators/Index', [
                'users' => $users
            ]);
        } catch(\Exception $e) {
            return $e->getMessage();
        }
    }
    
    public function getStudents()
    {
        dd('getStudents');
    }
}
