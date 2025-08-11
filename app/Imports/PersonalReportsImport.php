<?php

namespace App\Imports;

use App\Models\PersonalReport;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;


class PersonalReportsImport implements ToCollection
{
    private string $filename;
    private int $sheetIndex;

    public function __construct(string $filename, int $sheetIndex = 0)
    {
        $this->filename = $filename;
        $this->sheetIndex = $sheetIndex;
    }

    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        foreach ($rows as $i => $row) {
            // Convierte a array plano
            $cells = $row->toArray();

            // Normaliza (índices esperados 0..8)
            $c0 = trim((string)($cells[0] ?? '')); // Ticket
            $c1 = trim((string)($cells[1] ?? '')); // F. de alta
            $c2 = trim((string)($cells[2] ?? '')); // F. de cierre
            $c3 = trim((string)($cells[3] ?? '')); // Estado
            $c4 = trim((string)($cells[4] ?? '')); // Asignado
            $c5 = trim((string)($cells[5] ?? '')); // Cliente
            $c6 = trim((string)($cells[6] ?? '')); // Unidad
            $c7 = trim((string)($cells[7] ?? '')); // Contacto
            $c8 = trim((string)($cells[8] ?? '')); // Descripción

            // Saltar cabeceras repetidas o filas vacías
            if ($this->isHeaderRow($c0, $c1, $c2) || $this->isEmptyRow($cells)) {
                continue;
            }

            // Si no hay ticket, no podemos indexar
            if ($c0 === '') {
                continue;
            }

            PersonalReport::updateOrCreate(
                ['ticket_number' => $c0],
                [
                    'opened_at'      => $this->parseDate($c1),
                    'closed_at'      => $this->parseDate($c2),
                    'status'         => $c3 ?: null,
                    'assignee'       => $c4 ?: null,
                    'client'         => $c5 ?: null,
                    'unit'           => $c6 ?: null,
                    'contact'        => $c7 ?: null,
                    'description'    => $c8 ?: null,
                ]
            );
        }
    }

    private function isHeaderRow(string $c0, string $c1, string $c2): bool
    {
        // La primera columna suele ser "Ticket"
        $hints = ['ticket','tícket','ticket #','id ticket'];
        $val = mb_strtolower($c0);
        if (in_array($val, $hints, true)) return true;

        // Algunas hojas traen "F. de alta" en col 1
        $val1 = mb_strtolower($c1);
        if (str_contains($val1, 'f. de alta')) return true;

        // Si hay textos “Estado/Asignado/Cliente...” en secuencia, también es cabecera
        return false;
    }

    private function isEmptyRow(array $cells): bool
    {
        foreach ($cells as $v) {
            if (trim((string)$v) !== '') {
                return false;
            }
        }
        return true;
    }

    private function parseDate(?string $value): ?Carbon
    {
        $v = trim((string)$value);
        if ($v === '') return null;

        // Casos comunes: "30/01/2025 11:59" o "30/01/2025"
        foreach (['d/m/Y H:i','d/m/Y H:i:s','d/m/Y'] as $fmt) {
            try {
                return Carbon::createFromFormat($fmt, $v);
            } catch (\Throwable $e) {}
        }

        // A veces Maatwebsite ya convierte a num Excel: intentar como timestamp Excel
        if (is_numeric($v)) {
            try {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$v));
            } catch (\Throwable $e) {}
        }
        return null;
    }
}
