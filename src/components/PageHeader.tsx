import { ReactNode } from "react";
import { View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

type Props = {
  title: string;
  rightAction?: ReactNode;
};

export function PageHeader({ title, rightAction }: Props) {
  const theme = useTheme();
  return (
    <View className="h-16 flex-row items-center justify-between">
      <Text
        className="text-4xl font-medium"
        style={{ color: theme.colors.onSurface }}
      >
        {title}
      </Text>
      <View className="flex-row items-center">
        {rightAction}
        <IconButton icon="bell" size={24} onPress={() => {}} />
      </View>
    </View>
  );
}
