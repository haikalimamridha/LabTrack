import BackButton from "@/components/ui/backButton";
import { useRekapSesi, useSesi } from "@/context/SesiContext";
import { formatJam } from "@/data/sesi";
import { formatTanggal } from "@/services/sessionService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RekapPresensiScreen() {
  const { daftarSesi, loading: loadingSesi, error: errorSesi } = useSesi();

  const [sesiAktif, setSesiAktif] = useState<string | null>(null);
  const [dropdownSesiTerbuka, setDropdownSesiTerbuka] = useState(false);

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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#7928CA", "#512DA8", "#29215C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <BackButton />
          <Text style={styles.headerTitle}>Rekap Presensi</Text>
        </LinearGradient>

        {/* PILIH SESI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pilih Sesi Praktikum</Text>
        </View>

        <View style={styles.dropdownContainer}>
          {/* TOMBOL DROPDOWN */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.dropdownButton}
            onPress={() => setDropdownSesiTerbuka(!dropdownSesiTerbuka)}
          >
            <View style={styles.dropdownTextContainer}>
              <Text style={styles.dropdownTitle} numberOfLines={1}>
                {sesiTerpilih
                  ? `${sesiTerpilih.kode || `Kelas ${sesiTerpilih.kelas}`} · ${formatTanggal(sesiTerpilih.tanggal)}`
                  : "Pilih sesi praktikum"}
              </Text>

              <Text style={styles.dropdownSubtitle} numberOfLines={1}>
                {sesiTerpilih?.mataPraktikum || "Belum ada sesi dipilih"}
              </Text>
            </View>

            <MaterialCommunityIcons
              name={dropdownSesiTerbuka ? "chevron-up" : "chevron-down"}
              size={24}
              color="#B99AFF"
            />
          </TouchableOpacity>

          {/* DAFTAR DROPDOWN */}
          {dropdownSesiTerbuka && (
            <View style={styles.dropdownList}>
              {daftarSesi.map((sesi) => {
                const aktif = sesiTerpilih?.id === sesi.id;

                return (
                  <TouchableOpacity
                    key={sesi.id}
                    activeOpacity={0.8}
                    style={[
                      styles.dropdownItem,
                      aktif && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSesiAktif(sesi.id);
                      setDropdownSesiTerbuka(false);
                    }}
                  >
                    <View style={styles.dropdownTextContainer}>
                      <Text
                        style={[
                          styles.dropdownItemTitle,
                          aktif && styles.dropdownItemTextActive,
                        ]}
                      >
                        {sesi.kode || `Kelas ${sesi.kelas}`} ·{" "}
                        {formatTanggal(sesi.tanggal)}
                      </Text>

                      <Text
                        style={[
                          styles.dropdownItemSubtitle,
                          aktif && styles.dropdownItemTextActive,
                        ]}
                      >
                        {sesi.mataPraktikum}
                      </Text>
                    </View>

                    {aktif && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color="#B99AFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
    
          {/* Informasi Sesi */}
          {sesiTerpilih && (
            <View style={styles.summaryCard}>
    
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
    
            <Text style={styles.countText}>
              {daftarPresensi.length} / {peserta.length} hadir
            </Text>
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
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B35",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingBottom: 35,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },

  // Header
  header: {
    paddingTop: 35,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 18,
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#D8C9FF",
    marginTop: 7,
  },

  // Section
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 4,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  // Pilihan sesi
  sessionList: {
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  sessionButton: {
    width: 190,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#453B64",
    backgroundColor: "#302A4D",
  },


  sessionButtonActive: {
    backgroundColor: "#49358B",
    borderColor: "#9876E8",
  },

  sessionButtonText: {
    color: "#A9A2C7",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
  },

  sessionButtonTextActive: {
    color: "#FFFFFF",
  },

  sessionButtonSubtext: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // RINGKASAN SESI
  summaryCard: {
    backgroundColor: "#302A4D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#453B64",
    padding: 18,
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 28,
  },

  summaryLabel: {
    color: "#A9A2C7",
    fontSize: 12,
    fontWeight: "500",
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  summaryDetail: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#453B64",
    marginVertical: 18,
  },

  summaryBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  totalNumber: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 7,
  },

  // STATUS SESI
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontWeight: "700",
  },

  // HEADER DAFTAR
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 14,
  },
  countText: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // KARTU PRAKTIKAN
  attendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#302A4D",
    borderWidth: 1,
    borderColor: "#453B64",
    borderRadius: 17,
    padding: 14,
    marginHorizontal: 18,
    marginBottom: 11,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#49358B",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#D8C9FF",
    fontSize: 17,
    fontWeight: "bold",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  studentNim: {
    color: "#A9A2C7",
    fontSize: 11,
    marginTop: 5,
  },

  attendanceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#69D9A3",
  },

  attendanceStatusText: {
    color: "#69D9A3",
    fontSize: 10,
    fontWeight: "600",
  },

  statusDotBelum: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FBBF24",
  },

  attendanceStatusTextBelum: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "600",
  },

  // WAKTU PRESENSI
  timeContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  timeLabel: {
    color: "#A9A2C7",
    fontSize: 10,
  },

  timeValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 7,
  },

  // EMPTY STATE
  emptyCard: {
    backgroundColor: "#302A4D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#453B64",
    padding: 28,
    alignItems: "center",
    marginHorizontal: 18,
  },

  emptyIcon: {
    color: "#B99AFF",
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
    color: "#A9A2C7",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },
  dropdownContainer: {
    marginHorizontal: 18,
    marginTop: 10,
    zIndex: 10,
  },

  dropdownButton: {
    backgroundColor: "#302A4D",
    borderWidth: 1,
    borderColor: "#49415F",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  dropdownTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  dropdownSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },

  dropdownList: {
    backgroundColor: "#25213D",
    borderWidth: 1,
    borderColor: "#49415F",
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#453B64",
  },

  dropdownItemActive: {
    backgroundColor: "#393052",
  },

  dropdownItemTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  dropdownItemSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },

  dropdownItemTextActive: {
    color: "#B99AFF",
  },
});

