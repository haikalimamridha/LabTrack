import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, useLocalSearchParams, usePathname } from 'expo-router';
import { PresensiProvider } from "../../context/PresensiContext";


export default function TabLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  return (
    <PresensiProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#625ff0",
          tabBarInactiveTintColor: "#fff",
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerShadowVisible: false,
          headerTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#25292e",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="dashboard" size={24} color={typeof color === 'string' ? color : undefined} />
            ),
          }}
        />
        <Tabs.Screen
          name="jadwal"
          options={{
            title: "Jadwal",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="calendar-alt" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="presensi"
          options={{
            title: "Presensi",
            tabBarIcon: ({ color }) => (
              <Feather name="user-check" size={24} color={typeof color === 'string' ? color : undefined} />
            ),
          }}
        />
        <Tabs.Screen
          name="riwayat"
          options={{
            title: "Riwayat",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="history" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </PresensiProvider>
  );
}
