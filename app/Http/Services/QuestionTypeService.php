<?php

namespace App\Http\Services;

use App\Models\QuestionType;

class QuestionTypeService
{
    protected $model;

    public function __construct()
    {
        $this->model = new QuestionType();
    }

    public function update($id, $request)
    {
        $questionType = $this->model->findOrFail($id);

        $questionType->update([
            'name' => $request['name'],
            'description' => $request['description'],
        ]);

        $levelData = $request['levels'];

        $receivedIds = collect($levelData)
            ->filter(fn ($lvl) => isset($lvl['id']) && !str_starts_with($lvl['id'], 'new-'))
            ->pluck('id')
            ->toArray();
        
        $questionType->levels()
            ->whereNotIn('id', $receivedIds)
            ->delete();
        foreach ($levelData as $level) {
            $questionType->levels()->updateOrCreate(
                ['id' => isset($level['id']) && !str_starts_with($level['id'], 'new-') ? $level['id'] : null],
                [
                    'name' => $level['name'],
                    'description' => $level['description'],
                ]
            );
        }

        return $questionType->load('levels');
    }
}