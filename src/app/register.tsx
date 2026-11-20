import { useAuth } from '@/context/AuthContext';
import { getKelasAktif, type Kelas } from '@/services/kelasService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  const [showKelasDropdown, setShowKelasDropdown] = useState(false);

  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [kelasId, setKelasId] = useState('');
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadKelas = async () => {
      try {
        const data = await getKelasAktif();
        setDaftarKelas(data);
      } catch (error) {
        console.error('Gagal mengambil daftar kelas:', error);
        Alert.alert('Gagal', 'Tidak dapat mengambil daftar kelas.');
      } finally {
        setLoadingKelas(false);
      }
    };

    void loadKelas();
  }, []);

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
          kelasId,
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
        placeholderTextColor="#B8B4C8"
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
          placeholderTextColor="#B8B4C8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          onPress={toggleVisible}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#A6A2BA"
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

          {renderInput(
            'Full Name',
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

          <Text style={styles.label}>Kelas Praktikum</Text>

          {loadingKelas ? (
            <View style={styles.classLoading}>
              <ActivityIndicator color="#B56DF0" />
              <Text style={styles.classLoadingText}>
                Memuat daftar kelas...
              </Text>
            </View>
          ) : (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  showKelasDropdown && styles.dropdownButtonActive,
                ]}
                onPress={() => setShowKelasDropdown(!showKelasDropdown)}
                disabled={daftarKelas.length === 0}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !kelasId && styles.dropdownPlaceholder,
                  ]}
                >
                  {daftarKelas.find((item) => item.id === kelasId)?.nama ??
                    'Pilih kelas praktikum'}
                </Text>

                <Ionicons
                  name={showKelasDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#A6A2BA"
                />
              </TouchableOpacity>

              {showKelasDropdown && (
                <View style={styles.dropdownList}>
                  {daftarKelas.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.dropdownItem,
                        kelasId === item.id && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setKelasId(item.id);
                        setShowKelasDropdown(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          kelasId === item.id &&
                            styles.dropdownItemTextActive,
                        ]}
                      >
                        {item.nama}
                      </Text>

                      {kelasId === item.id && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#B56DF0"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          {renderInput(
            'Your Email',
            'Cooper_Kristin@gmail.com',
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
            'Confirm Password',
            'Masukkan ulang password',
            konfirmasiPassword,
            setKonfirmasiPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}

          <View style={styles.roleInfo}>
            <Text style={styles.roleInfoTitle}>Role Akun</Text>
            <Text style={styles.roleInfoText}>
              Akun baru akan didaftarkan sebagai Praktikan. Role Asisten
              diberikan oleh administrator.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Sudah punya akun?</Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B3A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  formContainer: {
    width: '100%',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
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
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#332F52',
    marginTop: 4,
    marginBottom: 22,
  },
  roleInfo: {
    backgroundColor: '#2E2A4D',
    borderWidth: 1,
    borderColor: '#4A4375',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  roleInfoTitle: {
    color: '#D5C2FF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleInfoText: {
    color: '#B5B0CC',
    fontSize: 12,
    lineHeight: 18,
  },
  registerButton: {
    height: 54,
    backgroundColor: '#9623D6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  classLoading: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  classLoadingText: {
    color: '#9C98B2',
    fontSize: 13,
  },
  dropdownContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownButton: {
    height: 54,
    backgroundColor: '#3A3654',
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#B8B4C8',
  },
  dropdownList: {
    backgroundColor: '#3A3654',
    borderTopWidth: 1,
    borderTopColor: '#4D486E',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#4C4373',
  },
  dropdownItemText: {
    color: '#D8D5E6',
    fontSize: 14,
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});