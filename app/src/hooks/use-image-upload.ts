import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { apiClient } from '@/api/client';
import { useApiRouter } from '@/api/router';

export type UploadedImage = {
  /** The S3 temp key the API can attach to a resource. */
  key: string;
  /** The local file for an instant preview while the key is consumed. */
  localUri: string;
};

function contentTypeFor(extension: string): string {
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }

  return 'image/jpeg';
}

type ImageUploadOptions = {
  /** Crop to a fixed aspect before uploading. Defaults to a square crop. */
  allowsEditing?: boolean;
  aspect?: [number, number];
};

/**
 * Standard direct-to-S3 image upload: pick from the photo library, then PUT
 * the file to a presigned URL from the API. Resolves to null when the person
 * cancels the picker; throws when the upload itself fails.
 */
export function useImageUpload(options: ImageUploadOptions = {}): {
  isUploading: boolean;
  pickAndUpload: () => Promise<UploadedImage | null>;
} {
  const route = useApiRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { allowsEditing = true, aspect } = options;
  const [aspectX, aspectY] = aspect ?? [1, 1];

  const pickAndUpload = useCallback(async (): Promise<UploadedImage | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
      throw new Error('Photo library access is needed to pick an image.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing,
      aspect: allowsEditing ? [aspectX, aspectY] : undefined,
      // Re-encoding (quality < 1) also converts HEIC photos to JPEG.
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const uri = result.assets[0].uri;
    const pickedExtension = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const extension = ['jpg', 'jpeg', 'png', 'webp'].includes(pickedExtension)
      ? pickedExtension
      : 'jpg';
    const contentType = contentTypeFor(extension);

    setIsUploading(true);
    try {
      const { data } = await apiClient.post<{ url: string; key: string }>(
        route('api.temp-files.presign'),
        { content_type: contentType, extension },
      );

      const upload = await FileSystem.uploadAsync(data.url, uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { 'Content-Type': contentType },
      });

      if (upload.status < 200 || upload.status >= 300) {
        throw new Error(`Upload failed with status ${upload.status}.`);
      }

      return { key: data.key, localUri: uri };
    } finally {
      setIsUploading(false);
    }
  }, [route, allowsEditing, aspectX, aspectY]);

  return { isUploading, pickAndUpload };
}
