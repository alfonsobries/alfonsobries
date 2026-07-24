import { Image, type ImageProps } from 'expo-image';

// AI illustrations are transparent PNGs drawn for white paper, so the surface
// behind them must stay white in both color schemes — on a dark background
// the black ink line art sinks into the surface.
export function Illustration({ style, ...props }: ImageProps) {
  return (
    <Image
      style={[{ width: '100%', height: '100%', backgroundColor: '#ffffff' }, style]}
      contentFit="cover"
      {...props}
    />
  );
}
