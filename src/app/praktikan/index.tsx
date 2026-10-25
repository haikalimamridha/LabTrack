import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { jadwalDummy } from '../../data/jadwalDummy';
import { usePresensi } from '../../context/PresensiContext';

export default function Index() {
  const router = useRouter();
  const { daftarSesi, riwayat } = usePresensi();

  const { nama, nim, angkatan, jurusan } =
    useLocalSearchParams<{
      nama?: string;
      nim?: string;
      angkatan?: string;
      jurusan?: string;
    }>();

  const namaUser = nama ?? 'Amelia Putri';
  const nimUser = nim ?? '26060124140001';
  const angkatanUser = angkatan ?? '2024';
  const jurusanUser = jurusan ?? 'Informatika';

  const inisial = namaUser
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0])
    .join('')
    .toUpperCase();

  const totalSesi = daftarSesi.length;
  const sudahHadir = riwayat.length;
  const belumHadir = Math.max(0, totalSesi - sudahHadir);

  const jadwalTerdekat = jadwalDummy
    .filter((item) => item.status === 'Akan Datang')
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>LABTRACK</Text>
              <Text style={styles.greeting}>Halo, {namaUser}!</Text>
              <Text style={styles.subtitle}>
                Siap untuk praktikum hari ini?
              </Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{inisial}</Text>
            </View>
          </View>

          {/* Identitas pengguna */}
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>{inisial}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{namaUser}</Text>
              <Text style={styles.profileNim}>{nimUser}</Text>
              <Text style={styles.profileMajor}>
                {jurusanUser} • Angkatan {angkatanUser}
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
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>{totalSesi}</Text>
              <Text style={styles.statLabel}>Total Sesi</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✓</Text>
              <Text style={[styles.statNumber, { color: '#86EFAC' }]}>
                {sudahHadir}
              </Text>
              <Text style={styles.statLabel}>Sudah Hadir</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏳</Text>
              <Text style={[styles.statNumber, { color: '#FDE047' }]}>
                {belumHadir}
              </Text>
              <Text style={styles.statLabel}>Belum Hadir</Text>
            </View>
          </View>

          {/* Tombol Lakukan Presensi */}
          <TouchableOpacity
            style={styles.presensiActionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/praktikan/presensi')}
          >
            <View style={styles.presensiActionIcon}>
              <Text style={styles.presensiActionIconText}>📝</Text>
            </View>
            <View style={styles.presensiActionTextCol}>
              <Text style={styles.presensiActionTitle}>Lakukan Presensi</Text>
              <Text style={styles.presensiActionSub}>
                Cek sesi yang sedang berlangsung dan isi kehadiran sekarang
              </Text>
            </View>
            <Text style={styles.presensiActionArrow}>→</Text>
          </TouchableOpacity>

          {/* Jadwal terdekat */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Jadwal Terdekat</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/praktikan/jadwal')}
            >
              <Text style={styles.seeAll}>Lihat semua →</Text>
            </TouchableOpacity>
          </View>

          {jadwalTerdekat.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Belum Ada Jadwal</Text>
              <Text style={styles.emptyText}>
                Kamu belum memiliki jadwal praktikum mendatang.
              </Text>
            </View>
          ) : (
            jadwalTerdekat.map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.kode}</Text>
                  </View>

                  <Text style={styles.scheduleStatus}>{item.status}</Text>
                </View>

                <Text style={styles.scheduleName}>{item.mataPraktikum}</Text>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tanggal</Text>
                  <Text style={styles.infoValue}>
                    {item.hari}, {item.tanggal}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Waktu</Text>
                  <Text style={styles.infoValue}>{item.waktu}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ruangan</Text>
                  <Text style={styles.infoValue}>{item.ruangan}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Asisten</Text>
                  <Text style={styles.infoValue}>{item.asisten}</Text>
                </View>
              </View>
            ))
          )}
        </View>
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
    alignItems: 'center',
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 680,
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
    marginTop: 4,
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
    fontSize: 18,
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
    marginBottom: 24,
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
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#343941',
    borderRadius: 13,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#454B55',
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#B8BCC4',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  presensiActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34354A',
    borderWidth: 1,
    borderColor: '#625FF0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  presensiActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presensiActionIconText: {
    fontSize: 18,
  },
  presensiActionTextCol: {
    flex: 1,
  },
  presensiActionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  presensiActionSub: {
    color: '#B8BCC4',
    fontSize: 11,
  },
  presensiActionArrow: {
    color: '#A5A2FF',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '600',
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
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
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
});
