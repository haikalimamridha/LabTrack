
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type UserRole = 'praktikan' | 'asprak';

type DummyUser = {
  id: string;
  nama: string;
  nim: string;
  email: string;
  angkatan: string;
  jurusan: string;
  role: UserRole;
};

const usersDummy: DummyUser[] = [
  {
    id: 'U001',
    nama: 'Amelia Putri',
    nim: '26060124140001',
    email: 'aditya.pratama@example.com',
    angkatan: '2024',
    jurusan: 'Informatika',
    role: 'praktikan',
  },
  {
    id: 'U002',
    nama: 'Nabila Ramadhani',
    nim: '26060124140002',
    email: 'nabila.putri@example.com',
    angkatan: '2024',
    jurusan: 'Informatika',
    role: 'praktikan',
  },
  {
    id: 'U003',
    nama: 'Rizky Firmansyah',
    nim: '25060124140003',
    email: 'rizky.firmansyah@example.com',
    angkatan: '2024',
    jurusan: 'Informatika',
    role: 'praktikan',
  },
  {
    id: 'U004',
    nama: 'Bagas Saputra',
    nim: '24060122140004',
    email: 'bagas.saputra@example.com',
    angkatan: '2024',
    jurusan: 'Informatika',
    role: 'asprak',
  },
  {
    id: 'U005',
    nama: 'Nadia Rahmawati',
    nim: '25060122140005',
    email: 'nadia.rahmawati@example.com',
    angkatan: '2025',
    jurusan: 'Informatika',
    role: 'asprak',
  },
  {
    id: 'U006',
    nama: 'Andi Pratama',
    nim: '24060122140005',
    email: 'andi.pratama@example.com',
    angkatan: '2024',
    jurusan: 'Informatika',
    role: 'asprak',
  },
];

export default function PilihIdentitasScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const roleValid =
    role === 'praktikan' || role === 'asprak';

  const users = usersDummy.filter(
    (user) => user.role === role
  );

  const pilihUser = () => {
    if (!selectedId || !roleValid) return;

    router.replace(
      role === 'praktikan' ? '/praktikan' : '/asprak'
    );
  };

  if (!roleValid) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Pilih Identitas</Text>
        <Text style={styles.description}>
          Peran pengguna belum dipilih.
          Silakan kembali ke halaman awal.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.primaryButtonText}>
            Kembali ke Halaman Awal
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>LABTRACK</Text>

        <Text style={styles.title}>
          Pilih Identitas
        </Text>

        <Text style={styles.description}>
          Pilih akun dummy untuk melanjutkan sebagai{' '}
          {role === 'praktikan'
            ? 'praktikan'
            : 'asisten praktikum'}
          .
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {role === 'praktikan'
              ? 'Praktikan'
              : 'Asisten Praktikum'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Daftar Pengguna
        </Text>

        {users.map((user) => {
          const selected = selectedId === user.id;

          return (
            <TouchableOpacity
              key={user.id}
              activeOpacity={0.8}
              style={[
                styles.userCard,
                selected && styles.userCardSelected,
              ]}
              onPress={() => setSelectedId(user.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.nama.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userMain}>
                  <Text style={styles.userName}>
                    {user.nama}
                  </Text>
                  <Text style={styles.userNim}>
                    NIM: {user.nim}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radio,
                    selected && styles.radioSelected,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Email
                </Text>
                <Text style={styles.infoValue}>
                  {user.email}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Angkatan
                </Text>
                <Text style={styles.infoValue}>
                  {user.angkatan}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Jurusan
                </Text>
                <Text style={styles.infoValue}>
                  {user.jurusan}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {users.length === 0 && (
          <Text style={styles.emptyText}>
            Belum ada identitas untuk peran ini.
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !selectedId && styles.buttonDisabled,
          ]}
          disabled={!selectedId}
          onPress={pilihUser}
        >
          <Text style={styles.primaryButtonText}>
            Lanjutkan ke Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.backButtonText}>
            Kembali Pilih Peran
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 32,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#25292e',
  },
  eyebrow: {
    color: '#A5A1FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#B8BCC4',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#45416F',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 26,
  },
  roleText: {
    color: '#D8D6FF',
    fontWeight: '600',
    fontSize: 13,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  userCard: {
    backgroundColor: '#343941',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  userCardSelected: {
    borderColor: '#7773FF',
    backgroundColor: '#34354A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userMain: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userNim: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#737985',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#8985FF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8985FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#505661',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 9,
  },
  infoLabel: {
    color: '#AEB4BE',
    fontSize: 12,
    flex: 1,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  emptyText: {
    color: '#B8BCC4',
    textAlign: 'center',
    padding: 24,
  },
  primaryButton: {
    backgroundColor: '#625FF0',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#484B55',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#C7C5FF',
    fontSize: 13,
    fontWeight: '600',
  },
});
