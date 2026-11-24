import BackButton from "@/components/ui/backButton";
import { useSesi } from "@/context/SesiContext";
import {
  formatTanggal,
  tanggalHari,
  type Sesi,
} from "@/services/sessionService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

  // Form ubah sesi
  const [sesiUbah, setSesiUbah] = useState<Sesi | null>(null);
  const [formTanggal, setFormTanggal] = useState("");
  const [formWaktuMulai, setFormWaktuMulai] = useState("");
  const [formWaktuSelesai, setFormWaktuSelesai] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // ================================================================
  // RINGKASAN
  // ================================================================

  const jumlahSemua = daftarSemuaSesi.length;

  const jumlahBerlangsung = daftarSemuaSesi.filter(
    (item) => item.statusDb === "open",
  ).length;

  const jumlahBelumDibuka = daftarSemuaSesi.filter(
    (item) => item.statusDb === "draft",
  ).length;

  const jumlahSelesai = daftarSemuaSesi.filter(
    (item) => item.statusDb === "closed",
  ).length;

  // ================================================================
  // FILTER SESI
  // ================================================================

  const daftarSesi = daftarSemuaSesi.filter(
    (item) => filterAktif === "Semua" || item.status === filterAktif,
  );

  // ================================================================
  // UBAH SESI
  // ================================================================

  const bukaUbah = (item: Sesi) => {
    setSesiUbah(item);
    setFormTanggal(item.tanggal);
    setFormWaktuMulai(item.waktuMulai);
    setFormWaktuSelesai(item.waktuSelesai);
    setFormError(null);
  };

  const tutupModalUbah = () => {
    if (menyimpan) return;

    setSesiUbah(null);
    setFormError(null);
  };

  // Pilihan tanggal pada hari yang sama
  const pilihanTanggal = sesiUbah
    ? Array.from(
        new Set([sesiUbah.tanggal, ...tanggalHari(sesiUbah.hari)]),
      ).sort()
    : [];

  // Mencegah dua sesi dari jadwal yang sama pada tanggal yang sama
  const tanggalTerpakai = (tanggal: string) =>
    !!sesiUbah?.scheduleId &&
    daftarSemuaSesi.some(
      (s) =>
        s.id !== sesiUbah.id &&
        s.scheduleId === sesiUbah.scheduleId &&
        s.tanggal === tanggal,
    );

  // Validasi format HH:mm
  const waktuKeMenit = (waktu: string) => {
    const cocok = waktu.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

    if (!cocok) return null;

    return Number(cocok[1]) * 60 + Number(cocok[2]);
  };

  const simpanUbah = async () => {
    if (!sesiUbah || menyimpan) return;

    const mulai = formWaktuMulai.trim();
    const selesai = formWaktuSelesai.trim();

    if (!formTanggal) {
      setFormError("Pilih tanggal terlebih dahulu.");
      return;
    }

    if (tanggalTerpakai(formTanggal)) {
      setFormError("Tanggal tersebut sudah digunakan oleh sesi lain.");
      return;
    }

    const menitMulai = waktuKeMenit(mulai);
    const menitSelesai = waktuKeMenit(selesai);

    if (menitMulai === null || menitSelesai === null) {
      setFormError("Format waktu harus menggunakan HH:mm, contoh 09:00.");
      return;
    }

    if (menitSelesai <= menitMulai) {
      setFormError("Waktu selesai harus lebih besar dari waktu mulai.");
      return;
    }

    setMenyimpan(true);
    setFormError(null);

    try {
      const hasil = await ubahSesi(sesiUbah.id, {
        tanggal: formTanggal,
        waktuMulai: mulai,
        waktuSelesai: selesai,
      });

      if (hasil.ok) {
        setSesiUbah(null);
      } else {
        setFormError(hasil.pesan);
      }
    } catch (e) {
      console.error("Gagal mengubah sesi:", e);
      setFormError("Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setMenyimpan(false);
    }
  };

  // ================================================================
  // HAPUS SESI
  // ================================================================

  const konfirmasiHapus = (item: Sesi) => {
    const sudahDibuka = item.statusDb !== "draft";

    const nama = `${item.mataPraktikum} (Kelas ${item.kelas}), ${formatTanggal(item.tanggal)}`;

    Alert.alert(
      "Hapus Sesi Praktikum",
      sudahDibuka
        ? `Sesi ${nama} sudah pernah dibuka. Seluruh catatan presensinya ikut terhapus dan tidak bisa dikembalikan. Lanjutkan?`
        : `Hapus sesi ${nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const hasil = await hapusSesi(item.id);
              Alert.alert(hasil.ok ? "Berhasil" : "Gagal", hasil.pesan);
            } catch (e) {
              console.error("Gagal menghapus sesi:", e);
              Alert.alert("Gagal", "Terjadi kesalahan saat menghapus sesi.");
            }
          },
        },
      ],
    );
  };

  // ================================================================
  // BUKA SESI
  // ================================================================

  const konfirmasiBuka = (item: Sesi) => {
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
            try {
              const hasil = await bukaSesi(item.id);

              Alert.alert(
                hasil.ok ? "Berhasil" : "Gagal",
                hasil.ok ? "Sesi praktikum berhasil dibuka." : hasil.pesan,
              );
            } catch (e) {
              console.error("Gagal membuka sesi:", e);
              Alert.alert("Gagal", "Terjadi kesalahan saat membuka sesi.");
            }
          },
        },
      ],
    );
  };

  // ================================================================
  // TUTUP SESI
  // ================================================================

  const konfirmasiTutup = (item: Sesi) => {
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
            try {
              const hasil = await tutupSesi(item.id);

              Alert.alert(
                hasil.ok ? "Berhasil" : "Gagal",
                hasil.ok ? "Sesi praktikum berhasil ditutup." : hasil.pesan,
              );
            } catch (e) {
              console.error("Gagal menutup sesi:", e);
              Alert.alert("Gagal", "Terjadi kesalahan saat menutup sesi.");
            }
          },
        },
      ],
    );
  };

  // ================================================================
  // TAMPILAN
  // ================================================================

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#7928CA", "#512DA8", "#29215C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <BackButton />
          <Text style={styles.title}>Sesi Praktikum</Text>
        </LinearGradient>

        {/* Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Daftar Sesi</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((filter) => {
              const aktif = filterAktif === filter;

              const jumlah =
                filter === "Semua"
                  ? jumlahSemua
                  : filter === "Sedang Berlangsung"
                    ? jumlahBerlangsung
                    : filter === "Belum Dibuka"
                      ? jumlahBelumDibuka
                      : jumlahSelesai;

              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.8}
                  style={[
                    styles.filterButton,
                    aktif && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterAktif(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      aktif && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>

                  <View
                    style={[
                      styles.filterCount,
                      aktif && styles.filterCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        aktif && styles.filterCountTextActive,
                      ]}
                    >
                      {jumlah}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Daftar Sesi */}
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#B99AFF" />
            <Text style={styles.loadingText}>Memuat data sesi...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Gagal memuat sesi</Text>
            <Text style={styles.emptyDescription}>{error}</Text>
          </View>
        ) : daftarSesi.length > 0 ? (
          daftarSesi.map((item) => (
            <View key={item.id} style={styles.sessionCard}>
              {/* Bagian atas kartu */}
              <View style={styles.cardTop}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>
                    {item.kode || `Kelas ${item.kelas}`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.statusDb === "draft" && styles.statusBelum,
                    item.statusDb === "open" && styles.statusBerlangsung,
                    item.statusDb === "closed" && styles.statusSelesai,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      item.statusDb === "draft" && styles.dotBelum,
                      item.statusDb === "open" && styles.dotBerlangsung,
                      item.statusDb === "closed" && styles.dotSelesai,
                    ]}
                  />

                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {/* Informasi praktikum */}
              <Text style={styles.subject}>{item.mataPraktikum}</Text>

              <View style={styles.divider} />

              {/* Detail sesi */}
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>TANGGAL</Text>
                  <Text style={styles.infoValue}>
                    {item.hari}, {formatTanggal(item.tanggal)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>WAKTU</Text>
                  <Text style={styles.infoValue}>
                    {item.waktuMulai} - {item.waktuSelesai}
                  </Text>
                </View>
              </View>

              {/* Tombol Buka */}
              {item.statusDb === "draft" && (
                <TouchableOpacity
                  style={styles.openSessionButton}
                  activeOpacity={0.8}
                  onPress={() => konfirmasiBuka(item)}
                >
                  <LinearGradient
                    colors={["#7651C9", "#49358B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.openSessionGradient}
                  >
                    <Text style={styles.openSessionButtonText}>
                      Buka Sesi Praktikum
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {/* Tombol Tampilkan QR (fitur presensi-qr) */}
              {item.statusDb === "open" && (
                <TouchableOpacity
                  style={styles.qrButton}
                  activeOpacity={0.8}
                  onPress={() => setSesiQR(item)}
                >
                  <Text style={styles.qrButtonText}>Tampilkan QR Presensi</Text>
                </TouchableOpacity>
              )}

              {/* ACTION */}
              <View style={styles.actionRow}>
                {item.statusDb === "draft" && (
                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={() => bukaUbah(item)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={17}
                      color="#B99AFF"
                    />
                    <Text style={styles.editButtonText}>Ubah</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    item.statusDb !== "draft" && styles.deleteFull,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => konfirmasiHapus(item)}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={17}
                    color="#F18A8A"
                  />
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>

              {/* Tombol Tutup */}
              {item.statusDb === "open" && (
                <TouchableOpacity
                  style={styles.closeSessionButton}
                  activeOpacity={0.8}
                  onPress={() => konfirmasiTutup(item)}
                >
                  <LinearGradient
                    colors={["#c95151", "#8b3535"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.openSessionGradient}
                  >
                    <Text style={styles.closeSessionButtonText}>
                      Tutup Sesi Praktikum
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Tidak ada sesi</Text>

            <Text style={styles.emptyDescription}>
              {filterAktif === "Semua"
                ? "Belum ada sesi praktikum yang dibuat."
                : `Belum ada sesi dengan status ${filterAktif.toLowerCase()}.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ============================================================ */}
      {/* MODAL UBAH SESI */}
      {/* ============================================================ */}

      <Modal
        visible={sesiUbah !== null}
        transparent
        animationType="fade"
        onRequestClose={tutupModalUbah}
      >
        <View style={styles.ubahOverlay}>
          <View style={styles.ubahBox}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Text style={styles.modalIconText}>✎</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={tutupModalUbah}
                  disabled={menyimpan}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.ubahTitle}>Ubah Sesi</Text>

              <Text style={styles.ubahSubject}>{sesiUbah?.mataPraktikum}</Text>

              <Text style={styles.ubahClass}>Kelas {sesiUbah?.kelas}</Text>

              <Text style={styles.hintText}>
                Kelas, mata praktikum, dan laboratorium mengikuti jadwal asal.
                Kamu hanya dapat mengubah tanggal dan waktu sesi.
              </Text>

              {/* Pilihan Tanggal */}
              <Text style={styles.fieldLabel}>Tanggal Pertemuan</Text>

              <View style={styles.chipRow}>
                {pilihanTanggal.map((tanggal) => {
                  const aktif = formTanggal === tanggal;
                  const terpakai = tanggalTerpakai(tanggal);

                  return (
                    <TouchableOpacity
                      key={tanggal}
                      style={[
                        styles.chip,
                        aktif && styles.chipActive,
                        terpakai && styles.chipDisabled,
                      ]}
                      activeOpacity={0.8}
                      disabled={terpakai || menyimpan}
                      onPress={() => {
                        setFormTanggal(tanggal);
                        setFormError(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          aktif && styles.chipTextActive,
                        ]}
                      >
                        {formatTanggal(tanggal)}
                        {terpakai ? " ✓" : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.hintText}>
                Tanggal bertanda centang sudah digunakan oleh sesi lain dari
                jadwal yang sama.
              </Text>

              {/* Waktu Mulai */}
              <Text style={styles.fieldLabel}>Waktu Mulai</Text>

              <TextInput
                style={styles.input}
                value={formWaktuMulai}
                onChangeText={(value) => {
                  setFormWaktuMulai(value);
                  setFormError(null);
                }}
                placeholder="Contoh: 09:00"
                placeholderTextColor="#88819F"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                editable={!menyimpan}
              />

              {/* Waktu Selesai */}
              <Text style={styles.fieldLabel}>Waktu Selesai</Text>

              <TextInput
                style={styles.input}
                value={formWaktuSelesai}
                onChangeText={(value) => {
                  setFormWaktuSelesai(value);
                  setFormError(null);
                }}
                placeholder="Contoh: 11:00"
                placeholderTextColor="#88819F"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                editable={!menyimpan}
              />

              <Text style={styles.timeHint}>
                Gunakan format 24 jam, misalnya 09:00 sampai 11:00.
              </Text>

              {/* Error */}
              {formError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              {/* Tombol Modal */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  disabled={menyimpan}
                  onPress={tutupModalUbah}
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
                  {menyimpan ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalConfirmText}>
                      Simpan Perubahan
                    </Text>
                  )}
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

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  // Halaman
  container: {
    flex: 1,
    backgroundColor: "#1E1B35",
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    paddingTop: 35,
    paddingBottom: 27,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },

  brand: {
    color: "#B99AFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 9,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 7,
  },

  subtitle: {
    color: "#E2D9F5",
    fontSize: 12,
    lineHeight: 19,
  },

  // Filter
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },

  filterDescription: {
    color: "#A9A2C7",
    fontSize: 12,
    marginBottom: 14,
  },

  filterContainer: {
    gap: 8,
    paddingBottom: 18,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#302A4D",
    borderWidth: 1,
    borderColor: "#45405D",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  filterButtonActive: {
    backgroundColor: "#49358B",
    borderColor: "#7651C9",
  },

  filterText: {
    color: "#B8B1D0",
    fontSize: 12,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  filterCount: {
    backgroundColor: "#45405D",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  filterCountActive: {
    backgroundColor: "#7651C9",
  },

  filterCountText: {
    color: "#D0C9E5",
    fontSize: 10,
    fontWeight: "700",
  },

  filterCountTextActive: {
    color: "#FFFFFF",
  },

  // Kartu sesi
  sessionCard: {
    backgroundColor: "#302A4D",
    borderWidth: 1,
    borderColor: "#45405D",
    borderRadius: 17,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },

  codeBadge: {
    backgroundColor: "#49358B",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  codeText: {
    color: "#D5C7FF",
    fontSize: 11,
    fontWeight: "700",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusBelum: {
    backgroundColor: "#59451F",
  },

  statusBerlangsung: {
    backgroundColor: "#164E48",
  },

  statusSelesai: {
    backgroundColor: "#45405D",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  dotBelum: {
    backgroundColor: "#F5C46B",
  },

  dotBerlangsung: {
    backgroundColor: "#69D9A3",
  },

  dotSelesai: {
    backgroundColor: "#A5A2FF",
  },

  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  subject: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },

  classText: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "#45405D",
    marginVertical: 15,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },

  infoItem: {
    flex: 1,
    backgroundColor: "#25213D",
    borderRadius: 11,
    padding: 11,
  },

  infoLabel: {
    color: "#88819F",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 7,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 17,
  },

  // Tombol sesi
  openSessionButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },

  openSessionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  closeSessionButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },

  closeSessionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Aksi kartu
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
    borderColor: "#7651C9",
    backgroundColor: "#3A2D60",
  },

  cardActionDelete: {
    borderColor: "#873C49",
    backgroundColor: "#482A38",
  },

  deleteFull: {
    flex: 1,
  },

  cardActionEditText: {
    color: "#D5C7FF",
    fontSize: 12,
    fontWeight: "700",
  },

  cardActionDeleteText: {
    color: "#FCA5A5",
    fontSize: 12,
    fontWeight: "700",
  },

  // Loading dan kosong
  emptyCard: {
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#302A4D",
    borderWidth: 1,
    borderColor: "#45405D",
    borderRadius: 16,
    padding: 26,
  },

  loadingText: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 12,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyDescription: {
    color: "#A9A2C7",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },

  // Modal ubah
  ubahOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 8, 20, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  ubahBox: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    backgroundColor: "#302A4D",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#51456E",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#49358B",
    alignItems: "center",
    justifyContent: "center",
  },

  modalIconText: {
    color: "#D5C7FF",
    fontSize: 25,
    fontWeight: "700",
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#45405D",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  ubahTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 7,
  },

  ubahSubject: {
    color: "#D5C7FF",
    fontSize: 15,
    fontWeight: "700",
  },

  ubahClass: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },

  fieldLabel: {
    color: "#D5C7FF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 9,
  },

  hintText: {
    color: "#A9A2C7",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 10,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    backgroundColor: "#25213D",
    borderWidth: 1,
    borderColor: "#51456E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  chipActive: {
    backgroundColor: "#49358B",
    borderColor: "#9874E5",
  },

  chipDisabled: {
    opacity: 0.4,
  },

  chipText: {
    color: "#B8B1D0",
    fontSize: 11,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  input: {
    backgroundColor: "#25213D",
    borderWidth: 1,
    borderColor: "#51456E",
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },

  timeHint: {
    color: "#88819F",
    fontSize: 11,
    marginTop: 8,
  },

  errorContainer: {
    backgroundColor: "#482A38",
    borderWidth: 1,
    borderColor: "#873C49",
    borderRadius: 10,
    padding: 11,
    marginTop: 15,
  },

  errorText: {
    color: "#FCA5A5",
    fontSize: 12,
    lineHeight: 18,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancel: {
    backgroundColor: "#25213D",
    borderWidth: 1,
    borderColor: "#51456E",
  },

  modalCancelText: {
    color: "#D0C9E5",
    fontSize: 13,
    fontWeight: "700",
  },

  modalConfirm: {
    backgroundColor: "#7651C9",
  },

  modalConfirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
  openSessionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },

  // Aksi
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },

  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(185,154,255,0.12)",
    borderRadius: 11,
    paddingVertical: 11,
  },

  editButtonText: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(241,138,138,0.10)",
    borderRadius: 11,
    paddingVertical: 11,
  },

  deleteButtonText: {
    color: "#F18A8A",
    fontSize: 12,
    fontWeight: "700",
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
