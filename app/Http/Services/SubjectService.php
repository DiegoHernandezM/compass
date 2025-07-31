<?php

namespace App\Http\Services;

use App\Models\Subject;
use App\Models\Test;
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

        /*
        return $this->model->with(['tests' => function ($query) use ($userId) {
            $query->where('user_id', $userId)
                ->where('is_completed', false); // Solo tests activos
        }])->get()->map(function ($subject) {
            $test = $subject->tests->first(); // Solo uno activo por materia
            return [
                'id' => $subject->id,
                'name' => $subject->name,
                'description' => $subject->description,
                'image' => $subject->image,
                'color' => $subject->color,
                'has_active_test' => !!$test,
                'progress' => $test?->progress ?? 0,
                'complete' => $test?->is_complete
            ];
        });
        */
        return Test::with(['subject', 'questionSubject.question'])
            ->where('user_id', $userId)
            ->where('is_completed', false) // Solo tests activos
            ->get()
            ->map(function ($test) {
                return [
                    'id' => $test->subject->id,
                    'name' => $test->subject->name,
                    'description' => $test->subject->description,
                    'image' => $test->subject->image,
                    'color' => $test->subject->color,
                    'has_active_test' => !!$test,
                    'progress' => $test?->progress ?? 0,
                    'complete' => $test?->is_complete,
                    'level_id' => $test->questionSubject?->question?->question_level_id ?? null,
                ];
            });
    }

    public function findSubject($id)
    {
        return $this->model->find($id);
    }

}
