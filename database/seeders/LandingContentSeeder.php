<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LandingContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('landing_contents')->truncate(); // Limpia tabla antes de insertar

        DB::table('landing_contents')->insert([
            'main_title'        => 'Bienvenido Capitán',
            'subtitle'          => 'Aviation In Sight',
            'principal_text'    => 'En Aviation In Sight podrás prepararte de la mejor manera para el examen de titulación CIIAAC. Tendrás la oportunidad de administrar tu estudio, seleccionando cuestionarios por materia o con simulacros tipo CIIAAC. Podrás practicar las veces que quieras, desde cualquier dispositivo (pc, tableta o celular) en cualquier horario. *Limitado a dos dispositivos. *Vigencia por un año.',
            'compatible_text'   => 'Compatible con:',
            'lower_title'       => 'En Aviation In Sight podrás realizar lo siguiente:',
            'lower_text_1'      => 'Estudiar con cuestionarios por materia.',
            'lower_text_2'      => 'Identificar respuestas correctas.',
            'lower_text_3'      => 'Revisar explicación de ciertos escenarios.',
            'lower_text_4'      => 'Visualizar resultado final y progreso.',
            'subscribe_button'  => 'Inscribete',
            'login_button'      => 'Iniciar sesión',
            'whatsapp_number'   => '5564982555',
            'video_path'        => 'videos/intro.mp4', // Ruta simulada
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }
}
