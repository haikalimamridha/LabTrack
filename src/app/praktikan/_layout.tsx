
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter, type Href } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PresensiProvider } from "@/context/PresensiContext";

type CustomTabBarProps = {
  state: {
    index: number;
    routes: Array<{
      name: string;
    }>;
  };
};

function CustomTabBar({ state }: CustomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeRoute = state.routes[state.index]?.name;

  const navigate = (route: string) => {
    router.navigate(route as Href);
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
          onPress={() => navigate("/praktikan")}
        >
          <Ionicons
            name={activeRoute === "index" ? "home" : "home-outline"}
            size={24}
            color={activeRoute === "index" ? "#9623D6" : "#A6A2BA"}
          />

          <Text
            style={[
              styles.navLabel,
              activeRoute === "index" && styles.activeNavLabel,
            ]}
          >
            Home
          </Text>
        </Pressable>

        {/* RUANG KOSONG UNTUK TOMBOL QR */}
        <View style={styles.centerSpacer} />

        {/* PROFILE */}
        <Pressable
          style={styles.navItem}
          onPress={() => navigate("/praktikan/profile")}
        >
          <Ionicons
            name={
              activeRoute === "profile"
                ? "person"
                : "person-outline"
            }
            size={24}
            color={activeRoute === "profile" ? "#9623D6" : "#A6A2BA"}
          />

          <Text
            style={[
              styles.navLabel,
              activeRoute === "profile" && styles.activeNavLabel,
            ]}
          >
            Profile
          </Text>
        </Pressable>
      </View>

      {/* CUTOUT DI TENGAH NAVIGASI */}
      <View style={styles.qrCutoutBg} />

      {/* TOMBOL QR SCAN */}
      <Pressable
        style={styles.qrButton}
        onPress={() => navigate("/praktikan/presensi")}
      >
        <MaterialCommunityIcons
          name="qrcode-scan"
          size={30}
          color="#9C6ADE"
        />
      </Pressable>
    </View>
  );
}

export default function PraktikanLayout() {
  return (
    <PresensiProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => {
          const currentRoute =
            props.state.routes[props.state.index]?.name;

          const showTabBar = [
            "index",
            "presensi",
            "profile",
          ].includes(currentRoute);

          if (!showTabBar) {
            return null;
          }

          return <CustomTabBar state={props.state} />;
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="presensi" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="jadwal" />
        <Tabs.Screen name="izin" />
        <Tabs.Screen name="riwayat" />
        <Tabs.Screen name="maps" />
      </Tabs>
    </PresensiProvider>
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
    height: 72,
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
