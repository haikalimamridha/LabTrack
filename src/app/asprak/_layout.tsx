import { SesiProvider } from '@/context/SesiContext';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, useLocalSearchParams, usePathname } from 'expo-router';


export default function TabLayout() {
  const pathname = usePathname();
  const params = useLocalSearchParams();
  return (
    <SesiProvider>
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
          name="rekap"
          options={{
            title: 'Rekap',
            tabBarIcon: ({ color, focused }) => (
              <Feather name="user-check" size={24} color={typeof color === 'string' ? color : undefined} />
            ),
          }}
        />
      </Tabs>
    </SesiProvider>
  );
}
