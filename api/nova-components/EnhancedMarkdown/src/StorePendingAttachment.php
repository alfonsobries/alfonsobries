<?php

declare(strict_types=1);

namespace Alfonsobries\EnhancedMarkdown;

use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Nova\Trix\PendingAttachment;
use Laravel\Nova\Trix\StorePendingAttachment as TrixStorePendingAttachment;
use Spatie\Image\Image;
use Spatie\Image\Manipulations;

class StorePendingAttachment extends TrixStorePendingAttachment
{
    use ValidatesRequests;

    public const ARTICLE_IMAGE_MAX_WIDTH = 927;

    /**
     * Attach a pending attachment to the field.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    public function __invoke(Request $request)
    {
        $this->validate($request, ['attachment' => 'image|required']);

        $disk = $this->field->getStorageDisk();

        $file = $request->file('attachment');

        $this->resizeImage($file);

        $attachment = $file->store($this->field->getStorageDir(), $disk);

        return Storage::disk($disk)->url(PendingAttachment::create([
            'draft_id'   => $request->draftId,
            'attachment' => $attachment,
            'disk'       => $disk,
        ])->attachment);
    }

    private function isImage(UploadedFile $attachment): bool
    {
        return substr($attachment->getMimeType(), 0, 5) === 'image';
    }

    private function resizeImage(UploadedFile $attachment): void
    {
        Image::load($attachment->getPathname())
            ->fit(Manipulations::FIT_MAX, self::ARTICLE_IMAGE_MAX_WIDTH, 0)
            ->optimize()
            ->save();
    }
}