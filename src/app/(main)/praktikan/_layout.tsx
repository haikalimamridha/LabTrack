
import { PresensiProvider } from "@/context/PresensiContext";
import { Stack } from "expo-router";

export default function PraktikanLayout() {
  return (
    <PresensiProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="presensi" />
        <Stack.Screen name="jadwal" />
        <Stack.Screen name="izin" />
        <Stack.Screen name="riwayat" />
      </Stack>
    </PresensiProvider>
  );
}
