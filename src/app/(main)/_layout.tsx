
import CustomTabBar from "@/components/navigation/customTabBar";
import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={() => <CustomTabBar />}
    >
      <Tabs.Screen
        name="praktikan"
        options={{ title: "Praktikan" }}
      />

      <Tabs.Screen
        name="asprak"
        options={{ title: "Asprak" }}
      />

      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
      <Tabs.Screen
        name="maps"
        options={{ title: "Maps" }}
      />
    </Tabs>
  );
}
