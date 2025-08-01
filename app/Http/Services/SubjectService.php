<?php

namespace App\Http\Services;

use App\Models\Subject;
use App\Models\MemoryTest;
use App\Models\QuestionSubject;
use Illuminate\Support\Facades\Storage;

class SubjectService
{

    protected $model;

    public function __construct()
    {
        $this->model = new Subject();
    }

    public function getAll()
    {
        return $this->model->withCount('questions')->get();
    }

    public function createSubject($data)
    {
        if ($data['image']) {
            $data['image'] = $data['image']->store('subjects', 'public');
        }
        $subject = $this->model->create($data);
        return $subject;
    }

    public function updateSubject($data, $id)
    {
        $subject = Subject::find($id);
        if ($data['image'] != null) {
            if ($subject->image) {
                Storage::disk('public')->delete($subject->image);
            }
            $data['image'] = $data['image']->store('subjects', 'public');
        } else {
            unset($data['image']);
        }
        $subject->update($data);
    }

    public function deleteSubject($id)
    {
        $subject = Subject::find($id);
        if ($subject->image) {
            Storage::disk('public')->delete($subject->image);
        }
        $subject->delete();
    }

    public function getForStudent($userId)
    {   
        return QuestionSubject::with(['level', 'question', 'subject', 'subject.tests' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->where('is_completed', false);
                }])
                ->get()
                ->groupBy(fn($qs) => $qs->subject_id . '-' . $qs->question_level_id)
                ->map(function ($group) {
                    $qs = $group->first(); // uno por combinación
                    $test = $qs->subject->tests->first(); // test activo si existe
                    
                    return [
                        'id' => $qs->subject->id,
                        'name' => $qs->subject->name,
                        'description' => $qs->subject->description,
                        'image' => $qs->subject->image,
                        'color' => $qs->subject->color,
                        'has_active_test' => !!$test,
                        'progress' => $test?->progress ?? 0,
                        'complete' => $test?->is_complete ?? false,
                        'level_id' => $qs->level->id ?? null,
                        'level_name' => $qs->level->name ?? 'N/A',
                    ];
                })
                ->values();
    }

    public function findSubject($id)
    {
        return $this->model->find($id);
    }

}
