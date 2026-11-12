import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !nama.trim() ||
      !nim.trim() ||
      !angkatan.trim() ||
      !jurusan.trim() ||
      !email.trim() ||
      !password ||
      !konfirmasiPassword
    ) {
      Alert.alert('Perhatian', 'Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Password Tidak Valid',
        'Password minimal terdiri dari 6 karakter.'
      );
      return;
    }

    if (password !== konfirmasiPassword) {
      Alert.alert(
        'Password Tidak Cocok',
        'Konfirmasi password tidak sesuai.'
      );
      return;
    }

    try {
      setLoading(true);

      await register(
        {
          nama,
          email,
          nim,
          angkatan,
          jurusan,
        },
        password
      );

      Alert.alert(
        'Registrasi Berhasil',
        'Akun berhasil dibuat. Selamat bergabung di LabTrack!',
        [
          {
            text: 'Lanjutkan',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error: any) {
      let message = 'Terjadi kesalahan. Silakan coba lagi.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email sudah terdaftar. Silakan gunakan email lain.';
          break;
        case 'auth/invalid-email':
          message = 'Format email tidak valid.';
          break;
        case 'auth/weak-password':
          message = 'Password terlalu lemah.';
          break;
        case 'auth/network-request-failed':
          message = 'Periksa koneksi internet kamu.';
          break;
      }

      Alert.alert('Registrasi Gagal', message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (value: string) => void,
    options: {
      keyboardType?: 'default' | 'email-address' | 'numeric';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    } = {}
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#858B96"
        value={value}
        onChangeText={onChangeText}
        keyboardType={options.keyboardType ?? 'default'}
        autoCapitalize={options.autoCapitalize ?? 'sentences'}
        autoCorrect={false}
      />
    </>
  );

  const renderPassword = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (value: string) => void,
    visible: boolean,
    toggleVisible: () => void
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#858B96"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>LABTRACK</Text>
          <Text style={styles.title}>Buat Akun Baru</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

          {renderInput(
            'Nama Lengkap',
            'Masukkan nama lengkap',
            nama,
            setNama
          )}

          {renderInput(
            'NIM',
            'Masukkan NIM',
            nim,
            setNim,
            { keyboardType: 'numeric' }
          )}

          {renderInput(
            'Angkatan',
            'Contoh: 2024',
            angkatan,
            setAngkatan,
            { keyboardType: 'numeric' }
          )}

          {renderInput(
            'Jurusan',
            'Masukkan jurusan',
            jurusan,
            setJurusan
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          {renderInput(
            'Email',
            'Masukkan email aktif',
            email,
            setEmail,
            {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            }
          )}

          {renderPassword(
            'Password',
            'Minimal 6 karakter',
            password,
            setPassword,
            showPassword,
            () => setShowPassword(!showPassword)
          )}

          {renderPassword(
            'Konfirmasi Password',
            'Masukkan ulang password',
            konfirmasiPassword,
            setKonfirmasiPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}

          <View style={styles.roleInfo}>
            <Text style={styles.roleInfoTitle}>
              Role Akun
            </Text>
            <Text style={styles.roleInfoText}>
              Akun baru akan didaftarkan sebagai Praktikan.
              Role Asisten diberikan oleh administrator.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>
                Daftar Sekarang
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Sudah punya akun?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          © 2026 LabTrack. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 25,
  },
  logo: {
    color: '#A5A2FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 8,
  },
  formContainer: {
    backgroundColor: '#343941',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 18,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 9,
    paddingHorizontal: 13,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 17,
  },
  passwordContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 9,
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  showPassword: {
    color: '#A5A2FF',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 10,
  },
  roleInfo: {
    backgroundColor: '#45416F',
    borderRadius: 10,
    padding: 13,
    marginTop: 5,
    marginBottom: 20,
  },
  roleInfoTitle: {
    color: '#D5D3FF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  roleInfoText: {
    color: '#E0DFFF',
    fontSize: 11,
    lineHeight: 17,
  },
  registerButton: {
    height: 49,
    backgroundColor: '#625ff0',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  loginText: {
    color: '#A6ABB5',
    fontSize: 12,
  },
  loginLink: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: '#707782',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 25,
  },
});
