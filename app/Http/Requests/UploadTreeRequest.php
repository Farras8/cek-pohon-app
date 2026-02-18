<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadTreeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload',
            'file.file' => 'The uploaded file is invalid',
            'file.mimes' => 'Only Excel files (.xlsx, .xls) and CSV files are allowed',
            'file.max' => 'File size must not exceed 10MB',
        ];
    }
}
