import { Directory, File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

/**
 * Download an illustration and save it to the photo library, so it can be
 * printed or shared from Photos. Throws when permission is denied or the
 * download fails.
 */
export async function saveImageToPhotos(url: string): Promise<void> {
  const permission = await MediaLibrary.requestPermissionsAsync(true);

  if (!permission.granted) {
    throw new Error('Photos permission was not granted.');
  }

  const directory = new Directory(Paths.cache, 'illustrations');
  directory.create({ idempotent: true, intermediates: true });

  const file = await File.downloadFileAsync(url, directory, { idempotent: true });

  try {
    await MediaLibrary.Asset.create(file.uri);
  } finally {
    file.delete();
  }
}
