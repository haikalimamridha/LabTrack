import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePresensi } from '../../context/PresensiContext';

const filterJadwal = ['Semua', 'Sedang Berlangsung', 'Belum Dibuka', 'Selesai'];

export default function JadwalScreen() {
  const { daftarSesi } = usePresensi();
  const [filter, setFilter] = useState('Semua');

  const jadwalTampil = daftarSesi.filter((item) => {
    if (filter === 'Semua') return true;
    return item.status === filter;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>LABTRACK</Text>
            <Text style={styles.title}>Jadwal Praktikum (FR-12)</Text>
            <Text style={styles.subtitle}>
              Jadwal sesi dan laboratorium yang menjadi tanggung jawab Anda sebagai asisten.
            </Text>
          </View>

          {/* Filter jadwal */}
          <View style={styles.filterContainer}>
            {filterJadwal.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                style={[
                  styles.filterButton,
                  filter === item && styles.filterActive,
                ]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Jumlah jadwal */}
          <Text style={styles.totalText}>
            {jadwalTampil.length} jadwal sesi ditemukan
          </Text>

          {/* Daftar jadwal */}
          {jadwalTampil.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.kode}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Sedang Berlangsung'
                      ? styles.statusBerlangsung
                      : item.status === 'Selesai'
                      ? styles.statusSelesai
                      : styles.statusBelumDibuka,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.subject}>{item.mataPraktikum}</Text>
              <Text style={styles.classText}>
                Kelas {item.kelas} {item.modul ? `• ${item.modul}` : ''}
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal</Text>
                <Text style={styles.infoValue}>
                  {item.hari}, {item.tanggal}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Waktu</Text>
                <Text style={styles.infoValue}>{item.waktu} WIB</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ruangan</Text>
                <Text style={styles.infoValue}>{item.ruangan}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dosen Pengampu</Text>
                <Text style={styles.infoValue}>{item.dosen ?? '-'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Asisten Bertugas</Text>
                <Text style={styles.infoValue}>{item.asisten ?? '-'}</Text>
              </View>
            </View>
          ))}

          {/* Empty state */}
          {jadwalTampil.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
              <Text style={styles.emptyText}>
                Belum ada jadwal sesi dengan status {filter.toLowerCase()}.
              </Text>
            </View>
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
    marginBottom: 20,
  },
  brand: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#B8BCC4',
    fontSize: 13,
    lineHeight: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555B65',
    backgroundColor: '#343941',
  },
  filterActive: {
    backgroundColor: '#625ff0',
    borderColor: '#625ff0',
  },
  filterText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  totalText: {
    color: '#B8BCC4',
    fontSize: 13,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#343941',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusBelumDibuka: {
    backgroundColor: '#854D0E',
  },
  statusBerlangsung: {
    backgroundColor: '#164E63',
  },
  statusSelesai: {
    backgroundColor: '#166534',
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
    color: '#C7C5FF',
    fontSize: 12,
    marginTop: 4,
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
    marginBottom: 10,
    gap: 12,
  },
  infoLabel: {
    color: '#AEB4BE',
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#343941',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#B8BCC4',
    fontSize: 13,
    textAlign: 'center',
  },
});
