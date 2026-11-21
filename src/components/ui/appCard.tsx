
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  View,
  ViewProps,
} from "react-native";

import { COLORS, SHADOWS, SIZES } from "@/constants/theme";

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  gradientColors?: string[];
}

export default function AppCard({
  children,
  style,
  gradientColors,
  ...props
}: AppCardProps) {
  const cardStyle = [
    styles.card,
    style,
  ];

  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyle}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
});
