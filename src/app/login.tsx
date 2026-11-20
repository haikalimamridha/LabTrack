import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
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

      router.replace('/');
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
        <Text style={styles.title}>Log In</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Your Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Email"
            placeholderTextColor="#B8B4C8"
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
              placeholder="Masukkan Password"
              placeholderTextColor="#B8B4C8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#A6A2BA"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum punya akun?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B3A',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#8E8AA3',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  input: {
    height: 54,
    backgroundColor: '#3A3654',
    borderRadius: 12,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 20,
  },
  passwordContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3654',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingRight: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 26,
  },
  forgotPasswordText: {
    color: '#B56DF0',
    fontSize: 13,
  },
  loginButton: {
    height: 54,
    backgroundColor: '#9623D6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 5,
  },
  registerText: {
    color: '#8E8AA3',
    fontSize: 13,
  },
  registerLink: {
    color: '#B56DF0',
    fontSize: 13,
    fontWeight: '600',
  },
});