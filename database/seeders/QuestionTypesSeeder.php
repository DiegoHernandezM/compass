<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class QuestionTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'MATEMATICAS',
                'description' => 'OPERACIONES MATEMATICAS',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => false,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => 'COMPLETAR LA OPERACION',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => strtoupper('Multiplicaciones, divisiones, fracciones, porcentajes y conversiones'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => strtoupper('Problemas, Pitágoras, ecuaciones y volumen'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'ORIENTACION ESPACIAL',
                'description' => 'ORIENTACION ESPACIAL',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => false,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => strtoupper('Mismo heading'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => strtoupper('Mismo horizonte'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => strtoupper('Mismo ADF'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 4',
                        'description' => strtoupper('Aleatorio'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'RAZONAMIENTO LOGICO',
                'description' => 'RAZONAMIENTO LOGICO',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => false,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => '',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => '',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => '',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'MEMORIA A CORTO PLAZO - MEMORAMA',
                'description' => 'MEMORAMA',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => true,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => strtoupper('3 imágenes a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => strtoupper('4 imágenes a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => strtoupper('5 imágenes a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'MEMORIA A CORTO PLAZO - PARAMETROS',
                'description' => 'PARAMETROS',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => false,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => strtoupper('1 parámetro a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => strtoupper('2 parámetro a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => strtoupper('4 parámetro a recordar'),
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'MULTITASKING',
                'description' => 'TEST MULTIPLE',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'bypass_levels_and_questions' => false,
                'levels' => [
                    [
                        'name' => 'NIVEL 1',
                        'description' => 'FACIL',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 2',
                        'description' => 'MEDIO',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ],
                    [
                        'name' => 'NIVEL 3',
                        'description' => 'AVANZADO',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ],
            [
                'name' => 'ATPL',
                'description' => 'CUESTIONARIO NORMAL',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
                'levels' => [
                    [
                        'name' => 'UNICO NIVEL ATPL',
                        'description' => 'UNICO NIVEL ATPL',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now(),
                    ]
                ]
            ]
        ];

        foreach ($types as $type) {
            $questionType = \App\Models\QuestionType::create([
                'name' => $type['name'],
                'description' => $type['description'],
                'created_at' => $type['created_at'],
                'updated_at' => $type['updated_at'],
            ]);
            foreach ($type['levels'] as $level) {
                $questionType->levels()->create([
                    'name' => $level['name'],
                    'description' => $level['description'],
                    'created_at' => $level['created_at'],
                    'updated_at' => $level['updated_at'],
                ]);
            }
        }
    }
}
