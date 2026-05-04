import { ReactNode } from "react";
import { useRouter } from "expo-router";
import { Appbar, useTheme } from "react-native-paper";

type Props = {
  title: string;
  isTransparent?: boolean;
  rightActions?: ReactNode;
};

export function ScreenHeader({ title, isTransparent = false, rightActions }: Props) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Appbar.Header
      style={{ backgroundColor: isTransparent ? "transparent" : theme.colors.background }}
    >
      <Appbar.BackAction onPress={() => router.back()} />
      <Appbar.Content title={title} />
      {rightActions}
    </Appbar.Header>
  );
}
