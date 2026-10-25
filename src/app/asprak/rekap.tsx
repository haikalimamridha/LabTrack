import { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { presensiDummy } from '@/data/presensiDummy';
import { sesiDummy } from '@/data/sesi';

export default function RekapPresensiScreen() {
  const [sesiAktif, setSesiAktif] = useState(
    sesiDummy[0]?.id,
  );

  const daftarPresensi = useMemo(
    () =>
      presensiDummy.filter(
        (item) => item.sesiId === sesiAktif,
      ),
    [sesiAktif],
  );

  const sesiTerpilih = sesiDummy.find(
    (item) => item.id === sesiAktif,
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Pilih Sesi */}
      <Text style={styles.sectionTitle}>
        Pilih Sesi Praktikum
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sessionList}
      >
        {sesiDummy.map((sesi) => {
          const aktif = sesiAktif === sesi.id;

          return (
            <TouchableOpacity
              key={sesi.id}
              activeOpacity={0.8}
              style={[
                styles.sessionButton,
                aktif && styles.sessionButtonActive,
              ]}
              onPress={() => setSesiAktif(sesi.id)}
            >
              <Text
                style={[
                  styles.sessionButtonText,
                  aktif && styles.sessionButtonTextActive,
                ]}
              >
                {sesi.kode}
              </Text>

              <Text
                style={[
                  styles.sessionButtonSubtext,
                  aktif && styles.sessionButtonTextActive,
                ]}
              >
                {sesi.mataPraktikum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Informasi Sesi */}
      {sesiTerpilih && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Sesi yang dipilih
          </Text>

          <Text style={styles.summaryTitle}>
            {sesiTerpilih.mataPraktikum}
          </Text>

          <Text style={styles.summaryDetail}>
            Kelas {sesiTerpilih.kelas}
          </Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottom}>
            <View>
              <Text style={styles.summaryLabel}>
                Total presensi
              </Text>

              <Text style={styles.totalNumber}>
                {daftarPresensi.length} praktikan
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                sesiTerpilih.status === 'Sedang Berlangsung'
                  ? styles.statusActive
                  : sesiTerpilih.status === 'Selesai'
                    ? styles.statusDone
                    : styles.statusWaiting,
              ]}
            >
              <Text style={styles.statusText}>
                {sesiTerpilih.status}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Daftar Praktikan */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Daftar Praktikan
        </Text>

        <Text style={styles.countText}>
          {daftarPresensi.length} hadir
        </Text>
      </View>

      {daftarPresensi.length > 0 ? (
        daftarPresensi.map((item, index) => (
          <View key={item.id} style={styles.attendanceCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.nama.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {item.nama}
              </Text>

              <Text style={styles.studentNim}>
                NIM: {item.nim}
              </Text>

              <View style={styles.attendanceStatus}>
                <View style={styles.statusDot} />

                <Text style={styles.attendanceStatusText}>
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>
                Waktu hadir
              </Text>

              <Text style={styles.timeValue}>
                {item.waktuPresensi}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>○</Text>

          <Text style={styles.emptyTitle}>
            Belum Ada Presensi
          </Text>

          <Text style={styles.emptyDescription}>
            Belum ada praktikan yang melakukan presensi
            pada sesi ini.
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
    marginBottom: 26,
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
  },
  sessionList: {
    gap: 10,
    paddingVertical: 14,
  },
  sessionButton: {
    width: 175,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#454B55',
    backgroundColor: '#343941',
  },
  sessionButtonActive: {
    backgroundColor: '#45416F',
    borderColor: '#7772F5',
  },
  sessionButtonText: {
    color: '#B8BCC4',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sessionButtonTextActive: {
    color: '#FFFFFF',
  },
  sessionButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#343941',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 16,
    marginBottom: 26,
  },
  summaryLabel: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
  },
  summaryDetail: {
    color: '#A5A2FF',
    fontSize: 12,
    marginTop: 5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 16,
  },
  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#164E63',
  },
  statusDone: {
    backgroundColor: '#374151',
  },
  statusWaiting: {
    backgroundColor: '#854D0E',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  countText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#C7C5FF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  studentNim: {
    color: '#B8BCC4',
    fontSize: 11,
    marginTop: 5,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  attendanceStatusText: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '600',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    color: '#B8BCC4',
    fontSize: 10,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: '#343941',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 26,
    alignItems: 'center',
  },
  emptyIcon: {
    color: '#A5A2FF',
    fontSize: 32,
    marginBottom: 12,
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
    lineHeight: 19,
  },
});
