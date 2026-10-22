
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const jadwalDummy = [
  {
    id: 1,
    mataPraktikum: 'Praktikum Pemrograman Web',
    kode: 'IF204',
    tanggal: '22 Oktober 2026',
    hari: 'Kamis',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
    jumlahPraktikan: 25,
    kelas: 'Kelas A',
    status: 'Akan Datang',
  },
  {
    id: 2,
    mataPraktikum: 'Praktikum Basis Data',
    kode: 'IF206',
    tanggal: '23 Oktober 2026',
    hari: 'Jumat',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
    jumlahPraktikan: 20,
    kelas: 'Kelas B',
    status: 'Akan Datang',
  },
  {
    id: 3,
    mataPraktikum: 'Praktikum Algoritma',
    kode: 'IF202',
    tanggal: '26 Oktober 2026',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer 1',
    jumlahPraktikan: 30,
    kelas: 'Kelas A',
    status: 'Akan Datang',
  },
  {
    id: 4,
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kode: 'IF208',
    tanggal: '20 Oktober 2026',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
    jumlahPraktikan: 22,
    kelas: 'Kelas C',
    status: 'Selesai',
  },
];

export default function JadwalScreen() {
  const [filter, setFilter] = useState('Semua');

  const jadwalTampil = jadwalDummy.filter((item) =>
    filter === 'Semua' ? true : item.status === filter,
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {jadwalDummy.length}
            </Text>
            <Text style={styles.summaryLabel}>Total Jadwal</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {jadwalDummy.filter(
                (item) => item.status === 'Akan Datang',
              ).length}
            </Text>
            <Text style={styles.summaryLabel}>Akan Datang</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {jadwalDummy.filter(
                (item) => item.status === 'Selesai',
              ).length}
            </Text>
            <Text style={styles.summaryLabel}>Selesai</Text>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {['Semua', 'Akan Datang', 'Selesai'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterButton,
                filter === item && styles.filterActive,
              ]}
              onPress={() => setFilter(item)}
              activeOpacity={0.8}
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

        <Text style={styles.totalText}>
          {jadwalTampil.length} jadwal ditemukan
        </Text>

        {jadwalTampil.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.kode}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Selesai'
                    ? styles.statusSelesai
                    : styles.statusAkanDatang,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.subject}>{item.mataPraktikum}</Text>
            <Text style={styles.classText}>{item.kelas}</Text>

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
              <Text style={styles.infoLabel}>Jumlah Praktikan</Text>
              <Text style={styles.infoValue}>
                {item.jumlahPraktikan} orang
              </Text>
            </View>
          </View>
        ))}

        {jadwalTampil.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
            <Text style={styles.emptyText}>
              Belum ada jadwal untuk kategori ini.
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
    padding: 20,
    paddingBottom: 30,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#343941',
    borderRadius: 14,
    paddingVertical: 20,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#B8BCC4',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#505661',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#555B65',
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#625ff0',
    borderColor: '#625ff0',
  },
  filterText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  totalText: {
    color: '#B8BCC4',
    fontSize: 13,
    marginBottom: 12,
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
  statusAkanDatang: {
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
    color: '#B8BCC4',
    fontSize: 13,
    marginTop: 5,
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
