import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { useApiRouter } from '@/api/router';
import { uploadTempFile } from '@/api/uploads';

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

export type ImageSource = 'library' | 'camera';

/**
 * Standard direct-to-S3 image upload: pick from the photo library (or take a
 * photo), then PUT the file to a presigned URL from the API. Resolves to null
 * when the person cancels the picker; throws when the upload itself fails.
 */
export function useImageUpload(options: ImageUploadOptions = {}): {
  isUploading: boolean;
  pickAndUpload: (source?: ImageSource) => Promise<UploadedImage | null>;
} {
  const route = useApiRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { allowsEditing = true, aspect } = options;
  const [aspectX, aspectY] = aspect ?? [1, 1];

  const pickAndUpload = useCallback(
    async (source: ImageSource = 'library'): Promise<UploadedImage | null> => {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        throw new Error(
          source === 'camera'
            ? 'Camera access is needed to take a photo.'
            : 'Photo library access is needed to pick an image.',
        );
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing,
        aspect: allowsEditing ? [aspectX, aspectY] : undefined,
        // Re-encoding (quality < 1) also converts HEIC photos to JPEG.
        quality: 0.8,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

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
        const key = await uploadTempFile(route, uri, contentType, extension);

        return { key, localUri: uri };
      } finally {
        setIsUploading(false);
      }
    },
    [route, allowsEditing, aspectX, aspectY],
  );

  return { isUploading, pickAndUpload };
}
