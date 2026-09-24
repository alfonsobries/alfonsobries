import * as FileSystem from 'expo-file-system/legacy';

import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

/**
 * Standard direct-to-S3 upload: ask the API for a presigned URL, then PUT the
 * local file to it. Resolves to the temp key a resource can attach later.
 */
export async function uploadTempFile(
  route: ApiRoute,
  uri: string,
  contentType: string,
  extension: string,
): Promise<string> {
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

  return data.key;
}
