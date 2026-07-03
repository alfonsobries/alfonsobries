import { type Icon } from 'phosphor-react-native';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type InputProperties = TextInputProps & {
  label?: string;
  error?: string;
  icon?: Icon;
};

export function Input({
  label,
  error,
  icon: Glyph,
  multiline,
  editable = true,
  className,
  ...props
}: InputProperties) {
  const mutedColor = useThemeColor('muted');
  const dangerColor = useThemeColor('danger');
  const foregroundColor = useThemeColor('foreground');
  const hasError = Boolean(error);
  const iconColor = hasError ? dangerColor : mutedColor;

  return (
    <View className="w-full gap-1.5">
      {label ? <Text className="px-4 text-sm font-medium text-foreground">{label}</Text> : null}
      <View
        className={`flex-row gap-2 rounded-2xl border bg-surface px-4 ${
          multiline ? 'items-start py-3' : 'h-12 items-center'
        } ${hasError ? 'border-danger' : 'border-border'} ${editable ? '' : 'opacity-50'}`}
      >
        {Glyph ? <Glyph size={18} color={iconColor} /> : null}
        {/* `text-[16px]` sets only font-size: a lineHeight on a TextInput
            mis-positions the text vertically on iOS (RN issue #28012). */}
        <TextInput
          className={`flex-1 p-0 text-[16px] ${multiline ? 'h-24' : ''} ${className ?? ''}`}
          style={{ color: foregroundColor }}
          placeholderTextColor={mutedColor}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          editable={editable}
          {...props}
        />
      </View>
      {error ? <Text className="px-4 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}
