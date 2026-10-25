import { Tabs, router, usePathname } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { TabIcon } from '../../components/ui/tab-icon';

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#625ff0',
        tabBarInactiveTintColor: '#B8BCC4',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
          borderTopColor: '#454B55',
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
            <TabIcon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name="dashboard"
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name="calendar"
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sesi"
        options={{
          title: 'Sesi',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name="sesi"
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Rekap Presensi',
          tabBarIcon: ({ color }) => (
            <TabIcon
              name="history"
              size={24}
              color={typeof color === 'string' ? color : undefined}
            />
          ),
        }}
      />
    </Tabs>
  );
}
