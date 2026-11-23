
import { SesiProvider } from "@/context/SesiContext";
import { Stack } from "expo-router";

export default function AsprakLayout() {
  return (
    <SesiProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 280,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="jadwal" />
        <Stack.Screen name="sesi" />
        <Stack.Screen name="rekap" />
        <Stack.Screen name="izin" />
        <Stack.Screen name="lab" />
      </Stack>
    </SesiProvider>
  );
}
