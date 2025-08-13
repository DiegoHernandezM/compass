<?php

namespace App\Http\Services;

use App\Models\PayPalUser;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class StudentService
{
    protected $mStudent;
    protected $mUser;
    protected $mPaypal;

    public function __construct()
    {
        $this->mStudent = new Student();
        $this->mUser = new User();
        $this->mPaypal = new PayPalUser();
    }

    public function getStudents()
    {
        return $this->mStudent
            ->with(['user' => fn ($query) => $query->withTrashed()->with('paypal_user')])
            ->withTrashed()
            ->get();
    }

    public function getStudentById($id)
    {
        return $this->mStudent
            ->with(['user' => fn ($query) => $query->withTrashed()])
            ->withTrashed()
            ->findOrFail($id);
    }

    public function createStudent(array $data)
    {
        // Crear el usuario
        $user = $this->mUser->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $user->assignRole($data['role']);

        // Crear el estudiante
        $student = $this->mStudent->create([
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

        if (array_key_exists('expires_at', $data) && $student->user_id) {
            $expiresDate = $data['expires_at'];
            if (strlen($expiresDate) === 10) {
                $expiresDate .= ' ' . now()->format('H:i:s');
            }
            $addressArray = [
                'address_line_1' => $data['address'] ?? null,
                'address_line_2' => null,
                'admin_area_2' => $data['city'] ?? null,
                'postal_code' => $data['zip_code'] ?? null,
                'country_code' => 'MX',
            ];

            $this->mPaypal->updateOrCreate(
                ['user_id' => $student->user_id],
                [
                    'amount' => 0,
                    'address' => json_encode($addressArray),
                    'expires_at' => $expiresDate,
                    'create_time' => now(),
                    'updated_at' => now(),
                    'status' => $data['status'] ?? 'COMPLETED',
                ]
            );
        }

        return $student->load('user');
    }

    public function updateStudent($id, array $data)
    {
        $student = $this->getStudentById($id);

        // Actualiza los campos del estudiante
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

        // Si el usuario existe, actualiza sus datos
        if ($student->user) {
            $student->user->name = $data['name'] ?? $student->user->name;
            $student->user->email = $data['email'] ?? $student->user->email;
            if (!empty($data['password'])) {
                $student->user->password = Hash::make($data['password']);
            }
            $student->user->save();
        }

        if (array_key_exists('expires_at', $data) && $student->user_id) {
            $expiresDate = $data['expires_at'];
            if (strlen($expiresDate) === 10) {
                $expiresDate .= ' ' . now()->format('H:i:s');
            }

            $this->mPaypal->updateOrCreate(
                ['user_id' => $student->user_id],
                [
                    'expires_at' => $expiresDate,
                    'updated_at' => now()
                ]
            );
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
        $student = $this->mStudent->withTrashed()->findOrFail($id);
        $user = $student->user()->withTrashed()->first();
        $student->restore();
        if ($user) {
            $user->restore();
        }
        return $student;
    }

    public function getProfileStudent($user)
    {
        return $this->mStudent->where('user_id', $user->id)->with('user')->first();
    }

    public function updateProfileStudent(User $user, $data)
    {
        $student = $this->mStudent->where('user_id', $user->id)->first();
        $student->update($data);
        return $student;
    }

    public function updateStudentPassword(User $user, array $data)
    {
        $user->update([
            'password' => Hash::make($data['password']),
        ]);
    }

}
