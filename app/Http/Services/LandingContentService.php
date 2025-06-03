<?php

namespace App\Http\Services;

use App\Models\LandingContent;

class LandingContentService
{
    protected $model;

    public function __construct()
    {
        $this->model = new LandingContent();
    }

    public function getLandingContent()
    {
        return $this->model->first(); 
    }

    public function updateLandingContent($data)
    {
        $content = LandingContent::first();
        if ($data['video'] != null) {
            if ($content->video_path) {
                Storage::disk('public')->delete($content->video_path);
            }
            $data['video_path'] = $request->file('video')->store('videos', 'public');
        }
        $content->update($data);
    }

}
