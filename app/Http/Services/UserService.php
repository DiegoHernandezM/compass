<?php

namespace App\Http\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class UserService
{
    protected $model;

    public function __construct()
    {   
        $this->model = new User;
    }
    
    public function getAdmins()
    {
        return $this->model->role('admin')->get();
    }
}
