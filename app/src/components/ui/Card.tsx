import { type ReactNode } from 'react';
import { Pressable, type PressableProps, View, type ViewProps } from 'react-native';

type CardProperties = ViewProps &
  Pick<PressableProps, 'onPress'> & {
    children: ReactNode;
  };

// A surface container: rounded, filled with the surface token, and padded.
// Pass `onPress` to make the whole card tappable.
const BASE = 'rounded-3xl bg-surface p-4';

export function Card({ children, onPress, className, ...props }: CardProperties) {
  const classes = `${BASE} ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className={`${classes} active:opacity-80`}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
