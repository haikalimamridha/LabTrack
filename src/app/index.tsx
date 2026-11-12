
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Index() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (profile) {
      const params = {
        userId: profile.uid,
        nama: profile.nama,
        nim: profile.nim,
        email: profile.email,
        angkatan: profile.angkatan,
        jurusan: profile.jurusan,
        role: profile.role,
      };

      if (profile.role === 'praktikan') {
        router.replace({
          pathname: '/praktikan',
          params,
        } as any);
      } else if (profile.role === 'asprak') {
        router.replace({
          pathname: '/asprak',
          params,
        } as any);
      }
    }
  }, [user, profile, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#625FF0" />

      <Text style={styles.text}>
        {loading
          ? 'Memeriksa sesi login...'
          : 'Menyiapkan dashboard...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 14,
  },
});
