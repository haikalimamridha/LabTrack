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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert('Perhatian', 'Email wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      await resetPassword(trimmedEmail);

      Alert.alert(
        'Email Terkirim',
        'Tautan untuk mengatur ulang password telah dikirim ke email kamu. Cek juga folder Spam jika belum muncul.',
        [
          {
            text: 'Kembali ke Log In',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      let message = 'Terjadi kesalahan. Silakan coba lagi.';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Format email tidak valid.';
          break;
        case 'auth/user-not-found':
          message = 'Email tidak terdaftar.';
          break;
        case 'auth/too-many-requests':
          message = 'Terlalu banyak percobaan. Coba lagi nanti.';
          break;
        case 'auth/network-request-failed':
          message = 'Periksa koneksi internet kamu.';
          break;
      }

      Alert.alert('Gagal Mengirim', message);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Masukkan email yang terdaftar untuk menerima tautan reset password.
        </Text>

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

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabled]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Sudah ingat password?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Log In</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#9C98B2',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
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
    marginBottom: 24,
  },
  submitButton: {
    height: 54,
    backgroundColor: '#9623D6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 5,
  },
  loginText: {
    color: '#8E8AA3',
    fontSize: 13,
  },
  loginLink: {
    color: '#B56DF0',
    fontSize: 13,
    fontWeight: '600',
  },
});