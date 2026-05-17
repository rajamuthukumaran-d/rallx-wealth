import { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
};

export function SectionCard({ children, className = '', style }: SectionCardProps) {
  const theme = useTheme();
  return (
    <View
      className={`rounded-3xl p-4 ${className}`}
      style={[{ backgroundColor: theme.colors.elevation.level1 }, style]}
    >
      {children}
    </View>
  );
}
