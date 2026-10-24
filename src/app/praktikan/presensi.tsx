import { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { usePresensi } from "../../context/PresensiContext";
import { formatJam, Sesi } from "../../data/sesi";

type Toast = { pesan: string; ok: boolean } | null;

export default function PresensiScreen() {
  const { daftarSesi, riwayat, sudahPresensi, lakukanPresensi } = usePresensi();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [sesiDipilih, setSesiDipilih] = useState<Sesi | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tampilkanToast = (pesan: string, ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ pesan, ok });
    timerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const konfirmasi = () => {
    if (!sesiDipilih) return;
    const hasil = lakukanPresensi(sesiDipilih.id);
    setSesiDipilih(null);
    tampilkanToast(hasil.pesan, hasil.ok);
  };

  // Menentukan label & kondisi aktif tombol sesuai status sesi
  const getTombol = (sesi: Sesi) => {
    if (sudahPresensi(sesi.id))
      return { label: "Sudah Hadir ✓", aktif: false, hadir: true };
    if (sesi.status === "Belum Dibuka")
      return { label: "Sesi Belum Dibuka", aktif: false, hadir: false };
    if (sesi.status === "Selesai")
      return { label: "Sesi Telah Selesai", aktif: false, hadir: false };
    return { label: "Lakukan Presensi", aktif: true, hadir: false };
  };

  const getStatusStyle = (status: Sesi["status"]) => {
    if (status === "Sedang Berlangsung") return styles.statusBerlangsung;
    if (status === "Selesai") return styles.statusSelesai;
    return styles.statusBelum;
  };

  const sesiBuka = daftarSesi.filter(
    (s) => s.status === "Sedang Berlangsung",
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Ringkasan */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{daftarSesi.length}</Text>
              <Text style={styles.summaryLabel}>Total Sesi</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{sesiBuka}</Text>
              <Text style={styles.summaryLabel}>Sesi Dibuka</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{riwayat.length}</Text>
              <Text style={styles.summaryLabel}>Sudah Hadir</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Daftar Presensi</Text>

          {daftarSesi.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Belum ada sesi</Text>
              <Text style={styles.emptyText}>
                Sesi praktikum akan muncul di sini.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {daftarSesi.map((item) => {
                const tombol = getTombol(item);
                const catatan = riwayat.find((r) => r.sesiId === item.id);

                return (
                  <View
                    key={item.id}
                    style={[styles.card, isWide && styles.cardWide]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>
                          {item.kode} · Kelas {item.kelas}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          getStatusStyle(item.status),
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
                    {catatan && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Waktu hadir</Text>
                        <Text style={styles.infoValue}>
                          {formatJam(catatan.waktuHadir)}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.presensiButton,
                        !tombol.aktif && styles.buttonNonaktif,
                        tombol.hadir && styles.buttonHadir,
                      ]}
                      activeOpacity={0.8}
                      disabled={!tombol.aktif}
                      onPress={() => setSesiDipilih(item)}
                    >
                      <Text style={styles.presensiButtonText}>
                        {tombol.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast notifikasi */}
      {toast && (
        <View
          style={[
            styles.toast,
            toast.ok ? styles.toastSukses : styles.toastGagal,
          ]}
        >
          <Text style={styles.toastText}>
            {toast.ok ? "✓ " : "✕ "}
            {toast.pesan}
          </Text>
        </View>
      )}

      {/* Modal konfirmasi */}
      <Modal
        visible={sesiDipilih !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSesiDipilih(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Konfirmasi Presensi</Text>
            <Text style={styles.modalText}>
              Apakah kamu ingin melakukan presensi untuk
            </Text>
            <Text style={styles.modalSubject}>
              {sesiDipilih?.mataPraktikum} (Kelas {sesiDipilih?.kelas})?
            </Text>
            <Text style={styles.modalHint}>
              Waktu kehadiran akan dicatat saat kamu menekan Konfirmasi.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setSesiDipilih(null)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={konfirmasi}
              >
                <Text style={styles.modalConfirmText}>Konfirmasi</Text>
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
    backgroundColor: "#25292e",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  content: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#343941",
    borderRadius: 14,
    paddingVertical: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 11, color: "#B8BCC4", textAlign: "center" },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#505661" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "100%",
    backgroundColor: "#343941",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  cardWide: { width: "48.5%" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: "#45416F",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeText: { color: "#C7C5FF", fontSize: 12, fontWeight: "bold" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusBelum: { backgroundColor: "#854D0E" },
  statusBerlangsung: { backgroundColor: "#164E63" },
  statusSelesai: { backgroundColor: "#4B5563" },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  subject: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 24,
  },
  divider: { height: 1, backgroundColor: "#505661", marginVertical: 14 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  infoLabel: { color: "#AEB4BE", fontSize: 13, flex: 1 },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  presensiButton: {
    backgroundColor: "#625ff0",
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 8,
  },
  buttonNonaktif: { backgroundColor: "#4B5563" },
  buttonHadir: { backgroundColor: "#166534" },
  presensiButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },

  emptyContainer: { alignItems: "center", padding: 30 },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: { color: "#B8BCC4", fontSize: 13, textAlign: "center" },

  // Toast
  toast: {
    position: "absolute",
    top: 16,
    left: 20,
    right: 20,
    maxWidth: 500,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 10,
    elevation: 10,
  },
  toastSukses: { backgroundColor: "#166534" },
  toastGagal: { backgroundColor: "#991B1B" },
  toastText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#343941",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: { color: "#D1D5DB", fontSize: 14 },
  modalSubject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 12,
  },
  modalHint: { color: "#AEB4BE", fontSize: 12, marginBottom: 20 },
  modalActions: { flexDirection: "row", gap: 10 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  modalCancel: { borderWidth: 1, borderColor: "#555B65" },
  modalCancelText: { color: "#D1D5DB", fontWeight: "600" },
  modalConfirm: { backgroundColor: "#625ff0" },
  modalConfirmText: { color: "#FFFFFF", fontWeight: "bold" },
});
