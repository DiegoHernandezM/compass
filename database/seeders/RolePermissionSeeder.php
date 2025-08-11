<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\PayPalUser;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $studentRole = Role::firstOrCreate(['name' => 'student']);
 
        // Crear admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password')
            ]
        );
        $admin->assignRole($adminRole);

        // Crear student
        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Estudiante',
                'password' => Hash::make('password')
            ]
        );

        Student::create([
        'name' => 'Estudiante',
        'birthdate' => '1992-07-20',
        'gender' => 'Masculino',
        'address' => 'Calle 123',
        'zip_code' => '12345',
        'city' => 'Ciudad',
        'country' => 'País',
        'phone' => '1234567890',
        'school' => 'Escuela',
        'user_id' => $student->id,
        ]);

        PayPalUser::create([
            'user_id' => $student->id,
            'address' => 'Jazmines 31',
            'amount' => 0,
            'payment_id' => 'PAY-123',
            'status' => 'active',
            'create_time' => now(),
            'expires_at' => now()->addYear(),
        ]);

        $student->assignRole($studentRole);
    }
}
