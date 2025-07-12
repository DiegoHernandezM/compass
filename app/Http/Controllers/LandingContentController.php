<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LandingContent;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Services\LandingContentService;
use App\Http\Requests\LandingContentRequest;

class LandingContentController extends Controller
{
    protected $service;

    public function __construct() {
        $this->service = new LandingContentService();
    }

    public function getContent()
    {
        $content = $this->service->getLandingContent();
        return response()->json($content);
    }

    public function edit()
    {
        $content = $this->service->getLandingContent();
        return Inertia::render('Admin/Landing/Edit', ['landingContent' => $content]);
    }

    public function update(LandingContentRequest $request)
    {
        try {
            $data = $request->validated();
            $content = $this->service->updateLandingContent($data);
            return redirect()->back()->with('success', 'Landing actualizada correctamente.');
        } catch (\Throwable $th) {
            dd($th->getMessage());
            return back()->with('error', 'Error al actualizar el contenido');
        }
    }
}
