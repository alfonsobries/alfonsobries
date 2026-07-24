import { Text, View } from 'react-native';

import { type PrayerBlock } from '@/data/auxilium';

/** Renders one block of a prayer — shared by every guided prayer player. */
export function PrayerBlockView({ block }: { block: PrayerBlock }) {
  switch (block.kind) {
    case 'paragraph': {
      return <Text className="text-lg leading-8 text-foreground">{block.text}</Text>;
    }

    case 'lines': {
      return (
        <View className="gap-0.5">
          {block.lines.map((line, index) => (
            <Text key={index} className="text-lg leading-8 text-foreground">
              {line}
            </Text>
          ))}
        </View>
      );
    }

    case 'versicle': {
      return (
        <View className="gap-2">
          <Text className="text-lg leading-8 text-foreground">
            <Text className="font-bold text-primary-emphasis">V. </Text>
            {block.call}
          </Text>
          <Text className="text-lg leading-8 text-foreground">
            <Text className="font-bold text-primary-emphasis">R. </Text>
            {block.response}
          </Text>
        </View>
      );
    }

    case 'litany': {
      return (
        <View className="gap-2.5">
          {block.items.map((item, index) => (
            <Text key={index} className="text-lg leading-7 text-foreground">
              {item.call}, <Text className="italic text-muted">{item.response}</Text>
            </Text>
          ))}
        </View>
      );
    }

    case 'note': {
      return <Text className="text-lg italic leading-8 text-muted">{block.text}</Text>;
    }
  }
}
