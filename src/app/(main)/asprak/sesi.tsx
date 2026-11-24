import { useSesi } from "@/context/SesiContext";
import {
  formatTanggal,
  tanggalHari,
  waktuValid,
  type Sesi,
} from "@/services/sessionService";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

const filters = ["Semua", "Sedang Berlangsung", "Belum Dibuka", "Selesai"];

export default function SesiScreen() {
  const {
    daftarSesi: daftarSemuaSesi,
    loading,
    error,
    bukaSesi,
    tutupSesi,
    ubahSesi,
    hapusSesi,
  } = useSesi();

  const [filterAktif, setFilterAktif] = useState("Semua");
  const [sesiQR, setSesiQR] = useState<Sesi | null>(null);

  // Ubah sesi
  const [sesiUbah, setSesiUbah] = useState<Sesi | null>(null);
  const [formTanggal, setFormTanggal] = useState("");
  const [formWaktu, setFormWaktu] = useState("");
  const [formRuangan, setFormRuangan] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const bukaUbah = (item: Sesi) => {
    setSesiUbah(item);
    setFormTanggal(item.tanggal);
    setFormWaktu(`${item.waktuMulai} - ${item.waktuSelesai}`);
    setFormRuangan(item.labId);
    setFormError(null);
  };

  // Pilihan tanggal: tanggal sekarang + beberapa tanggal terdekat di hari yang sama.
  const pilihanTanggal = sesiUbah
    ? Array.from(
        new Set([sesiUbah.tanggal, ...tanggalHari(sesiUbah.hari)]),
      ).sort()
    : [];

  // Satu jadwal tidak boleh punya dua sesi di tanggal yang sama.
  const tanggalTerpakai = (t: string) =>
    !!sesiUbah?.scheduleId &&
    daftarSemuaSesi.some(
      (s) =>
        s.id !== sesiUbah.id &&
        s.scheduleId === sesiUbah.scheduleId &&
        s.tanggal === t,
    );

  const simpanUbah = async () => {
    if (!sesiUbah || menyimpan) return;

    const waktu = formWaktu.trim();
    const ruangan = formRuangan.trim();

    if (!formTanggal) {
      setFormError("Pilih tanggal terlebih dahulu.");
      return;
    }
    if (!waktuValid(waktu)) {
      setFormError(
        "Format waktu harus seperti 09.00 - 11.00 (selesai setelah mulai).",
      );
      return;
    }
    if (!ruangan) {
      setFormError("Ruangan wajib diisi.");
      return;
    }

    setMenyimpan(true);
    setFormError(null);
    const hasil = await ubahSesi(sesiUbah.id, {
      tanggal: formTanggal,
    });
    setMenyimpan(false);

    if (hasil.ok) setSesiUbah(null);
    else setFormError(hasil.pesan);
  };

  const konfirmasiHapus = (item: Sesi) => {
    const sudahDibuka = item.statusDb !== "draft";
    const nama = `${item.mataPraktikum} (Kelas ${item.kelas}), ${formatTanggal(item.tanggal)}`;

    Alert.alert(
      "Hapus Sesi Praktikum",
      sudahDibuka
        ? `Sesi ${nama} sudah pernah dibuka. Seluruh catatan presensinya ikut terhapus dan tidak bisa dikembalikan. Lanjutkan?`
        : `Hapus sesi ${nama}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const hasil = await hapusSesi(item.id);
            Alert.alert(hasil.ok ? "Berhasil" : "Gagal", hasil.pesan);
          },
        },
      ],
    );
  };

  const daftarSesi = daftarSemuaSesi.filter(
    (item) => filterAktif === "Semua" || item.status === filterAktif,
  );

  return (
    <>
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
                  style={[styles.filterText, aktif && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Daftar Sesi */}
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color="#A5A2FF" />
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Gagal memuat sesi</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
          </View>
        ) : daftarSesi.length > 0 ? (
          daftarSesi.map((item) => (
            <View key={item.id} style={styles.sessionCard}>
              <View style={styles.cardTop}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>
                    {item.kode || `Kelas ${item.kelas}`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Belum Dibuka" && styles.statusBelum,
                    item.status === "Sedang Berlangsung" &&
                      styles.statusBerlangsung,
                    item.status === "Selesai" && styles.statusSelesai,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.subject}>{item.mataPraktikum}</Text>

              <Text style={styles.classText}>Kelas {item.kelas}</Text>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal</Text>
                <Text style={styles.detailValue}>
                  {item.hari}, {formatTanggal(item.tanggal)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Waktu</Text>
                <Text style={styles.detailValue}>{item.waktuMulai} - {item.waktuSelesai}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ruangan</Text>
                <Text style={styles.detailValue}>{item.labId}</Text>
              </View>

              {/* Tombol Buka Sesi */}
              {item.status === "Belum Dibuka" && (
                <TouchableOpacity
                  style={styles.openSessionButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    Alert.alert(
                      "Buka Sesi Praktikum",
                      `Apakah kamu yakin ingin membuka sesi ${item.mataPraktikum}?`,
                      [
                        {
                          text: "Batal",
                          style: "cancel",
                        },
                        {
                          text: "Buka Sesi",
                          onPress: async () => {
                            const hasil = await bukaSesi(item.id);
                            Alert.alert(
                              hasil.ok ? "Berhasil" : "Gagal",
                              hasil.ok
                                ? "Sesi praktikum berhasil dibuka."
                                : hasil.pesan,
                            );
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.openSessionButtonText}>Buka Sesi</Text>
                </TouchableOpacity>
              )}

              {/* Tombol Tutup Sesi */}
              {item.status === "Sedang Berlangsung" && (
                <>
                  {/* Tombol Tampilkan QR */}
                  <TouchableOpacity
                    style={styles.qrButton}
                    activeOpacity={0.8}
                    onPress={() => setSesiQR(item)}
                  >
                    <Text style={styles.qrButtonText}>Tampilkan QR Presensi</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeSessionButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert(
                        "Tutup Sesi Praktikum",
                        `Apakah kamu yakin ingin menutup sesi ${item.mataPraktikum}? Presensi sesi ini akan diakhiri.`,
                        [
                          {
                            text: "Batal",
                            style: "cancel",
                          },
                          {
                            text: "Tutup Sesi",
                            style: "destructive",
                            onPress: async () => {
                              const hasil = await tutupSesi(item.id);
                              Alert.alert(
                                hasil.ok ? "Berhasil" : "Gagal",
                                hasil.ok
                                  ? "Sesi praktikum berhasil ditutup."
                                  : hasil.pesan,
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

              {/* Ubah & Hapus */}
              <View style={styles.cardActions}>
                {item.statusDb === "draft" && (
                  <TouchableOpacity
                    style={[styles.cardActionButton, styles.cardActionEdit]}
                    activeOpacity={0.8}
                    onPress={() => bukaUbah(item)}
                  >
                    <Text style={styles.cardActionText}>Ubah</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.cardActionButton, styles.cardActionDelete]}
                  activeOpacity={0.8}
                  onPress={() => konfirmasiHapus(item)}
                >
                  <Text style={styles.cardActionText}>Hapus</Text>
                </TouchableOpacity>
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

      {/* Form ubah sesi */}
      <Modal
        visible={sesiUbah !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSesiUbah(null)}
      >
        <View style={styles.ubahOverlay}>
          <View style={styles.ubahBox}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.ubahTitle}>Ubah Sesi</Text>
              <Text style={styles.ubahSubject}>
                {sesiUbah?.mataPraktikum} (Kelas {sesiUbah?.kelas})
              </Text>
              <Text style={styles.hintText}>
                Kelas dan mata praktikum tidak dapat diubah. Jika salah, hapus
                sesi lalu buat ulang dari tab Jadwal.
              </Text>

              <Text style={styles.fieldLabel}>Tanggal ({sesiUbah?.hari})</Text>
              <View style={styles.chipRow}>
                {pilihanTanggal.map((t) => {
                  const aktif = formTanggal === t;
                  const terpakai = tanggalTerpakai(t);
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.chip,
                        aktif && styles.chipActive,
                        terpakai && styles.chipDisabled,
                      ]}
                      activeOpacity={0.8}
                      disabled={terpakai}
                      onPress={() => setFormTanggal(t)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          aktif && styles.chipTextActive,
                        ]}
                      >
                        {formatTanggal(t)}
                        {terpakai ? " ✓" : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hintText}>
                Tanggal bertanda ✓ sudah dipakai sesi lain dari jadwal yang
                sama.
              </Text>

              <Text style={styles.fieldLabel}>Waktu</Text>
              <TextInput
                style={styles.input}
                value={formWaktu}
                onChangeText={setFormWaktu}
                placeholder="09.00 - 11.00"
                placeholderTextColor="#777E89"
              />

              <Text style={styles.fieldLabel}>Ruangan</Text>
              <TextInput
                style={styles.input}
                value={formRuangan}
                onChangeText={setFormRuangan}
                placeholder="Lab Komputer 1"
                placeholderTextColor="#777E89"
              />

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  disabled={menyimpan}
                  onPress={() => setSesiUbah(null)}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalConfirm,
                    menyimpan && styles.buttonDisabled,
                  ]}
                  disabled={menyimpan}
                  onPress={simpanUbah}
                >
                  <Text style={styles.modalConfirmText}>
                    {menyimpan ? "Menyimpan..." : "Simpan"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Modal QR Presensi */}
      <Modal
        visible={sesiQR !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSesiQR(null)}
      >
        <View style={styles.qrOverlay}>
          <View style={styles.qrBox}>
            <Text style={styles.qrTitle}>QR Presensi</Text>

            <Text style={styles.qrSubject}>
              {sesiQR?.mataPraktikum}
            </Text>

            <Text style={styles.qrClass}>
              Kelas {sesiQR?.kelas}
            </Text>

            {sesiQR && (
              <View style={styles.qrContainer}>
                <QRCode
                  value={sesiQR.id}
                  size={220}
                />
              </View>
            )}

            <Text style={styles.qrHint}>
              Praktikan dapat memindai QR Code ini
              untuk melakukan presensi.
            </Text>

            <TouchableOpacity
              style={styles.qrCloseButton}
              activeOpacity={0.8}
              onPress={() => setSesiQR(null)}
            >
              <Text style={styles.qrCloseButtonText}>
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  cardActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
  },
  cardActionEdit: {
    borderColor: "#555B65",
  },
  cardActionDelete: {
    borderColor: "#991B1B",
  },
  cardActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  ubahOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  ubahBox: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    backgroundColor: "#343941",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  ubahTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  ubahSubject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  fieldLabel: {
    color: "#B8BCC4",
    fontSize: 12,
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#25292e",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: "#45416F",
    borderColor: "#7772F5",
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    color: "#B8BCC4",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#25292e",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
  },
  errorText: {
    color: "#F87171",
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  hintText: {
    color: "#AEB4BE",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: "#555B65",
  },
  modalCancelText: {
    color: "#D1D5DB",
    fontWeight: "600",
  },
  modalConfirm: {
    backgroundColor: "#625ff0",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginBottom: 28,
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
    marginBottom: 12,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 18,
  },
  filterButton: {
    backgroundColor: "#343941",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterButtonActive: {
    backgroundColor: "#45416F",
    borderColor: "#45416F",
  },
  filterText: {
    color: "#B8BCC4",
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#C7C5FF",
  },
  sessionCard: {
    backgroundColor: "#343941",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },
  codeBadge: {
    backgroundColor: "#45416F",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codeText: {
    color: "#C7C5FF",
    fontSize: 11,
    fontWeight: "bold",
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusBelum: {
    backgroundColor: "#854D0E",
  },
  statusBerlangsung: {
    backgroundColor: "#164E63",
  },
  statusSelesai: {
    backgroundColor: "#4B5563",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  subject: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 24,
  },
  classText: {
    color: "#A5A2FF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#454B55",
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  detailLabel: {
    color: "#B8BCC4",
    fontSize: 12,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
    flexShrink: 1,
  },
  openSessionButton: {
    backgroundColor: "#625ff0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  openSessionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  activeSessionInfo: {
    backgroundColor: "#164E63",
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  activeSessionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#343941",
    borderWidth: 1,
    borderColor: "#454B55",
    borderRadius: 16,
    padding: 24,
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
    lineHeight: 18,
  },
  closeSessionButton: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },

  closeSessionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  qrButton: {
    backgroundColor: "#164E63",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },

  qrButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },

  qrOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  qrBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#343941",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#454B55",
  },

  qrTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  qrSubject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

  qrClass: {
    color: "#A5A2FF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 20,
  },

  qrContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  qrHint: {
    color: "#B8BCC4",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 18,
  },

  qrCloseButton: {
    width: "100%",
    backgroundColor: "#625ff0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  qrCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  }, 
});
