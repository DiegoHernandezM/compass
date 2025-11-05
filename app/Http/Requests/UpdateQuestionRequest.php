<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Si el front manda "" (string vacío) los convertimos a null
        $toNull = ['question','answer_a','answer_b','answer_c','answer_d','feedback_text'];
        foreach ($toNull as $f) {
            if ($this->has($f) && $this->input($f) === '') {
                $this->merge([$f => null]);
            }
        }

        // Si por alguna razón llega la cadena "null", también la tratamos como null
        foreach ($toNull as $f) {
            if ($this->has($f) && $this->input($f) === 'null') {
                $this->merge([$f => null]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'question'        => 'sometimes|nullable|string',
            'question_image'  => 'sometimes|nullable|image|max:2048',

            'answer_a'       => 'sometimes|nullable|string',
            'answer_a_file'  => 'sometimes|nullable|image|max:2048',

            'answer_b'       => 'sometimes|nullable|string',
            'answer_b_file'  => 'sometimes|nullable|image|max:2048',

            'answer_c'       => 'sometimes|nullable|string',
            'answer_c_file'  => 'sometimes|nullable|image|max:2048',

            'answer_d'       => 'sometimes|nullable|string',
            'answer_d_file'  => 'sometimes|nullable|image|max:2048',

            // Si no mandas correct_answer, se conserva el existente
            'correct_answer' => 'sometimes|in:A,B,C,D',

            'feedback_text'  => 'sometimes|nullable|string',
            'feedback_image' => 'sometimes|nullable|image|max:2048',

            'has_dynamic'    => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'question_image.image'   => 'La pregunta (imagen) debe ser un archivo de imagen.',
            'question_image.max'     => 'La imagen de la pregunta no puede exceder 2MB.',
            'answer_a_file.image'    => 'Respuesta A (imagen) debe ser un archivo de imagen.',
            'answer_a_file.max'      => 'La imagen de la Respuesta A no puede exceder 2MB.',
            'answer_b_file.image'    => 'Respuesta B (imagen) debe ser un archivo de imagen.',
            'answer_b_file.max'      => 'La imagen de la Respuesta B no puede exceder 2MB.',
            'answer_c_file.image'    => 'Respuesta C (imagen) debe ser un archivo de imagen.',
            'answer_c_file.max'      => 'La imagen de la Respuesta C no puede exceder 2MB.',
            'answer_d_file.image'    => 'Respuesta D (imagen) debe ser un archivo de imagen.',
            'answer_d_file.max'      => 'La imagen de la Respuesta D no puede exceder 2MB.',
            'correct_answer.in'      => 'La respuesta correcta debe ser A, B, C o D.',
            'feedback_image.image'   => 'El archivo de retroalimentación debe ser una imagen.',
            'feedback_image.max'     => 'La imagen de retroalimentación no puede exceder 2MB.',
        ];
    }
}
