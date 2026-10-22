
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const presensiDummy = [
  {
    id: 1,
    mataPraktikum: 'Praktikum Pemrograman Web',
    kode: 'IF204',
    tanggal: '22 Oktober 2026',
    hari: 'Kamis',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
    status: 'Belum Hadir',
  },
  {
    id: 2,
    mataPraktikum: 'Praktikum Basis Data',
    kode: 'IF206',
    tanggal: '23 Oktober 2026',
    hari: 'Jumat',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
    status: 'Belum Hadir',
  },
  {
    id: 3,
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kode: 'IF208',
    tanggal: '20 Oktober 2026',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
    status: 'Hadir',
  },
];

export default function PresensiScreen() {
  const [dataPresensi, setDataPresensi] = useState(presensiDummy);

  const lakukanPresensi = (id: number) => {
    const jadwal = dataPresensi.find((item) => item.id === id);

    if (!jadwal || jadwal.status !== 'Belum Hadir') {
      return;
    }

    Alert.alert(
      'Konfirmasi Presensi',
      `Apakah kamu ingin melakukan presensi untuk ${jadwal.mataPraktikum}?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Konfirmasi',
          onPress: () => {
            setDataPresensi((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, status: 'Hadir' }
                  : item,
              ),
            );

            Alert.alert('Berhasil', 'Presensi berhasil dilakukan.');
          },
        },
      ],
    );
  };

  const totalHadir = dataPresensi.filter(
    (item) => item.status === 'Hadir',
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {dataPresensi.length}
            </Text>
            <Text style={styles.summaryLabel}>Total Jadwal</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{totalHadir}</Text>
            <Text style={styles.summaryLabel}>Sudah Hadir</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {dataPresensi.length - totalHadir}
            </Text>
            <Text style={styles.summaryLabel}>Belum Hadir</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daftar Presensi</Text>

        {dataPresensi.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.kode}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Hadir'
                    ? styles.statusHadir
                    : styles.statusBelum,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.subject}>{item.mataPraktikum}</Text>

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

            <TouchableOpacity
              style={[
                styles.presensiButton,
                item.status === 'Hadir' && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              disabled={item.status === 'Hadir'}
              onPress={() => lakukanPresensi(item.id)}
            >
              <Text style={styles.presensiButtonText}>
                {item.status === 'Hadir'
                  ? 'Presensi Selesai'
                  : 'Lakukan Presensi'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
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
    marginBottom: 26,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusHadir: {
    backgroundColor: '#166534',
  },
  statusBelum: {
    backgroundColor: '#854D0E',
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
  presensiButton: {
    backgroundColor: '#625ff0',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#166534',
  },
  presensiButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
