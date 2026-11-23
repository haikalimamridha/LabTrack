
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

type TimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: "mulai" | "selesai";
  startTime?: string;
  endTime?: string;
};

const ITEM_HEIGHT = 44;
const WHEEL_HEIGHT = 132;

const parseTime = (value: string) => {
  if (!value) return null;

  const [hour, minute] = value.split(":").map(Number);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

const formatTime = (total: number) => {
  const hour = Math.floor(total / 60);
  const minute = total % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export default function TimePicker({
  label,
  value,
  onChange,
  type,
  startTime,
  endTime,
}: TimePickerProps) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);

    const hourRef = useRef<any>(null);
    const minuteRef = useRef<any>(null);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const scrollToValue = (
    ref: React.RefObject<any>,
    value: number
    ) => {
    setTimeout(() => {
        ref.current?.scrollTo({
        y: value * ITEM_HEIGHT,
        animated: false,
        });
    }, 100);
    };

  useEffect(() => {
    if (!visible) return;

    const current = parseTime(value) ?? 420;

    const initialHour = Math.floor(current / 60);
    const initialMinute = current % 60;

    setHour(initialHour);
    setMinute(initialMinute);

    scrollToValue(hourRef, initialHour);
    scrollToValue(minuteRef, initialMinute);
  }, [visible, value]);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    type: "hour" | "minute"
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.y / ITEM_HEIGHT
    );

    if (type === "hour") {
      setHour(Math.max(0, Math.min(23, index)));
    } else {
      setMinute(Math.max(0, Math.min(59, index)));
    }
  };

  const save = () => {
    const selectedTime = hour * 60 + minute;

    const minimum = 420; // 07:00
    const maximum = 1320; // 20:00

    if (selectedTime < minimum || selectedTime > maximum) {
      Alert.alert(
        "Waktu tidak valid",
        "Waktu praktikum harus berada antara 07:00–22:00."
      );
      return;
    }

    if (type === "selesai") {
      const start = parseTime(startTime ?? "");

      if (start === null) {
        Alert.alert("Perhatian", "Pilih waktu mulai terlebih dahulu.");
        return;
      }

      if (selectedTime <= start) {
        Alert.alert(
          "Waktu tidak valid",
          "Waktu selesai harus lebih besar dari waktu mulai."
        );
        return;
      }
    }

    if (type === "mulai" && endTime) {
      const end = parseTime(endTime);

      if (end !== null && selectedTime >= end) {
        Alert.alert(
          "Waktu tidak valid",
          "Waktu mulai harus lebih kecil dari waktu selesai."
        );
        return;
      }
    }

    onChange(formatTime(selectedTime));
    setVisible(false);
  };

    const renderWheel = (
    data: number[],
    selected: number,
    ref: React.RefObject<any>,
    wheelType: "hour" | "minute"
    ) => (
    <View style={styles.wheelColumn}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.wheelContent}
        onMomentumScrollEnd={(event) =>
          handleScroll(event, wheelType)
        }
        onScrollEndDrag={(event) => {
          handleScroll(event, wheelType);
        }}
      >
        {data.map((item) => (
          <View key={item} style={styles.wheelItem}>
            <Text
              style={[
                styles.wheelText,
                selected === item && styles.wheelTextActive,
              ]}
            >
              {String(item).padStart(2, "0")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => {
          if (type === "selesai" && !startTime) {
            Alert.alert(
              "Perhatian",
              "Pilih waktu mulai terlebih dahulu."
            );
            return;
          }

          setVisible(true);
        }}
      >
        <MaterialCommunityIcons
          name="clock-outline"
          size={21}
          color="#B99AFF"
        />

        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {value || "Pilih waktu"}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color="#B99AFF"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {type === "mulai"
                  ? "Pilih Waktu Mulai"
                  : "Pilih Waktu Selesai"}
              </Text>

              <TouchableOpacity onPress={() => setVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.wheelContainer}>
              <View pointerEvents="none" style={styles.selectionHighlight} />

              {renderWheel(hours, hour, hourRef, "hour")}

              <Text style={styles.separator}>:</Text>

              {renderWheel(minutes, minute, minuteRef, "minute")}
            </View>

            <Text style={styles.hint}>
              Jam buka lab 07:00–22:00
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={save}
              >
                <Text style={styles.confirmText}>Pilih Waktu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#302A4D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#494166",
    height: 52,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  placeholder: {
    color: "#9993AE",
    fontWeight: "400",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  modal: {
    width: "100%",
    backgroundColor: "#25213D",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#494166",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "#AAA2C2",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  wheelContainer: {
    height: WHEEL_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    position: "relative",
  },
  wheelColumn: {
    height: WHEEL_HEIGHT,
    width: 85,
    overflow: "hidden",
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    color: "#77718E",
    fontSize: 23,
    fontWeight: "500",
  },
  wheelTextActive: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },
  separator: {
    color: "#B99AFF",
    fontSize: 30,
    fontWeight: "700",
    marginHorizontal: 8,
  },
  selectionHighlight: {
    position: "absolute",
    left: 15,
    right: 15,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    backgroundColor: "#49358B",
    borderRadius: 10,
    zIndex: -1,
  },
  preview: {
    color: "#B99AFF",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  hint: {
    color: "#AAA2C2",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#302A4D",
    alignItems: "center",
  },
  cancelText: {
    color: "#D8D2E8",
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#7651C9",
    alignItems: "center",
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
