
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { COLORS } from "@/constants/theme";

interface AppSectionTitleProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function AppSectionTitle({
  title,
  actionLabel,
  onActionPress,
}: AppSectionTitleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {title}
      </Text>

      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.75}
        >
          <Text style={styles.action}>
            {actionLabel} →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 19,
  },

  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  action: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "600",
  },
});
