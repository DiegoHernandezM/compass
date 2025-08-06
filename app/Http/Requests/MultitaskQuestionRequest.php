<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MultitaskQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
       return [
            'question' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'nullable|string',
            'answer' => 'required|in:Correcto,Incorrecto,x1,x2,x3'
        ];
    }

    public function messages(): array {
        return [
            'question.required' => 'La pregunta es obligatoria.',
            'option_a.required' => 'La respuesta A es obligatoria.',
            'option_b.required' => 'La respuesta B es obligatoria.',
            'answer.required' => 'Seleccione la respuesta correcta.',
            'answer.in' => 'La respuesta correcta debe ser Correcto,Incorrecto,x1,x2 o x3'
        ];
    }
}
