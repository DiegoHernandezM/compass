<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LandingContentRequest extends FormRequest
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
            'main_title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'principal_text' => 'nullable|string',
            'compatible_text' => 'nullable|string',
            'lower_title' => 'nullable|string',
            'lower_text_1' => 'nullable|string',
            'lower_text_2' => 'nullable|string',
            'lower_text_3' => 'nullable|string',
            'lower_text_4' => 'nullable|string',
            'subscribe_button' => 'nullable|string',
            'login_button' => 'nullable|string',
            'whatsapp_number' => 'nullable|string',
            'subscription_price' => 'nullable|numeric|min:0',
            'video' => 'nullable|file|mimes:mp4,webm,ogg',
        ];
    }
}
