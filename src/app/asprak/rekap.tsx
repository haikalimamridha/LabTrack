import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRekapSesi, useSesi } from "@/context/SesiContext";
import { formatJam } from "@/data/sesi";
import { formatTanggal } from "@/services/sessionService";

export default function RekapPresensiScreen() {
  const { daftarSesi, loading: loadingSesi, error: errorSesi } = useSesi();

  const [sesiAktif, setSesiAktif] = useState<string | null>(null);

  // Sebelum ada pilihan, otomatis memakai sesi pertama.
  const sesiTerpilih =
    daftarSesi.find((s) => s.id === sesiAktif) ?? daftarSesi[0] ?? null;

  // Rekap real-time: berubah sendiri saat praktikan melakukan presensi.
  const {
    kehadiran,
    peserta,
    belumHadir,
    loading: loadingRekap,
    error: errorRekap,
  } = useRekapSesi(sesiTerpilih);

  // Urut berdasarkan waktu hadir.
  const daftarPresensi = useMemo(
    () =>
      [...kehadiran].sort(
        (a, b) =>
          (a.waktu?.getTime() ?? Infinity) - (b.waktu?.getTime() ?? Infinity),
      ),
    [kehadiran],
  );

  if (loadingSesi) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#A5A2FF" />
      </View>
    );
  }

  if (errorSesi || daftarSesi.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {errorSesi ? "Gagal Memuat Sesi" : "Belum Ada Sesi"}
          </Text>
          <Text style={styles.emptyDescription}>
            {errorSesi ??
              "Buat sesi praktikum terlebih dahulu untuk melihat rekap."}
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Pilih Sesi */}
      <Text style={styles.sectionTitle}>Pilih Sesi Praktikum</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sessionList}
      >
        {daftarSesi.map((sesi) => {
          const aktif = sesiTerpilih?.id === sesi.id;

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
                {sesi.kode || `Kelas ${sesi.kelas}`} ·{" "}
                {formatTanggal(sesi.tanggal)}
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
          <Text style={styles.summaryLabel}>Sesi yang dipilih</Text>

          <Text style={styles.summaryTitle}>{sesiTerpilih.mataPraktikum}</Text>

          <Text style={styles.summaryDetail}>Kelas {sesiTerpilih.kelas}</Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottom}>
            <View>
              <Text style={styles.summaryLabel}>Total presensi</Text>

              <Text style={styles.totalNumber}>
                {daftarPresensi.length}
                {peserta.length > 0 ? ` dari ${peserta.length}` : ""} praktikan
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                sesiTerpilih.status === "Sedang Berlangsung"
                  ? styles.statusActive
                  : sesiTerpilih.status === "Selesai"
                    ? styles.statusDone
                    : styles.statusWaiting,
              ]}
            >
              <Text style={styles.statusText}>{sesiTerpilih.status}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Daftar Praktikan */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Daftar Praktikan</Text>

        <Text style={styles.countText}>{daftarPresensi.length} hadir</Text>
      </View>

      {loadingRekap ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#A5A2FF" />
        </View>
      ) : errorRekap ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Gagal Memuat Rekap</Text>
          <Text style={styles.emptyDescription}>{errorRekap}</Text>
        </View>
      ) : daftarPresensi.length > 0 ? (
        daftarPresensi.map((item) => (
          <View key={item.id} style={styles.attendanceCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.nama.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.nama}</Text>

              <Text style={styles.studentNim}>NIM: {item.nim}</Text>

              <View style={styles.attendanceStatus}>
                <View style={styles.statusDot} />

                <Text style={styles.attendanceStatusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Waktu hadir</Text>

              <Text style={styles.timeValue}>
                {item.waktu ? formatJam(item.waktu.toISOString()) : "-"}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>○</Text>

          <Text style={styles.emptyTitle}>Belum Ada Presensi</Text>

          <Text style={styles.emptyDescription}>
            Belum ada praktikan yang melakukan presensi pada sesi ini.
          </Text>
        </View>
      )}

      {/* Praktikan yang belum hadir (hanya setelah sesi dibuka) */}
      {!loadingRekap &&
        !errorRekap &&
        sesiTerpilih?.statusDb !== "draft" &&
        belumHadir.length > 0 && (
          <>
            <View style={[styles.listHeader, { marginTop: 14 }]}>
              <Text style={styles.sectionTitle}>Belum Hadir</Text>

              <Text style={styles.countText}>
                {belumHadir.length} praktikan
              </Text>
            </View>

            {belumHadir.map((p) => (
              <View key={p.uid} style={styles.attendanceCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {p.nama.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{p.nama}</Text>

                  <Text style={styles.studentNim}>NIM: {p.nim}</Text>

                  <View style={styles.attendanceStatus}>
                    <View style={styles.statusDotBelum} />

                    <Text style={styles.attendanceStatusTextBelum}>
                      Belum hadir
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  statusDotBelum: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
  },
  attendanceStatusTextBelum: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#25292e",
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
    color: "#A5A2FF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8BCC4",
    fontSize: 13,
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
    borderColor: "#454B55",
    backgroundColor: "#343941",
  },
  sessionButtonActive: {
    backgroundColor: "#45416F",
    borderColor: "#7772F5",
  },
  sessionButtonText: {
    color: "#B8BCC4",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  sessionButtonTextActive: {
    color: "#FFFFFF",
  },
  sessionButtonSubtext: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#343941",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#454B55",
    padding: 16,
    marginBottom: 26,
  },
  summaryLabel: {
    color: "#B8BCC4",
    fontSize: 12,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 8,
  },
  summaryDetail: {
    color: "#A5A2FF",
    fontSize: 12,
    marginTop: 5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#454B55",
    marginVertical: 16,
  },
  summaryBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  totalNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: "#164E63",
  },
  statusDone: {
    backgroundColor: "#374151",
  },
  statusWaiting: {
    backgroundColor: "#854D0E",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  countText: {
    color: "#A5A2FF",
    fontSize: 12,
    fontWeight: "600",
  },
  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#343941",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#45416F",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#C7C5FF",
    fontSize: 17,
    fontWeight: "bold",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  studentNim: {
    color: "#B8BCC4",
    fontSize: 11,
    marginTop: 5,
  },
  attendanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  attendanceStatusText: {
    color: "#4ADE80",
    fontSize: 10,
    fontWeight: "600",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timeLabel: {
    color: "#B8BCC4",
    fontSize: 10,
  },
  timeValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#343941",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#454B55",
    padding: 26,
    alignItems: "center",
  },
  emptyIcon: {
    color: "#A5A2FF",
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#B8BCC4",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },
});
