import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
                if (pathname === '/asprak') {
                  router.replace({
                    pathname: '/pilih-identitas',
                    params: { role: 'asprak' },
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
            <MaterialIcons name="dashboard" size={24} color={typeof color === 'string' ? color : undefined} />
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
        name="sesi"
        options={{
          title: 'Sesi',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="check-square-o" size={24} color={typeof color === 'string' ? color : undefined} />
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
