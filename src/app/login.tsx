import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Perhatian', 'Email dan password wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      Alert.alert('Berhasil', 'Login berhasil.');

      router.replace('/pilih-identitas');
    } catch (error: any) {
      let message = 'Terjadi kesalahan. Silakan coba lagi.';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Format email tidak valid.';
          break;
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          message = 'Email atau password salah.';
          break;
        case 'auth/wrong-password':
          message = 'Password yang kamu masukkan salah.';
          break;
        case 'auth/too-many-requests':
          message = 'Terlalu banyak percobaan. Coba lagi nanti.';
          break;
        case 'auth/network-request-failed':
          message = 'Periksa koneksi internet kamu.';
          break;
      }

      Alert.alert('Login Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>L</Text>
          </View>

          <Text style={styles.logo}>LABTRACK</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Masuk ke akun LabTrack kamu untuk melanjutkan.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email"
            placeholderTextColor="#858B96"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan password"
              placeholderTextColor="#858B96"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPassword}>
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Belum punya akun?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerLink}>
                Daftar sekarang
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          © 2026 LabTrack. All rights reserved.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 42,
  },
  logoIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#625ff0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoIconText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 4,
  },
  formContainer: {
    backgroundColor: '#343941',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 22,
  },
  subtitle: {
    color: '#A6ABB5',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 26,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9,
  },
  input: {
    height: 50,
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 20,
  },
  passwordContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 26,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  showPassword: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#625ff0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    gap: 5,
  },
  registerText: {
    color: '#A6ABB5',
    fontSize: 12,
  },
  registerLink: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: '#707782',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },
});
