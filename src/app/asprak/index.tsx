import { useSesi } from '@/context/SesiContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { sesiDummy } from '../../data/sesi';

const namaBulan: Record<string, number> = {
  Januari: 0,
  Februari: 1,
  Maret: 2,
  April: 3,
  Mei: 4,
  Juni: 5,
  Juli: 6,
  Agustus: 7,
  September: 8,
  Oktober: 9,
  November: 10,
  Desember: 11,
};

function waktuSesi(item: (typeof sesiDummy)[number]): number {
  const bagianTanggal = item.tanggal.trim().split(/\s+/);
  const tanggal = Number(bagianTanggal[0]);
  const bulan = namaBulan[bagianTanggal[1]];
  const tahun = Number(bagianTanggal[2]);

  const jamMulai = item.waktu.split('-')[0].trim();
  const [jam, menit] = jamMulai.split('.').map(Number);

  if (
    !tanggal ||
    bulan === undefined ||
    !tahun ||
    Number.isNaN(jam) ||
    Number.isNaN(menit)
  ) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(tahun, bulan, tanggal, jam, menit).getTime();
}

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

  const sekarang = Date.now();

  const sesiMendatang = sesiDummy
    .filter(
      (item) =>
        item.status === 'Belum Dibuka' &&
        waktuSesi(item) >= sekarang,
    )
    .sort((a, b) => waktuSesi(a) - waktuSesi(b));

  const sesiTerdekat = [...sesiDummy]
    .filter(
      (item) =>
        item.status === 'Sedang Berlangsung' ||
        (item.status === 'Belum Dibuka' &&
          waktuSesi(item) >= sekarang),
    )
    .sort((a, b) => waktuSesi(a) - waktuSesi(b))
    .slice(0, 2);

  const { daftarSesi } = useSesi();

  const totalSesi = daftarSesi.length;

  const totalSesiMendatang = daftarSesi.filter(
    (item) => item.status === 'Belum Dibuka',
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.logo}>LABTRACK</Text>
            <Text style={styles.greeting}>
              Halo, {namaAsisten}!
            </Text>
            <Text style={styles.subtitle}>
              Siap mendampingi praktikum hari ini?
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {inisial || 'A'}
            </Text>
          </View>
        </View>

        {/* Identitas pengguna */}
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {inisial || 'A'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {namaAsisten}
            </Text>
            <Text style={styles.profileNim}>
              {nimAsisten}
            </Text>
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

        {/* Ringkasan Sesi */}
        <Text style={styles.sectionTitle}>
          Ringkasan Sesi
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>▦</Text>
            </View>

            <Text style={styles.statValue}>
              {totalSesi}
            </Text>
            <Text style={styles.statLabel}>
              Total Sesi
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>◷</Text>
            </View>

            <Text style={styles.statValue}>
              {totalSesiMendatang}
            </Text>
            <Text style={styles.statLabel}>
              Sesi Mendatang
            </Text>
          </View>
        </View>

        {/* Sesi Terdekat */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Sesi Terdekat
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/asprak/sesi')}
          >
            <Text style={styles.seeAll}>
              Lihat semua →
            </Text>
          </TouchableOpacity>
        </View>

        {sesiTerdekat.length > 0 ? (
          sesiTerdekat.map((item) => (
            <View
              key={item.id}
              style={styles.scheduleCard}
            >
              <View style={styles.scheduleHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>
                    {item.kode}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Belum Dibuka' &&
                      styles.statusBelumDibuka,
                    item.status === 'Sedang Berlangsung' &&
                      styles.statusBerlangsung,
                    item.status === 'Selesai' &&
                      styles.statusSelesai,
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
                <Text style={styles.infoLabel}>
                  Tanggal
                </Text>
                <Text style={styles.infoValue}>
                  {item.hari}, {item.tanggal}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Waktu
                </Text>
                <Text style={styles.infoValue}>
                  {item.waktu}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Ruangan
                </Text>
                <Text style={styles.infoValue}>
                  {item.ruangan}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              Belum Ada Sesi
            </Text>
            <Text style={styles.emptyText}>
              Tidak ada sesi mendatang atau sesi yang sedang berlangsung.
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
  headerInfo: {
    flex: 1,
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
    gap: 8,
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
  statusBelumDibuka: {
    backgroundColor: '#854D0E',
  },
  statusBerlangsung: {
    backgroundColor: '#164E63',
  },
  statusSelesai: {
    backgroundColor: '#4B5563',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  subject: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  classText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
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