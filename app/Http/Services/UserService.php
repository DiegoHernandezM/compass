<?php

namespace App\Http\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
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

    public function storeUser($data)
    {
        $user = $this->model->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
        $user->assignRole($data['role']);
        return $user;
    }

    public function updateUser($data, $id)
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user = User::findOrFail($id);
        $user->update($data);
        $user->syncRoles($data['role']);
        return $user;
    }
    
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return $user;
    }
}
