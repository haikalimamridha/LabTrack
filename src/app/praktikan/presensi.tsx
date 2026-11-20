import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal, Pressable, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";

import { usePresensi } from "../../context/PresensiContext";
import { formatJam } from "../../data/sesi";
import { formatTanggal, type Sesi } from "../../services/sessionService";

type Toast = { pesan: string; ok: boolean } | null;
type StatusFilter = "Semua" | "Sedang Berlangsung" | "Belum Dibuka" | "Selesai";

export default function PresensiScreen() {
  const router = useRouter();
  const {
    daftarSesi,
    riwayat,
    loading,
    error,
    sudahPresensi,
    lakukanPresensi,
  } = usePresensi();

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [sesiDipilih, setSesiDipilih] = useState<Sesi | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [mengirim, setMengirim] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tampilkanToast = (pesan: string, ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ pesan, ok });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const konfirmasi = async () => {
    if (!sesiDipilih || mengirim) return;

    const sesi = sesiDipilih;
    setMengirim(true);

    try {
      const hasil = await lakukanPresensi(sesi.id);
      setSesiDipilih(null);
      tampilkanToast(hasil.pesan, hasil.ok);
    } catch {
      tampilkanToast("Terjadi kesalahan saat melakukan presensi.", false);
    } finally {
      setMengirim(false);
    }
  };

  const getTombol = (sesi: Sesi) => {
    if (sudahPresensi(sesi.id)) {
      return {
        label: "Sudah Hadir",
        aktif: false,
        hadir: true,
        icon: "check-circle-outline" as const,
      };
    }

    if (sesi.status === "Belum Dibuka") {
      return {
        label: "Belum Dibuka",
        aktif: false,
        hadir: false,
        icon: "lock-outline" as const,
      };
    }

    if (sesi.status === "Selesai") {
      return {
        label: "Sesi Selesai",
        aktif: false,
        hadir: false,
        icon: "calendar-check-outline" as const,
      };
    }

    return {
      label: "Lakukan Presensi",
      aktif: true,
      hadir: false,
      icon: "qrcode-scan" as const,
    };
  };

  const getStatusBadgeStyle = (status: Sesi["status"]) => {
    if (status === "Sedang Berlangsung") {
      return styles.statusBerlangsung;
    }

    if (status === "Selesai") {
      return styles.statusSelesai;
    }

    return styles.statusBelum;
  };

  const sesiBuka = daftarSesi.filter(
    (s) => s.status === "Sedang Berlangsung"
  ).length;

  const sesiTampil = useMemo(() => {
    if (statusFilter === "Semua") return daftarSesi;
    return daftarSesi.filter((s) => s.status === statusFilter);
  }, [daftarSesi, statusFilter]);

  const filterOptions: StatusFilter[] = [
    "Semua",
    "Sedang Berlangsung",
    "Belum Dibuka",
    "Selesai",
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        decelerationRate="normal"
      >
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/praktikan");
            }
          }}
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </Pressable>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Presensi</Text>
            <Text style={styles.headerSubtitle}>
              Catat dan pantau kehadiran praktikum kamu
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={15}
              color="#FFFFFF"
            />
            <Text style={styles.headerBadgeText}>
              {sesiBuka} Aktif
            </Text>
          </View>
        </View>

        {/* RINGKASAN */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{daftarSesi.length}</Text>
            <Text style={styles.summaryLabel}>Total Sesi</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {sesiBuka}
            </Text>
            <Text style={styles.summaryLabel}>Sesi Dibuka</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {riwayat.length}
            </Text>
            <Text style={styles.summaryLabel}>Sudah Hadir</Text>
          </View>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {filterOptions.map((opt) => {
            const active = statusFilter === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setStatusFilter(opt)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* DAFTAR PRESENSI */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Sesi</Text>
          {!loading && !error && (
            <Text style={styles.sectionCount}>
              {sesiTampil.length} sesi
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#9623D6" size="large" />
            <Text style={styles.stateText}>Memuat sesi praktikum...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={28}
                color="#FF6B7E"
              />
            </View>
            <Text style={styles.emptyTitle}>Gagal memuat sesi</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : sesiTampil.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={28}
                color="#B56DF0"
              />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada sesi</Text>
            <Text style={styles.stateText}>
              {statusFilter === "Semua"
                ? "Sesi praktikum akan muncul di sini."
                : `Belum ada sesi dengan status "${statusFilter}".`}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {sesiTampil.map((item, index) => {
              const tombol = getTombol(item);
              const catatan = riwayat.find((r) => r.sesiId === item.id);
              const statusStyle = getStatusBadgeStyle(item.status);

              return (
                <View
                  key={item.id}
                  style={[styles.card, isWide && styles.cardWide]}
                >
                  {/* Top Row */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.codePill}>
                      <Text style={styles.codeText}>
                        {item.kode || `SESI ${String(index + 1).padStart(2, "0")}`}
                      </Text>
                      <Text style={styles.classInline}>
                        · Kelas {item.kelas}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusBadgeStyle(item.status),
                      ]}
                    >
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Subject */}
                  <Text style={styles.subject} numberOfLines={2}>
                    {item.mataPraktikum}
                  </Text>

                  <View style={styles.divider} />

                  {/* Meta Info */}
                  <View style={styles.metaList}>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons
                        name="calendar-outline"
                        size={15}
                        color="#9C98B2"
                      />
                      <Text style={styles.metaText}>
                        {item.hari}, {formatTanggal(item.tanggal)}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={15}
                        color="#9C98B2"
                      />
                      <Text style={styles.metaText}>{item.waktu}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={15}
                        color="#9C98B2"
                      />
                      <Text style={styles.metaText}>{item.ruangan}</Text>
                    </View>

                    {catatan && (
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons
                          name="check-circle-outline"
                          size={15}
                          color="#6EE7B7"
                        />
                        <Text style={styles.metaText}>
                          Hadir pukul {formatJam(catatan.waktuHadir)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.presensiButton,
                      !tombol.aktif && styles.buttonNonaktif,
                    ]}
                    activeOpacity={0.85}
                    disabled={!tombol.aktif}
                    onPress={() => setSesiDipilih(item)}
                  >
                    <MaterialCommunityIcons
                      name={tombol.icon}
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text style={styles.presensiButtonText}>
                      {tombol.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* TOAST */}
      {toast && (
        <View
          style={[
            styles.toast,
            toast.ok ? styles.toastSukses : styles.toastGagal,
          ]}
        >
          <MaterialCommunityIcons
            name={
              toast.ok ? "check-circle-outline" : "alert-circle-outline"
            }
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>{toast.pesan}</Text>
        </View>
      )}

      {/* MODAL KONFIRMASI */}
      <Modal
        visible={sesiDipilih !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!mengirim) setSesiDipilih(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={26}
                color="#D5C2FF"
              />
            </View>

            <Text style={styles.modalTitle}>Konfirmasi Presensi</Text>

            <Text style={styles.modalText}>
              Apakah kamu ingin melakukan presensi untuk sesi berikut?
            </Text>

            <View style={styles.modalSubjectBox}>
              <Text style={styles.modalSubject}>
                {sesiDipilih?.mataPraktikum}
              </Text>
              <Text style={styles.modalClass}>
                Kelas {sesiDipilih?.kelas} · {sesiDipilih?.ruangan}
              </Text>
            </View>

            <Text style={styles.modalHint}>
              Waktu kehadiran akan dicatat saat kamu menekan Konfirmasi.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setSesiDipilih(null)}
                disabled={mengirim}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={konfirmasi}
                disabled={mengirim}
              >
                {mengirim ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Konfirmasi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B3A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 115,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: "#9C98B2",
    fontSize: 12,
    marginTop: 3,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2F2C44",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Summary Card */
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 18,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 3,
  },
  summaryLabel: {
    color: "#9C98B2",
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#423D5E",
  },

  /* Chips */
  chipsScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: "#2F2C44",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "#6D45B5",
  },
  chipText: {
    color: "#A6A2BA",
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionCount: {
    color: "#9C98B2",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Grid & Card */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "100%",
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardWide: {
    width: "48.6%",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  codePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3A3654",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
  },
  codeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  classInline: {
    color: "#A6A2BA",
    fontSize: 11,
    fontWeight: "500",
  },

  // Status
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBerlangsung: {
    backgroundColor: "#45405F",
  },

  statusSelesai: {
    backgroundColor: "#39354D",
  },

  statusBelum: {
    backgroundColor: "#39354D",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  subject: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#3F3A5C",
    marginVertical: 13,
  },
  metaList: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "#D8D5E6",
    fontSize: 12,
    flex: 1,
  },
  presensiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    backgroundColor: "#6D45B5",
    borderRadius: 12,
    marginTop: 16,
  },

  buttonNonaktif: {
    backgroundColor: "#45405F",
  },

  buttonHadir: {
    backgroundColor: "#6EE7B7",
  },

  presensiButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  /* States */
  stateCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#3A3654",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  stateText: {
    color: "#9C98B2",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },

  /* Toast */
  toast: {
    position: "absolute",
    top: 48,
    left: 20,
    right: 20,
    maxWidth: 500,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    zIndex: 20,
    elevation: 10,
  },
  toastSukses: {
    backgroundColor: "#1E3A34",
    borderWidth: 1,
    borderColor: "#2F6F5E",
  },
  toastGagal: {
    backgroundColor: "#4A222B",
    borderWidth: 1,
    borderColor: "#7A3443",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#2A2545",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#4A4370",
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#3A3654",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalConfirm: {
    backgroundColor: "#6D45B5",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalText: {
    color: "#B8B4C8",
    fontSize: 13,
    lineHeight: 20,
  },
  modalSubjectBox: {
    backgroundColor: "#3A3654",
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
    marginBottom: 12,
  },
  modalSubject: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  modalClass: {
    color: "#B8B4C8",
    fontSize: 12,
    marginTop: 4,
  },
  modalHint: {
    color: "#9C98B2",
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: "#524C75",
  },
  modalCancelText: {
    color: "#D8D5E6",
    fontWeight: "600",
    fontSize: 13,
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
});