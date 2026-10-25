
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { jadwalAsprakDummy } from '../../data/jadwalAsprakDummy';

const filters = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai'];

export default function SesiScreen() {
  const [filterAktif, setFilterAktif] = useState('Semua');

  const daftarSesi = jadwalAsprakDummy.filter(
    (item) => filterAktif === 'Semua' || item.status === filterAktif
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>LABTRACK</Text>
        <Text style={styles.title}>Daftar Sesi</Text>
        <Text style={styles.subtitle}>
          Lihat informasi sesi praktikum yang kamu dampingi.
        </Text>
      </View>

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
            <View
              key={filter}
              style={[
                styles.filterButton,
                aktif && styles.filterButtonActive,
              ]}
              onTouchEnd={() => setFilterAktif(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  aktif && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Daftar Sesi */}
      {daftarSesi.length > 0 ? (
        daftarSesi.map((item) => (
          <View key={item.id} style={styles.sessionCard}>
            <View style={styles.cardTop}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.kode}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Berlangsung' &&
                    styles.statusOngoing,
                  item.status === 'Akan Datang' &&
                    styles.statusUpcoming,
                  item.status === 'Selesai' &&
                    styles.statusDone,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.sessionName}>
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
              <Text style={styles.detailValue}>{item.waktu}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ruangan</Text>
              <Text style={styles.detailValue}>{item.ruangan}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Tidak ada sesi</Text>
          <Text style={styles.emptyDescription}>
            Belum ada sesi dengan status {filterAktif.toLowerCase()}.
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
    backgroundColor: '#454B55',
  },
  statusOngoing: {
    backgroundColor: '#45416F',
  },
  statusUpcoming: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#A5A2FF',
  },
  statusDone: {
    backgroundColor: '#454B55',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  sessionName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 6,
  },
  classText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '600',
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
});
