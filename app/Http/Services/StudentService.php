<?php

namespace App\Http\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

class StudentService
{
    protected $model;

    public function __construct()
    {
        $this->model = new Student();
    }

    public function getStudents()
    {
        return $this->model
            ->with(['user' => fn ($query) => $query->withTrashed()])
            ->withTrashed()
            ->get();
    }

    public function getStudentById($id)
    {
        return $this->model
            ->with(['user' => fn ($query) => $query->withTrashed()])
            ->withTrashed()
            ->findOrFail($id);
    }

    public function createStudent(array $data)
    {
        // Crear el usuario
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $user->assignRole($data['role']);
        // Crear el estudiante
        $student = $this->model->create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'birthdate' => $data['birthdate'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
            'zip_code' => $data['zip_code'] ?? null,
            'city' => $data['city'] ?? null,
            'country' => $data['country'] ?? null,
            'school' => $data['school'] ?? null,
            'phone' => $data['phone'] ?? null,
        ]);
        return $student->load('user');
    }

    public function updateStudent($id, array $data)
    {
        $student = $this->getStudentById($id);
        $student->update([
            'name' => $data['name'] ?? $student->name,
            'birthdate' => $data['birthdate'] ?? $student->birth_date,
            'gender' => $data['gender'] ?? $student->gender,
            'address' => $data['address'] ?? $student->address,
            'zip_code' => $data['zip_code'] ?? $student->zip_code,
            'city' => $data['city'] ?? $student->city,
            'country' => $data['country'] ?? $student->country,
            'phone' => $data['phone'] ?? $student->phone,
            'school' => $data['school'] ?? $student->school,
        ]);
        if ($student->user) {
            $student->user->name = $data['name'] ?? $student->user->name;
            $student->user->email = $data['email'] ?? $student->user->email;
            if (!empty($data['password'])) {
                $student->user->password = Hash::make($data['password']);
            }
            $student->user->save();
        }
        return $student->load('user');
    }

    public function deleteStudent($id)
    {
        $student = $this->getStudentById($id);
        $user = $student->user;
        $student->delete();
        if ($user) {
            $user->delete();
        }
        return $student;
    }

    public function restoreStudent($id)
    {
        $student = $this->model->withTrashed()->findOrFail($id);
        $user = $student->user()->withTrashed()->first();
        $student->restore();
        if ($user) {
            $user->restore();
        }
        return $student;
    }

}
