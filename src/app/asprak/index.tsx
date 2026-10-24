
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { jadwalAsprakDummy } from '../../data/jadwalAsprakDummy';

export default function AsistenDashboard() {
  const router = useRouter();

  const { nama, nim, angkatan, jurusan } =
    useLocalSearchParams<{
      nama?: string;
      nim?: string;
      angkatan?: string;
      jurusan?: string;
    }>();

  const namaAsisten = nama ?? 'Asisten';
  const nimAsisten = nim ?? '-';
  const angkatanAsisten = angkatan ?? '-';
  const jurusanAsisten = jurusan ?? '-';

  const inisial = namaAsisten
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join('')
    .toUpperCase();

  const totalJadwal = jadwalAsprakDummy.length;

  const jadwalAkanDatang = jadwalAsprakDummy.filter(
    (item) => item.status === 'Akan Datang'
  ).length;

  const jadwalTerdekat = [...jadwalAsprakDummy]
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => {
      if (a.status === 'Berlangsung' && b.status !== 'Berlangsung') {
        return -1;
      }

      if (b.status === 'Berlangsung' && a.status !== 'Berlangsung') {
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>LABTRACK</Text>
            <Text style={styles.greeting}>
              Halo, {namaAsisten}!
            </Text>
            <Text style={styles.subtitle}>
              Siap mendampingi praktikum hari ini?
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
              {(namaAsisten || 'Asisten')
              .split(' ')
              .filter(Boolean)
              .map((kata) => kata.charAt(0))
              .join('')
              .toUpperCase()}
            </Text>
          </View>
 
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{namaAsisten}</Text>
            <Text style={styles.profileNim}>{nimAsisten}</Text>
            <Text style={styles.profileMajor}>
              {jurusanAsisten}
              {' · Angkatan '}
              {angkatanAsisten}
            </Text>
          </View>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Asisten</Text>
          </View>
        </View>


        {/* Ringkasan Jadwal */}
        <Text style={styles.sectionTitle}>Ringkasan Jadwal</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>▦</Text>
            </View>

            <Text style={styles.statValue}>{totalJadwal}</Text>
            <Text style={styles.statLabel}>Total Jadwal</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>◷</Text>
            </View>

            <Text style={styles.statValue}>{jadwalAkanDatang}</Text>
            <Text style={styles.statLabel}>Akan Datang</Text>
          </View>
        </View>

        {/* Jadwal Terdekat */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Jadwal Terdekat</Text>

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
                    item.status === 'Berlangsung'
                      ? styles.statusBerlangsung
                      : styles.statusBelumDibuka,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.subject}>
                {item.mataPraktikum}
              </Text>

              <Text style={styles.classText}>
                Kelas {item.kelas}
              </Text>

              <View style={styles.scheduleDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal</Text>
                <Text style={styles.infoValue}>
                  {item.hari}, {item.tanggal}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Waktu</Text>
                <Text style={styles.infoValue}>
                  {item.waktu}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ruangan</Text>
                <Text style={styles.infoValue}>
                  {item.ruangan}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Belum Ada Jadwal
            </Text>
            <Text style={styles.emptyText}>
              Kamu belum memiliki jadwal praktikum mendatang.
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
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
    marginBottom: 10,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 6,
  },

  subtitle: {
    color: '#A6ABB5',
    fontSize: 13,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 16,
    padding: 16,
  },

  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  statIcon: {
    color: '#D5D3FF',
    fontSize: 23,
    fontWeight: '600',
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },

  statLabel: {
    color: '#A6ABB5',
    fontSize: 12,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  codeBadge: {
    backgroundColor: '#45416F',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  codeText: {
    color: '#D5D3FF',
    fontSize: 11,
    fontWeight: '700',
  },

  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusBerlangsung: {
    backgroundColor: '#254D40',
  },

  statusBelumDibuka: {
    backgroundColor: '#45416F',
  },

  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  subject: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 5,
  },

  classText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '500',
  },

  scheduleDivider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
    borderRadius: 16,
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
});
