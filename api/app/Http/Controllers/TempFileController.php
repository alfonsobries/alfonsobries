<?php

namespace App\Http\Controllers;

use Aws\S3\S3Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TempFileController extends Controller
{
    /**
     * A presigned URL so the app can PUT an image straight to S3; the
     * returned key is later handed to whatever resource attaches the file.
     */
    public function presign(Request $request): JsonResponse
    {
        if (! $request->user()->isFamilyMember()) {
            return response()->json(['message' => 'Only family members can upload files.'], 403);
        }

        $validated = $request->validate([
            'content_type' => ['required', 'string', 'in:image/jpeg,image/png,image/webp'],
            'extension' => ['required', 'string', 'in:jpg,jpeg,png,webp'],
        ]);

        $key = 'temp/uploads/'.Str::uuid7().'.'.$validated['extension'];

        $command = $this->makeClient()->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $key,
            'ContentType' => $validated['content_type'],
        ]);

        $presigned = $this->makeClient()->createPresignedRequest($command, '+60 minutes');

        return response()->json([
            'url' => (string) $presigned->getUri(),
            'key' => $key,
        ]);
    }

    private function makeClient(): S3Client
    {
        $disk = config('filesystems.disks.s3');

        $config = [
            'version' => 'latest',
            'region' => (string) ($disk['region'] ?? 'us-east-1'),
            'credentials' => [
                'key' => (string) $disk['key'],
                'secret' => (string) $disk['secret'],
            ],
        ];

        if (! empty($disk['endpoint'])) {
            $config['endpoint'] = (string) $disk['endpoint'];
            $config['use_path_style_endpoint'] = (bool) ($disk['use_path_style_endpoint'] ?? false);
        }

        return new S3Client($config);
    }
}
