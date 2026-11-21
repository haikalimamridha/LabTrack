
import CustomTabBar from "@/components/navigation/customTabBar";
import { Tabs } from "expo-router";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => {
        const currentRoute =
          props.state.routes[props.state.index];

        const nestedState = (
          currentRoute as typeof currentRoute & {
            state?: {
              index?: number;
              routes: { name: string }[];
            };
          }
        ).state;

        const nestedRoute =
          nestedState?.routes[
            nestedState.index ?? 0
          ]?.name ?? "index";

        const showTabBar =
          (currentRoute.name === "praktikan" &&
            nestedRoute === "index") ||
          (currentRoute.name === "asprak" &&
            nestedRoute === "index") ||
          currentRoute.name === "profile";

        if (!showTabBar) return null;

        return <CustomTabBar />;
      }}
    >
      <Tabs.Screen name="praktikan" />
      <Tabs.Screen name="asprak" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="maps" />
    </Tabs>
  );
}
