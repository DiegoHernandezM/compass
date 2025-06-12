<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Student;

class StudentRequest extends FormRequest
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
        $student = Student::withTrashed()->find($this->route('id'));
        $userId = $student?->user_id;
        return [
            // Campos de User
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:6'],

            // Campos de Student
            'birthdate' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:Masculino,Femenino,Otro'],
            'address' => ['nullable', 'string', 'max:255'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'school' => ['nullable', 'string', 'max:100'],
            'role' => ['required', Rule::in(['admin', 'student'])],
            'expires_at' => ['nullable', 'date'],
        ];
    }

    public function messages()
    {
        return [
            // Campos de User
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no debe exceder los 255 caracteres.',

            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser válido.',
            'email.max' => 'El correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'Este correo electrónico ya está registrado.',

            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',

            // Campos de Student
            'birthdate.date' => 'La fecha de nacimiento debe ser una fecha válida.',

            'gender.in' => 'El género debe ser Masculino, Femenino u Otro.',

            'address.string' => 'La dirección debe ser una cadena de texto.',
            'address.max' => 'La dirección no debe exceder los 255 caracteres.',

            'zip_code.string' => 'El código postal debe ser una cadena de texto.',
            'zip_code.max' => 'El código postal no debe exceder los 20 caracteres.',

            'city.string' => 'La ciudad debe ser una cadena de texto.',
            'city.max' => 'La ciudad no debe exceder los 100 caracteres.',

            'country.string' => 'El país debe ser una cadena de texto.',
            'country.max' => 'El país no debe exceder los 100 caracteres.',

            'phone.string' => 'El teléfono debe ser una cadena de texto.',
            'phone.max' => 'El teléfono no debe exceder los 20 caracteres.',

            'school.string' => 'La escuela debe ser una cadena de texto.',
            'school.max' => 'La escuela no debe exceder los 100 caracteres.',

            'role.required' => 'El rol es obligatorio.',
            'role.in' => 'El rol debe ser "admin" o "student".',
        ];
    }

}
