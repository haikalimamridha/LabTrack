import { Stack } from 'expo-router';
import { PresensiProvider } from '../context/PresensiContext';

export default function RootLayout() {
  return (
    <PresensiProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pilih-identitas" />
        <Stack.Screen name="praktikan" />
        <Stack.Screen name="asprak" />
      </Stack>
    </PresensiProvider>
  );
}
