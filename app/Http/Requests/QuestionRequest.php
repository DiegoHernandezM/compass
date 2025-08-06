<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
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
        return [
            'question' => 'required|string',
            'answer_a' => 'required|string',
            'answer_b' => 'required|string',
            'answer_c' => 'required|string',
            'answer_d' => 'nullable|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'feedback_text' => 'nullable|string',
            'feedback_image' => 'nullable|image|max:2048',
            'has_dynamic' => 'boolean'
        ];
    }

    public function messages(): array {
        return [
            'question.required' => 'La pregunta es obligatoria.',
            'answer_a.required' => 'La respuesta A es obligatoria.',
            'answer_b.required' => 'La respuesta B es obligatoria.',
            'answer_c.required' => 'La respuesta C es obligatoria.',
            'correct_answer.required' => 'Seleccione la respuesta correcta.',
            'correct_answer.in' => 'La respuesta correcta debe ser A, B, C o D.',
            'feedback_image.image' => 'El archivo de retroalimentación debe ser una imagen.',
            'feedback_image.max' => 'La imagen no puede exceder los 2MB.',
        ];
    }
}
