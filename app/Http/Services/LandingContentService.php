<?php

namespace App\Http\Services;

use App\Models\LandingContent;

use Illuminate\Support\Facades\Storage;

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

        if (!empty($data['video'])) {
            if ($content->video_path) {
                Storage::disk('public')->delete($content->video_path);
            }
            $data['video_path'] = $data['video']->store('videos', 'public');
        }
        unset($data['video']);
        $content->update($data);
    }
}
