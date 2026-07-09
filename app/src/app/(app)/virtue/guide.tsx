import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GUIDE_SECTIONS } from '@/data/auxilium';

// The association's introduction and member requirements, as a reference
// sheet apart from the daily prayer flow.
export default function VirtueGuideScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background pt-8" style={{ paddingBottom: insets.bottom }}>
      <Text className="px-6 text-center text-3xl font-semibold text-foreground">Guía</Text>

      <ScrollView className="mt-4 flex-1" contentContainerClassName="gap-8 px-6 pb-10">
        {GUIDE_SECTIONS.map((section) => (
          <View key={section.title} className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted">
              {section.title}
            </Text>

            {section.paragraphs?.map((paragraph, index) => (
              <Text key={index} className="text-base leading-7 text-foreground">
                {paragraph}
              </Text>
            ))}

            {section.items?.map((item, index) => (
              <View key={index} className="flex-row gap-3">
                <Text className="w-5 text-base font-semibold text-primary-emphasis">
                  {index + 1}
                </Text>
                <Text className="flex-1 text-base leading-7 text-foreground">{item}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
