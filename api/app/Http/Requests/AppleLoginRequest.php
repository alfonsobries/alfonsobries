<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppleLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'id_token' => ['required', 'string'],
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'device' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
