<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class MathQuestionsWorkbookImport implements WithMultipleSheets
{
    public readonly MathQuestionsImport $questionsImport;

    public function __construct(
        private readonly string $sheetName,
        int $typeId,
        int $levelId,
        array $imagesByRow = [],
    ) {
        $this->questionsImport = new MathQuestionsImport($typeId, $levelId, $imagesByRow);
    }

    public function sheets(): array
    {
        return [
            $this->sheetName => $this->questionsImport,
        ];
    }
}
