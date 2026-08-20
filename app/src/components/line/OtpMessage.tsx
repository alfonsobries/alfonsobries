import * as Clipboard from 'expo-clipboard';
import { Check, CopySimple } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type OtpMessageProperties = {
  code: string;
  body: string;
};

export function OtpMessage({ code, body }: OtpMessageProperties) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const success = useThemeColor('success');
  const emphasis = useThemeColor('primary-emphasis');

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View className="max-w-[85%] gap-2">
      <View className="rounded-3xl rounded-bl-lg bg-surface px-4 py-3">
        <Text className="text-xs uppercase tracking-wide text-muted">Verification code</Text>
        <Text selectable className="mt-1 text-3xl font-semibold tracking-widest text-foreground">
          {code}
        </Text>
        <Text selectable className="mt-2 text-sm leading-5 text-muted">
          {body}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied' : 'Copy code'}
        onPress={() => {
          void handleCopy();
        }}
        className="h-11 flex-row items-center justify-center gap-2 self-start rounded-2xl bg-surface-selected px-3 active:opacity-80"
      >
        {copied ? (
          <Check size={16} color={success} weight="bold" />
        ) : (
          <CopySimple size={16} color={emphasis} weight="bold" />
        )}
        <Text className="text-sm font-medium text-foreground">
          {copied ? 'Copied' : 'Copy code'}
        </Text>
      </Pressable>
    </View>
  );
}
