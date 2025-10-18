<?php

namespace App\Http\Controllers;

use App\Models\Instruction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class InstructionsController extends Controller
{
    public function index()
    {
        // Devuelve lista simple (ajusta a Inertia si lo mostrarás en UI)
        return response()->json(
            Instruction::latest()->select('id','original_name','path','created_at')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:25600'], // máximo 25 MB
        ]);

        $pdf = $request->file('file');

        // Carpeta destino: public/instructions
        $targetDir = public_path('instructions');
        if (!File::exists($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        // 🔹 Verificar si ya existe un registro
        $existing = \App\Models\Instruction::first();

        if ($existing) {
            // Si el archivo anterior existe en el sistema de archivos, lo eliminamos
            $oldPath = public_path($existing->path);
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }

            // Eliminar el registro anterior
            $existing->delete();
        }

        // Generar un nuevo nombre único para el archivo
        $storedName = Str::uuid() . '.pdf';
        $pdf->move($targetDir, $storedName);

        $relativePath = 'instructions/' . $storedName;

        // Crear el nuevo registro
        $instruction = \App\Models\Instruction::create([
            'original_name' => $pdf->getClientOriginalName(),
            'stored_name'   => $storedName,
            'path'          => $relativePath,
            'mime_type'     => 'application/pdf',
            'size'          => File::size(public_path($relativePath)),
            'uploaded_by'   => auth()->id(),
        ]);

        return back()->with('success', 'El instructivo fue reemplazado correctamente.');
    }


    public function show(Instruction $instruction)
    {
        $absolute = public_path($instruction->path);
        abort_unless(File::exists($absolute), 404, 'Archivo no encontrado');

        // Muestra el PDF en el navegador
        return response()->file($absolute, [
            'Content-Type' => $instruction->mime_type ?? 'application/pdf',
        ]);
    }

    public function download(Instruction $instruction)
    {
        $absolute = public_path($instruction->path);
        abort_unless(File::exists($absolute), 404, 'Archivo no encontrado');

        // Descarga con el nombre original
        return response()->download($absolute, $instruction->original_name);
    }
}
