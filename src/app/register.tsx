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
          kelasId
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
    toggleVisible: () => void // Parameter ini sudah ada, tinggal dipakai!
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
          secureTextEntry={!visible} // Menggunakan parameter visible
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity onPress={toggleVisible}> {/* Menggunakan fungsi dari parameter */}
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'} // Menggunakan status visible yang dinamis
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

          <Text style={styles.label}>Kelas Praktikum</Text>

          {loadingKelas ? (
            <View style={styles.classLoading}>
              <ActivityIndicator color="#A5A2FF" />
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
                activeOpacity={0.8}
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
                  color="#A6ABB5"
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
                      activeOpacity={0.8}
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
                          color="#A5A2FF"
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

  classOptions: {
    gap: 9,
    marginBottom: 17,
  },

  classOption: {
    minHeight: 46,
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  classOptionActive: {
    borderColor: '#625ff0',
    backgroundColor: '#45416F',
  },

  classOptionText: {
    color: '#A6ABB5',
    fontSize: 13,
    fontWeight: '500',
  },

  classOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  classLoading: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 17,
  },

  classLoadingText: {
    color: '#A6ABB5',
    fontSize: 12,
  },

  classError: {
    color: '#EF6464',
    fontSize: 12,
    marginBottom: 17,
  },

  dropdownContainer: {
    marginBottom: 17,
    zIndex: 10,
  },

  dropdownButton: {
    height: 48,
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownButtonActive: {
    borderColor: '#625ff0',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  dropdownText: {
    color: '#FFFFFF',
    fontSize: 13,
  },

  dropdownPlaceholder: {
    color: '#858B96',
  },

  dropdownList: {
    backgroundColor: '#25292e',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#625ff0',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    overflow: 'hidden',
  },

  dropdownItem: {
    minHeight: 46,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownItemActive: {
    backgroundColor: '#45416F',
  },

  dropdownItemText: {
    color: '#A6ABB5',
    fontSize: 13,
  },

  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

});
