import { requireOptionalNativeModule } from 'expo';

export type Sticker = {
  /** A local PNG with a transparent background, ready to upload. */
  uri: string;
  width: number;
  height: number;
  /** Whether a subject was cut out; false means the whole photo was used. */
  lifted: boolean;
};

const StickerMaker = requireOptionalNativeModule<{
  makeSticker(uri: string, options: { liftSubject: boolean }): Promise<Sticker>;
}>('StickerMaker');

export const canMakeStickers = StickerMaker !== null;

/**
 * Turns a photo into an outlined sticker, cutting the subject out of its
 * background when `liftSubject` is on and the photo has a clear one.
 */
export async function makeSticker(uri: string, liftSubject: boolean): Promise<Sticker | null> {
  return (await StickerMaker?.makeSticker(uri, { liftSubject })) ?? null;
}
