<?php

namespace App\Http\Services;
use App\Models\Subject;
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
        return $this->model->all();
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

}
