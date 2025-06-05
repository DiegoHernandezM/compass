<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

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
         $student->assignRole($studentRole);
    }
}
