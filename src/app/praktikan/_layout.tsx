import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, router, useLocalSearchParams, usePathname } from 'expo-router';
import { TouchableOpacity } from 'react-native';


export default function TabLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#625ff0',
            tabBarInactiveTintColor: '#fff',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerShadowVisible: false,
            headerTintColor: '#fff',
            tabBarStyle: {
              backgroundColor: '#25292e',
            },
            headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (pathname === '/praktikan') {
                  router.replace({
                    pathname: '/pilih-identitas',
                    params: { role: 'praktikan' },
                  });
                } else {
                  router.back();
                }
              }}
              style={{ marginLeft: 15 }}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="calendar-alt" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="presensi"
        options={{
          title: 'Presensi',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user-check" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 name="history" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
