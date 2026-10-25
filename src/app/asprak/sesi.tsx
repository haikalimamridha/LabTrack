
import { useSesi } from '@/context/SesiContext';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const filters = [
  'Semua',
  'Sedang Berlangsung',
  'Belum Dibuka',
  'Selesai',
];

export default function SesiScreen() {
  const { daftarSesi: daftarSemuaSesi, bukaSesi, tutupSesi} = useSesi();

  const [filterAktif, setFilterAktif] = useState('Semua');

  const daftarSesi = daftarSemuaSesi.filter(
    (item) =>
      filterAktif === 'Semua' || item.status === filterAktif,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Filter Status */}
      <Text style={styles.sectionTitle}>Status Sesi</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => {
          const aktif = filterAktif === filter;

          return (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.7}
              style={[
                styles.filterButton,
                aktif && styles.filterButtonActive,
              ]}
              onPress={() => setFilterAktif(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  aktif && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Daftar Sesi */}
      {daftarSesi.length > 0 ? (
        daftarSesi.map((item) => (
          <View key={item.id} style={styles.sessionCard}>
            <View style={styles.cardTop}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>
                  {item.kode}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Belum Dibuka' &&
                    styles.statusBelum,
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

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tanggal</Text>
              <Text style={styles.detailValue}>
                {item.hari}, {item.tanggal}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Waktu</Text>
              <Text style={styles.detailValue}>
                {item.waktu}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ruangan</Text>
              <Text style={styles.detailValue}>
                {item.ruangan}
              </Text>
            </View>

            {/* Tombol Buka Sesi */}
            {item.status === 'Belum Dibuka' && (
              <TouchableOpacity
                style={styles.openSessionButton}
                activeOpacity={0.8}
                onPress={() => {
                  Alert.alert(
                    'Buka Sesi Praktikum',
                    `Apakah kamu yakin ingin membuka sesi ${item.mataPraktikum}?`,
                    [
                      {
                        text: 'Batal',
                        style: 'cancel',
                      },
                      {
                        text: 'Buka Sesi',
                        onPress: () => {
                          bukaSesi(item.id);

                          Alert.alert(
                            'Berhasil',
                            'Sesi praktikum berhasil dibuka.',
                          );
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.openSessionButtonText}>
                  Buka Sesi
                </Text>
              </TouchableOpacity>
            )}

            {/* Tombol Tutup Sesi */}
            {item.status === 'Sedang Berlangsung' && (
              <>
                <TouchableOpacity
                  style={styles.closeSessionButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    Alert.alert(
                      'Tutup Sesi Praktikum',
                      `Apakah kamu yakin ingin menutup sesi ${item.mataPraktikum}? Presensi sesi ini akan diakhiri.`,
                      [
                        {
                          text: 'Batal',
                          style: 'cancel',
                        },
                        {
                          text: 'Tutup Sesi',
                          style: 'destructive',
                          onPress: () => {
                            tutupSesi(item.id);

                            Alert.alert(
                              'Berhasil',
                              'Sesi praktikum berhasil ditutup.',
                            );
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.closeSessionButtonText}>
                    Tutup Sesi
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            Tidak ada sesi
          </Text>
          <Text style={styles.emptyDescription}>
            Belum ada sesi dengan status{' '}
            {filterAktif.toLowerCase()}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 28,
  },
  brand: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B8BCC4',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 18,
  },
  filterButton: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterButtonActive: {
    backgroundColor: '#45416F',
    borderColor: '#45416F',
  },
  filterText: {
    color: '#B8BCC4',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#C7C5FF',
  },
  sessionCard: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#C7C5FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusBelum: {
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
    fontWeight: '600',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  detailLabel: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
  openSessionButton: {
    backgroundColor: '#625ff0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  openSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  activeSessionInfo: {
    backgroundColor: '#164E63',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  activeSessionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 16,
    padding: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#B8BCC4',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  closeSessionButton: {
  backgroundColor: '#DC2626',
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: 'center',
  marginTop: 10,
  },

  closeSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
