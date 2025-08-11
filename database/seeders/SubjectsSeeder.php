<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Subject;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SubjectsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            [
                'name' => 'Ejemplo de Matemáticas',
                'description' => 'Ejemplo de Matemáticas',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => ' ejemplo ORIENTACION ESPACIAL',
                'description' => 'ORIENTACION ESPACIAL',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => 'ejemplo RAZONAMIENTO LOGICO',
                'description' => 'RAZONAMIENTO LOGICO',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => 'Ejemplo MEMORAMA',
                'description' => 'MEMORIA A CORTO PLAZO - MEMORAMA',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => 'Ejemplo PARAMETROS',
                'description' => 'MEMORIA A CORTO PLAZO - PARAMETROS',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => 'Ejemplo MULTITASKING',
                'description' => 'MULTITASKING',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'color' => '#d08686',
                'question_type' => null,
            ],
            [
                'name' => 'Ejemplo ATPL',
                'description' => 'ATPL',
                'color' => '#d08686',
                'image' => $this->storeImage('1q90QiWFQX4ERQiZ0WWp7EK5T15xllYgxbTvK894.png'),
                'question_type' => null,
            ]
        ];
        Subject::insert($subjects);

    }
    private function storeImage($fileName)
    {
        $sourcePath = database_path('seeders/images/' . $fileName);
        $targetName = Str::random(10) . '_' . $fileName;

        // Copiar al storage público
        Storage::disk('public')->put(
            'subjects/' . $targetName,
            file_get_contents($sourcePath)
        );

        // Retornar la ruta relativa que guardas normalmente en la DB
        return 'subjects/' . $targetName;
    }
}
