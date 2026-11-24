
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ScanQRScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    router.replace({
      pathname: "/praktikan/presensi",
      params: { sessionId: data },
    });
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#9C6ADE" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons
          name="camera-outline"
          size={48}
          color="#9C6ADE"
        />

        <Text style={styles.title}>Izin Kamera</Text>

        <Text style={styles.subtitle}>
          Kamera diperlukan untuk memindai QR Code presensi.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Izinkan Kamera
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Scan QR Presensi
        </Text>
      </View>

      {/* SCAN FRAME */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.scanText}>
          Arahkan kamera ke QR Code sesi praktikum
        </Text>
      </View>
    </View>
  );
}

const CORNER_SIZE = 36;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B3A",
  },

  center: {
    flex: 1,
    backgroundColor: "#1E1B3A",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
  },

  subtitle: {
    color: "#A6A2BA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: "#6D45B5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  backText: {
    color: "#A6A2BA",
    marginTop: 20,
  },

  header: {
    position: "absolute",
    top: 55,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(30,27,58,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scanFrame: {
    width: 260,
    height: 260,
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#9C6ADE",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: 12,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: 12,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 12,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: 12,
  },

  scanText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
    marginHorizontal: 40,
    backgroundColor: "rgba(30,27,58,0.75)",
    padding: 14,
    borderRadius: 12,
  },
});
