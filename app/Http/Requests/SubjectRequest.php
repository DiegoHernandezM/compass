<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $subjectId = $this->route('id');
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string',
            'image' => [
                $this->isMethod('post') ? 'required' : 'nullable',
                'image',
                'mimes:jpg,jpeg,png,gif',
                'max:2048',
            ],
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'El nombre de la materia es obligatorio.',
            'name.string' => 'El nombre de la materia debe ser una cadena de texto.',
            'name.max' => 'El nombre de la materia no debe superar los 255 caracteres.',

            'description.string' => 'La descripción debe ser una cadena de texto.',

            'color.string' => 'El color debe ser una cadena de texto.',

            'image.required' => 'La imagen de la materia es obligatoria.',
            'image.image' => 'El archivo seleccionado debe ser una imagen válida.',
            'image.mimes' => 'La imagen debe ser de tipo: jpg, jpeg, png o gif.',
            'image.max' => 'La imagen no debe exceder los 2MB de tamaño.',
        ];
    }
}
