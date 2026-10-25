import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePresensi } from '../../context/PresensiContext';

export default function AsistenDashboard() {
  const router = useRouter();
  const { daftarSesi, resetSemuaData } = usePresensi();

  const { nama, nim, angkatan, jurusan } =
    useLocalSearchParams<{
      nama?: string;
      nim?: string;
      angkatan?: string;
      jurusan?: string;
    }>();

  const namaAsisten = nama ?? 'Bagas Saputra';
  const nimAsisten = nim ?? '24060122140004';
  const angkatanAsisten = angkatan ?? '2022';
  const jurusanAsisten = jurusan ?? 'Informatika';

  const inisial = namaAsisten
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join('')
    .toUpperCase();

  const totalSesi = daftarSesi.length;
  const sesiAktif = daftarSesi.filter(
    (item) => item.status === 'Sedang Berlangsung'
  ).length;
  const sesiBelumDibuka = daftarSesi.filter(
    (item) => item.status === 'Belum Dibuka'
  ).length;

  const jadwalTerdekat = [...daftarSesi]
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => {
      if (
        a.status === 'Sedang Berlangsung' &&
        b.status !== 'Sedang Berlangsung'
      ) {
        return -1;
      }
      if (
        b.status === 'Sedang Berlangsung' &&
        a.status !== 'Sedang Berlangsung'
      ) {
        return 1;
      }
      return 0;
    })
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
              <Text style={styles.logo}>LABTRACK</Text>
              <Text style={styles.greeting}>Halo, {namaAsisten}!</Text>
              <Text style={styles.subtitle}>
                Siap mendampingi praktikum hari ini?
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
              <Text style={styles.profileName}>{namaAsisten}</Text>
              <Text style={styles.profileNim}>{nimAsisten}</Text>
              <Text style={styles.profileMajor}>
                {jurusanAsisten} • Angkatan {angkatanAsisten}
              </Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Asisten</Text>
            </View>
          </View>

          {/* Ringkasan Sesi */}
          <Text style={styles.sectionTitle}>Ringkasan Sesi Praktikum</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📅</Text>
              </View>
              <Text style={styles.statValue}>{totalSesi}</Text>
              <Text style={styles.statLabel}>Total Sesi</Text>
            </View>

            <View style={[styles.statCard, sesiAktif > 0 && styles.statCardActive]}>
              <View
                style={[
                  styles.statIconContainer,
                  sesiAktif > 0 && styles.statIconContainerActive,
                ]}
              >
                <Text style={styles.statIcon}>⚡</Text>
              </View>
              <Text
                style={[
                  styles.statValue,
                  sesiAktif > 0 && { color: '#86EFAC' },
                ]}
              >
                {sesiAktif}
              </Text>
              <Text style={styles.statLabel}>Sedang Berlangsung</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⏳</Text>
              </View>
              <Text style={styles.statValue}>{sesiBelumDibuka}</Text>
              <Text style={styles.statLabel}>Belum Dibuka</Text>
            </View>
          </View>

          {/* Quick Actions Bar */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              activeOpacity={0.8}
              onPress={() => router.push('/asprak/sesi')}
            >
              <Text style={styles.actionBtnIcon}>⚙️</Text>
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnTitle}>Kelola Kontrol Sesi</Text>
                <Text style={styles.actionBtnSub}>
                  Buka & Tutup Sesi Praktikum (FR-13, FR-15)
                </Text>
              </View>
              <Text style={styles.actionBtnArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              activeOpacity={0.8}
              onPress={() => router.push('/asprak/riwayat')}
            >
              <Text style={styles.actionBtnIcon}>📋</Text>
              <View style={styles.actionBtnTextCol}>
                <Text style={styles.actionBtnTitle}>Lihat Rekap Presensi</Text>
                <Text style={styles.actionBtnSub}>
                  Waktu kehadiran praktikan & empty state (FR-14, FR-17)
                </Text>
              </View>
              <Text style={styles.actionBtnArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Jadwal Terdekat */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sesi Terdekat (FR-12)</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/asprak/jadwal')}
            >
              <Text style={styles.seeAll}>Lihat semua →</Text>
            </TouchableOpacity>
          </View>

          {jadwalTerdekat.length > 0 ? (
            jadwalTerdekat.map((item) => (
              <View key={item.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.kode}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'Sedang Berlangsung'
                        ? styles.statusBerlangsung
                        : styles.statusBelumDibuka,
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>

                <Text style={styles.subject}>{item.mataPraktikum}</Text>
                <Text style={styles.classText}>Kelas {item.kelas}</Text>

                <View style={styles.scheduleDivider} />

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
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
              <Text style={styles.emptyText}>
                Semua sesi praktikum telah selesai dilaksanakan.
              </Text>
            </View>
          )}

          {/* Reset Simulasi */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetSemuaData}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>↺ Reset Data Simulasi</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
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
  logo: {
    color: '#A5A2FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A6ABB5',
    fontSize: 13,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#1E3A33',
  },
  statIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statIconContainerActive: {
    backgroundColor: '#064E3B',
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#A6ABB5',
    fontSize: 11,
    textAlign: 'center',
  },
  quickActionsContainer: {
    gap: 10,
    marginBottom: 28,
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34354A',
    borderWidth: 1,
    borderColor: '#625FF0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  actionBtnIcon: {
    fontSize: 22,
  },
  actionBtnTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionBtnSub: {
    color: '#B8BCC4',
    fontSize: 11,
  },
  actionBtnArrow: {
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
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 14,
    padding: 16,
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
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  codeText: {
    color: '#D5D3FF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusBerlangsung: {
    backgroundColor: '#164E63',
  },
  statusBelumDibuka: {
    backgroundColor: '#854D0E',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  subject: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  classText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '500',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#A6ABB5',
    fontSize: 12,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  emptyContainer: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#A6ABB5',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#454B55',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#A6ABB5',
    fontSize: 12,
    fontWeight: '600',
  },
});
