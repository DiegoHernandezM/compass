<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\QuestionTypeService;

class QuestionTypeController extends Controller
{
    protected $sQuestionType;

    public function __construct()
    {
        $this->sQuestionType = new QuestionTypeService();
    }

    public function update(Request $request, $id)
    {
        try {
            $this->sQuestionType->update($id, $request->all());
            return redirect()->back()->with('success', 'Tipo de cuestionario actualizado.');
        } catch(\Exception $e) {
            return redirect()->back()->with('error', 'Error al actualizar el tipo de cuestionario.');
        }
    }
}
