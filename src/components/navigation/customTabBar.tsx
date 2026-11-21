
import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar() {
  const { profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Menentukan role pengguna
  const role = profile?.role;

  // Jika profil belum tersedia, navigasi tidak ditampilkan
  if (!role) return null;

  const isPraktikan = role === "praktikan";

  // Menentukan halaman aktif
  const isHome =
    pathname === "/praktikan" ||
    pathname === "/praktikan/" ||
    pathname === "/asprak" ||
    pathname === "/asprak/";

  const isProfile = pathname === "/profile";

  // Navigasi berdasarkan role
  const handleHome = () => {

    if (isPraktikan) {
      router.navigate("/praktikan");
    } else {
      router.navigate("/asprak");
    }
  };

  const handleProfile = () => {
    router.navigate("/profile");
  };

  const handleQR = () => {
    router.navigate("/praktikan/presensi");
  };

  return (
    <View style={styles.bottomNavWrapper}>
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom,
            height: 72 + insets.bottom,
          },
        ]}
      >
        {/* HOME */}
        <Pressable
          style={styles.navItem}
          onPress={handleHome}
        >
          <Ionicons
            name={isHome ? "home" : "home-outline"}
            size={24}
            color={isHome ? "#9623D6" : "#A6A2BA"}
          />

          <Text
            style={[
              styles.navLabel,
              isHome && styles.activeNavLabel,
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* QR PRESENSI KHUSUS PRAKTIKAN */}
        {isPraktikan && (
          <>
            <View style={styles.centerSpacer} />

            <View style={styles.qrCutoutBg} />

            <Pressable
              style={styles.qrButton}
              onPress={handleQR}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={30}
                color="#9C6ADE"
              />
            </Pressable>
          </>
        )}

        {/* PROFILE */}
        <Pressable
          style={styles.navItem}
          onPress={handleProfile}
        >
          <Ionicons
            name={isProfile ? "person" : "person-outline"}
            size={24}
            color={isProfile ? "#9623D6" : "#A6A2BA"}
          />

          <Text
            style={[
              styles.navLabel,
              isProfile && styles.activeNavLabel,
            ]}
          >
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  bottomBar: {
    width: "100%",
    backgroundColor: "#282442",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingHorizontal: 30,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  navLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#A6A2BA",
  },

  activeNavLabel: {
    color: "#9623D6",
    fontWeight: "700",
  },

  centerSpacer: {
    width: 78,
  },

  qrCutoutBg: {
    position: "absolute",
    top: -22,
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#1E1B3A",
    alignItems: "center",
    justifyContent: "center",
  },

  qrButton: {
    position: "absolute",
    top: -16,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#282442",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#9C6ADE",
    elevation: 8,
  },
});
