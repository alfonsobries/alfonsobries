import { Children, Fragment, type ReactNode } from 'react';
import { Text, View } from 'react-native';

type SettingsSectionProperties = {
  title?: string;
  footer?: string;
  children: ReactNode;
};

// A grouped, inset list section in the style of iOS Settings: an optional
// uppercase header, a rounded surface card, and hairline dividers between rows.
export function SettingsSection({ title, footer, children }: SettingsSectionProperties) {
  const rows = Children.toArray(children);

  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-4 text-xs font-medium uppercase tracking-wide text-muted">{title}</Text>
      ) : null}

      <View className="overflow-hidden rounded-2xl bg-surface">
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View className="ml-4 h-px bg-border" /> : null}
            {row}
          </Fragment>
        ))}
      </View>

      {footer ? <Text className="px-4 text-xs text-muted">{footer}</Text> : null}
    </View>
  );
}
