
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePresensi } from '../../context/PresensiContext';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Index() {
  const router = useRouter();
  const { daftarSesi, riwayat, sudahPresensi } = usePresensi();

  const totalSesi = daftarSesi.length;

  const sudahHadir = daftarSesi.filter(
    (item) => sudahPresensi(item.id),
  ).length;

  const belumHadir = totalSesi - sudahHadir;

  const sesiTerdekat = daftarSesi
    .filter((item) => item.status !== 'Selesai')
    .slice(0, 2);

  const { nama, nim, email, angkatan, jurusan } =
  useLocalSearchParams<{
    nama?: string;
    nim?: string;
    email?: string;
    angkatan?: string;
    jurusan?: string;
  }>();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>LABTRACK</Text>
            <Text style={styles.greeting}>Halo, {nama ?? 'Praktikan'}!</Text>
            <Text style={styles.subtitle}>
              Siap untuk praktikum hari ini?
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(nama ?? 'P').charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* Identitas pengguna */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {(nama ?? 'Pengguna')
              .split(' ')
              .filter(Boolean)
              .map((kata) => kata.charAt(0))
              .join('')
              .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{nama ?? 'Pengguna Praktikan'}</Text>
            <Text style={styles.profileNim}>{nim ?? '-'}</Text>
            <Text style={styles.profileMajor}>
              {jurusan ?? 'Jurusan belum tersedia'}
              {' · Angkatan '}
              {angkatan ?? '-'}
            </Text>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Praktikan</Text>
          </View>
        </View>

        {/* Ringkasan */}
        <Text style={styles.sectionTitle}>Ringkasan Praktikum</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>▦</Text>
            <Text style={styles.statNumber}>{totalSesi}</Text>
            <Text style={styles.statLabel}>Total Sesi</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statNumber}>{sudahHadir}</Text>
            <Text style={styles.statLabel}>Sudah Hadir</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>◷</Text>
            <Text style={styles.statNumber}>{belumHadir}</Text>
            <Text style={styles.statLabel}>Belum Hadir</Text>
          </View>
        </View>

        {/* Sesi terdekat */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sesi Terdekat</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/praktikan/presensi')}
          >
            <Text style={styles.seeAll}>Lihat semua →</Text>
          </TouchableOpacity>
        </View>

        {sesiTerdekat.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Belum Ada Jadwal</Text>
            <Text style={styles.emptyText}>
              Kamu belum memiliki jadwal praktikum mendatang.
            </Text>
          </View>
        ) : (
          sesiTerdekat.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.kode}</Text>
                </View>
              
                <Text
                style={[
                  styles.scheduleStatus,
                  item.status === 'Belum Dibuka' && {
                    backgroundColor: '#854D0E',
                  },
                  item.status === 'Sedang Berlangsung' && {
                    backgroundColor: '#164E63',
                  },
                  item.status === 'Selesai' && {
                    backgroundColor: '#4B5563',
                  },
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <Text style={styles.scheduleName}>{item.mataPraktikum}</Text>

            <View style={styles.divider} />
          
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal</Text>
              <Text style={styles.infoValue}>{item.hari}, {item.tanggal}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waktu</Text>
              <Text style={styles.infoValue}>{item.waktu}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ruangan</Text>
              <Text style={styles.infoValue}>{item.ruangan}</Text>
            </View>
          </View>
        ))
      )}
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
    paddingTop: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#B8BCC4',
    fontSize: 13,
    marginTop: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343941',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 14,
    marginBottom: 28,
    gap: 12,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: {
    color: '#C7C5FF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  profileNim: {
    color: '#C7C5FF',
    fontSize: 12,
    marginBottom: 4,
  },
  profileMajor: {
    color: '#B8BCC4',
    fontSize: 11,
  },
  roleBadge: {
    backgroundColor: '#45416F',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  roleText: {
    color: '#C7C5FF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#343941',
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#454B55',
  },
  statIcon: {
    color: '#A5A2FF',
    fontSize: 23,
    marginBottom: 8,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B8BCC4',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAll: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleCard: {
    backgroundColor: '#343941',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#454B55',
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#45416F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeText: {
    color: '#C7C5FF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  scheduleStatus: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  scheduleName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 23,
  },
  divider: {
    height: 1,
    backgroundColor: '#505661',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
    textAlign: 'right',
    flex: 2,
  },
  
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#343941',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 24,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#B8BCC4',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  quickActions: {
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343941',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 14,
    gap: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#45416F',
    color: '#C7C5FF',
    fontSize: 20,
  },
  quickTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    width: 75,
  },
  quickSubtitle: {
    color: '#B8BCC4',
    fontSize: 11,
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    color: '#777E89',
    fontSize: 11,
    marginTop: 26,
  },
});