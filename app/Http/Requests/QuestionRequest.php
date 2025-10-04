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
            // Pregunta: texto o imagen (uno de los dos obligatorio)
            'question'        => 'nullable|string|required_without:question_image',
            'question_image'  => 'nullable|image|max:2048|required_without:question',

            // Respuestas A–C: texto o imagen (uno de los dos obligatorio)
            'answer_a'       => 'nullable|string|required_without:answer_a_file',
            'answer_a_file'  => 'nullable|image|max:2048|required_without:answer_a',

            'answer_b'       => 'nullable|string|required_without:answer_b_file',
            'answer_b_file'  => 'nullable|image|max:2048|required_without:answer_b',

            'answer_c'       => 'nullable|string|required_without:answer_c_file',
            'answer_c_file'  => 'nullable|image|max:2048|required_without:answer_c',

            // Respuesta D: completamente opcional (si viene, validar tipo)
            'answer_d'       => 'nullable|string',
            'answer_d_file'  => 'nullable|image|max:2048',

            // Correcta
            'correct_answer' => 'required|in:A,B,C,D',

            // Feedback
            'feedback_text'  => 'nullable|string',
            'feedback_image' => 'nullable|image|max:2048',

            'has_dynamic'    => 'boolean',
        ];
    }

    public function messages(): array {
        return [
            // Pregunta
            'question.required_without'       => 'Debes proporcionar texto de la pregunta o una imagen.',
            'question_image.required_without' => 'Debes proporcionar texto de la pregunta o una imagen.',
            'question_image.image'            => 'La pregunta (imagen) debe ser un archivo de imagen.',
            'question_image.max'              => 'La imagen de la pregunta no puede exceder 2MB.',

            // Respuestas A
            'answer_a.required_without'       => 'Respuesta A: texto o imagen es obligatorio.',
            'answer_a_file.required_without'  => 'Respuesta A: texto o imagen es obligatorio.',
            'answer_a_file.image'             => 'Respuesta A (imagen) debe ser un archivo de imagen.',
            'answer_a_file.max'               => 'La imagen de la Respuesta A no puede exceder 2MB.',

            // Respuestas B
            'answer_b.required_without'       => 'Respuesta B: texto o imagen es obligatorio.',
            'answer_b_file.required_without'  => 'Respuesta B: texto o imagen es obligatorio.',
            'answer_b_file.image'             => 'Respuesta B (imagen) debe ser un archivo de imagen.',
            'answer_b_file.max'               => 'La imagen de la Respuesta B no puede exceder 2MB.',

            // Respuestas C
            'answer_c.required_without'       => 'Respuesta C: texto o imagen es obligatorio.',
            'answer_c_file.required_without'  => 'Respuesta C: texto o imagen es obligatorio.',
            'answer_c_file.image'             => 'Respuesta C (imagen) debe ser un archivo de imagen.',
            'answer_c_file.max'               => 'La imagen de la Respuesta C no puede exceder 2MB.',

            // Respuesta D (opcional)
            'answer_d_file.image'             => 'Respuesta D (imagen) debe ser un archivo de imagen.',
            'answer_d_file.max'               => 'La imagen de la Respuesta D no puede exceder 2MB.',

            // Correcta / feedback
            'correct_answer.required'         => 'Seleccione la respuesta correcta.',
            'correct_answer.in'               => 'La respuesta correcta debe ser A, B, C o D.',
            'feedback_image.image'            => 'El archivo de retroalimentación debe ser una imagen.',
            'feedback_image.max'              => 'La imagen de retroalimentación no puede exceder 2MB.',
        ];
    }
}
