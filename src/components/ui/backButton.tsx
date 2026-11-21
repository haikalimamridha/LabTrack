import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type BackButtonProps = {
  onPress?: () => void;
  style?: ViewStyle;
  color?: string;
  size?: number;
};

export default function BackButton({
  onPress,
  style,
  color = "#FFFFFF",
  size = 27,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="chevron-left"
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
});