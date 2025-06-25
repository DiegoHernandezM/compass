<?php

namespace App\Exports;

use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\FromCollection;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use App\Models\Question;

class QuestionsExport implements FromCollection, WithHeadings, WithMapping, WithDrawings
{
    protected $subjectId;
    protected $rowIndex = 2;
    protected $drawings = [];

    public function __construct($subjectId)
    {
        $this->subjectId = $subjectId;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Question::where('subject_id', $this->subjectId)->get();
    }

    public function headings(): array
    {
        return [			
            'question',
            'answer_a',
            'answer_b',
            'answer_c',
            'answer_d',
            'correct_answer',
            'feedback_text',
            'feedback_image',
            'has_dynamic',
        ];
    }

    public function map($question): array
    {
        try {
            if ($question->feedback_image && Storage::disk('s3')->exists($question->feedback_image)) {
                $tmpDir = storage_path('app/tmp');
                
                if (!is_dir($tmpDir)) {
                    mkdir($tmpDir, 0755, true);
                }
    
                $tmpPath = $tmpDir . '/' . basename($question->feedback_image);
                file_put_contents($tmpPath, Storage::disk('s3')->get($question->feedback_image));
    
                $drawing = new Drawing();
                $drawing->setName('Feedback Image');
                $drawing->setDescription('Feedback Image');
                $drawing->setPath($tmpPath);
                $drawing->setHeight(60);
                $drawing->setCoordinates('H' . $this->rowIndex);
                $this->drawings[] = $drawing;
            }
    
            $this->rowIndex++;
    
            return [
                $question->question,
                $question->answer_a,
                $question->answer_b,
                $question->answer_c,
                $question->answer_d,
                $question->correct_answer,
                $question->feedback_text,
                '', // aquí va la celda de imagen
                $question->has_dynamic ? 'TRUE' : 'FALSE',
            ];
        } catch (\Exception $e) {
            dd($e->getMessage());
            return [
                'Error al obtener la imagen: ' . $e->getMessage(),
            ];
        }
        
    }

    public function drawings()
    {
        return $this->drawings;
    }
}
