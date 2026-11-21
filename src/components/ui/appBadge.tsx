
import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { COLORS } from "@/constants/theme";

interface AppBadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "primary";
}

export default function AppBadge({
  label,
  variant = "primary",
}: AppBadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  success: {
    backgroundColor: "rgba(74,222,128,0.15)",
  },

  warning: {
    backgroundColor: "rgba(251,191,36,0.15)",
  },

  danger: {
    backgroundColor: "rgba(255,132,148,0.15)",
  },

  primary: {
    backgroundColor: "rgba(98,95,240,0.18)",
  },

  text: {
    fontSize: 10,
    fontWeight: "600",
  },

  successText: {
    color: COLORS.success,
  },

  warningText: {
    color: COLORS.warning,
  },

  dangerText: {
    color: COLORS.danger,
  },

  primaryText: {
    color: COLORS.primaryLight,
  },
});
