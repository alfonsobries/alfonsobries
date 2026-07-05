import * as Clipboard from 'expo-clipboard';
import { Check, CopySimple } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type CopyableReplyProperties = {
  content: string;
};

/**
 * Split a reply into the copy-ready result and any trailing notes. Assistants
 * flagged `copyable_output` put the result in a fenced code block (like the
 * translator); when there's no fence the whole reply is the result.
 */
function splitReply(content: string): { result: string; notes: string | null } {
  const match = content.match(/```[\w-]*\n?([\s\S]*?)```/);

  if (!match || match.index === undefined) {
    return { result: content.trim(), notes: null };
  }

  const notes = (
    content.slice(0, match.index) + content.slice(match.index + match[0].length)
  ).trim();

  return { result: match[1].trim(), notes: notes.length > 0 ? notes : null };
}

/**
 * An assistant reply whose main job is to be pasted somewhere else: the
 * result reads as regular text but sits in its own card with a copy button.
 */
export function CopyableReply({ content }: CopyableReplyProperties) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successColor = useThemeColor('success');
  const emphasisColor = useThemeColor('primary-emphasis');

  const { result, notes } = splitReply(content);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(result);
    setCopied(true);

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="gap-2">
      <View className="overflow-hidden rounded-3xl border border-border bg-surface">
        <Text selectable className="px-4 pt-4 text-[16px] leading-6 text-foreground">
          {result}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy to clipboard"
          onPress={handleCopy}
          className="flex-row items-center justify-center gap-1.5 px-4 py-3 active:opacity-60"
        >
          {copied ? (
            <Check size={16} weight="bold" color={successColor} />
          ) : (
            <CopySimple size={16} weight="bold" color={emphasisColor} />
          )}
          <Text
            className={`text-sm font-semibold ${copied ? 'text-success' : 'text-primary-emphasis'}`}
          >
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>
      {notes ? (
        <Text selectable className="px-1 text-sm leading-5 text-muted">
          {notes}
        </Text>
      ) : null}
    </View>
  );
}
