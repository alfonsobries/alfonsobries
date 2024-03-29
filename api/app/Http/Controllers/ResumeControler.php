<?php

namespace App\Http\Controllers;

use App\Models\ResumeExperience;
use App\Models\ResumeProject;
use App\Models\ResumeSkill;
use Illuminate\Support\Facades\Cache;
use Spatie\Browsershot\Browsershot;

class ResumeControler extends Controller
{
    public function __invoke(): array
    {
        return [
            'experience' => ResumeExperience::ordered()->get(),
            'projects' => ResumeProject::ordered()->get(),
            'skills' => ResumeSkill::ordered()->get(),
        ];
    }

    public function pdf()
    {
        if ($this->shouldGeneratePdf()) {
            Browsershot::url(config('site.site_url').'/resume/print')
                ->format('Letter')
                ->scale(0.9)
                ->margins(7, 5, 7, 5)
                ->waitUntilNetworkIdle()
                ->timeout(180)
                ->ignoreHttpsErrors()
                ->setNodeBinary(config('site.node_binary'))
                ->setNpmBinary(config('site.npm_binary'))
                ->waitForFunction("document.getElementById('header') !== null")
                ->save(storage_path('alfonso.bribiesca.resume.pdf'));

            Cache::forget(config('site.expireResumeKey'));
        }

        return response()->download(storage_path('alfonso.bribiesca.resume.pdf'));
    }

    private function shouldGeneratePdf()
    {
        return ! file_exists(storage_path('alfonso.bribiesca.resume.pdf')) || Cache::has(config('site.expireResumeKey'));
    }
}
