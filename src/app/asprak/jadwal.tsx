import { useEffect, useState } from "react";
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

import { useAuth } from "@/context/AuthContext";
import { useSesi } from "@/context/SesiContext";
import { useJadwal } from "@/hooks/useJadwal";
import { getKelasAktif, type Kelas } from "@/services/kelasService";
import {
  getMataPraktikumAktif,
  type MataPraktikum,
} from "@/services/mataPraktikumService";
import {
  HARI,
  buatJadwal,
  formatTanggal,
  hapusJadwal,
  pesanError,
  ubahJadwal,
  type Jadwal,
  type JadwalInput,
} from "@/services/sessionService";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");

const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Beberapa tanggal terdekat (mulai hari ini) yang jatuh pada hari tertentu. */
function tanggalHari(hari: string, jumlah = 6): string[] {
  const indeks = HARI.indexOf(hari);
  if (indeks < 0) return [];

  const target = (indeks + 1) % 7; // HARI mulai Senin, getDay() mulai Minggu = 0
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== target) d.setDate(d.getDate() + 1);

  const hasil: string[] = [];
  for (let i = 0; i < jumlah; i++) {
    hasil.push(toIso(d));
    d.setDate(d.getDate() + 7);
  }
  return hasil;
}

/** Format wajib: "09.00 - 11.00" */
function waktuValid(w: string): boolean {
  const m = w.match(/^(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})$/);
  if (!m) return false;
  const [, h1, m1, h2, m2] = m.map(Number);
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return false;
  return h2 * 60 + m2 > h1 * 60 + m1; // selesai harus setelah mulai
}

type Form = {
  kelasId: string;
  mataPraktikumId: string;
  hari: string;
  waktu: string;
  ruangan: string;
  asisten: string;
};

const FORM_KOSONG: Form = {
  kelasId: "",
  mataPraktikumId: "",
  hari: "",
  waktu: "",
  ruangan: "",
  asisten: "",
};

function Chip({
  label,
  aktif,
  disabled,
  onPress,
}: {
  label: string;
  aktif?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        aktif && styles.chipActive,
        disabled && styles.chipDisabled,
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.chipText, aktif && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Layar
// ---------------------------------------------------------------------------

export default function JadwalScreen() {
  const { profile } = useAuth();
  const { jadwal: jadwalTampil, loading, error } = useJadwal();
  const { daftarSesi, tambahSesi } = useSesi();

  // Pilihan untuk form
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [daftarMk, setDaftarMk] = useState<MataPraktikum[]>([]);
  const [pilihanError, setPilihanError] = useState<string | null>(null);

  // Form tambah/ubah
  const [formTampil, setFormTampil] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(FORM_KOSONG);
  const [formError, setFormError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // Buat sesi dari jadwal
  const [jadwalSesi, setJadwalSesi] = useState<Jadwal | null>(null);
  const [membuat, setMembuat] = useState(false);

  useEffect(() => {
    let aktif = true;

    Promise.all([getKelasAktif(), getMataPraktikumAktif()])
      .then(([kelas, mk]) => {
        if (!aktif) return;
        setDaftarKelas([...kelas].sort((a, b) => a.kode.localeCompare(b.kode)));
        setDaftarMk([...mk].sort((a, b) => a.nama.localeCompare(b.nama)));
      })
      .catch((e) => {
        console.error("Gagal memuat pilihan form:", e);
        if (aktif)
          setPilihanError("Gagal memuat pilihan kelas dan mata praktikum.");
      });

    return () => {
      aktif = false;
    };
  }, []);

  const bukaForm = (item?: Jadwal) => {
    setFormError(null);
    setEditId(item?.id ?? null);
    setForm(
      item
        ? {
            kelasId: item.kelasId,
            mataPraktikumId: item.mataPraktikumId,
            hari: item.hari,
            waktu: item.waktu,
            ruangan: item.ruangan,
            asisten: item.asisten,
          }
        : FORM_KOSONG,
    );
    setFormTampil(true);
  };

  const simpan = async () => {
    if (menyimpan) return;

    const kelas = daftarKelas.find((k) => k.id === form.kelasId);
    const mk = daftarMk.find((m) => m.id === form.mataPraktikumId);
    const waktu = form.waktu.trim();
    const ruangan = form.ruangan.trim();
    const asisten = form.asisten.trim();

    let pesan: string | null = null;
    if (!kelas) pesan = "Pilih kelas terlebih dahulu.";
    else if (!mk) pesan = "Pilih mata praktikum terlebih dahulu.";
    else if (!HARI.includes(form.hari)) pesan = "Pilih hari terlebih dahulu.";
    else if (!waktuValid(waktu))
      pesan =
        "Format waktu harus seperti 09.00 - 11.00 (selesai setelah mulai).";
    else if (!ruangan) pesan = "Ruangan wajib diisi.";
    else if (!asisten) pesan = "Nama asisten wajib diisi.";

    if (pesan || !kelas || !mk) {
      setFormError(pesan);
      return;
    }

    const input: JadwalInput = {
      kelasId: kelas.id,
      mataPraktikumId: mk.id,
      mataPraktikum: mk.nama,
      kode: "",
      kelas: kelas.kode,
      hari: form.hari,
      waktu,
      ruangan,
      asisten,
    };

    setMenyimpan(true);
    setFormError(null);
    try {
      if (editId) await ubahJadwal(editId, input);
      else await buatJadwal(input);
      setFormTampil(false);
    } catch (e) {
      console.error("Gagal menyimpan jadwal:", e);
      setFormError(
        pesanError(e, "Kamu tidak punya izin untuk menyimpan jadwal."),
      );
    } finally {
      setMenyimpan(false);
    }
  };

  const hapus = (item: Jadwal) => {
    Alert.alert(
      "Hapus Jadwal",
      `Hapus jadwal ${item.mataPraktikum} (Kelas ${item.kelas}, ${item.hari})? Sesi yang sudah dibuat dari jadwal ini tidak ikut terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await hapusJadwal(item.id);
            } catch (e) {
              console.error("Gagal menghapus jadwal:", e);
              Alert.alert(
                "Gagal",
                pesanError(e, "Kamu tidak punya izin untuk menghapus jadwal."),
              );
            }
          },
        },
      ],
    );
  };

  const sudahAda = (jadwalId: string, tanggal: string) =>
    daftarSesi.some((s) => s.scheduleId === jadwalId && s.tanggal === tanggal);

  const buatSesiDari = async (item: Jadwal, tanggal: string) => {
    if (membuat) return;
    setMembuat(true);
    const hasil = await tambahSesi({
      kelasId: item.kelasId,
      mataPraktikumId: item.mataPraktikumId,
      mataPraktikum: item.mataPraktikum,
      kode: item.kode,
      kelas: item.kelas,
      scheduleId: item.id,
      tanggal,
      hari: item.hari,
      waktu: item.waktu,
      ruangan: item.ruangan,
    });
    setMembuat(false);

    if (hasil.ok) {
      setJadwalSesi(null);
      Alert.alert(
        "Berhasil",
        `Sesi ${formatTanggal(tanggal)} dibuat. Buka sesinya dari tab Sesi.`,
      );
    } else {
      Alert.alert("Gagal", hasil.pesan);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => bukaForm()}
        >
          <Text style={styles.addButtonText}>+ Tambah Jadwal</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color="#A5A2FF" />
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Gagal memuat jadwal</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Jumlah jadwal */}
            <Text style={styles.totalText}>
              {jadwalTampil.length} jadwal ditemukan
            </Text>

            {/* Daftar jadwal */}
            {jadwalTampil.map((item) => (
              <View key={item.id} style={styles.card}>
                {item.kode ? (
                  <View style={styles.cardHeader}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{item.kode}</Text>
                    </View>
                  </View>
                ) : null}

                <Text style={styles.subject}>{item.mataPraktikum}</Text>

                <Text style={styles.classText}>Kelas {item.kelas}</Text>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Hari</Text>
                  <Text style={styles.infoValue}>{item.hari}</Text>
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
                  <Text style={styles.infoLabel}>Asisten</Text>
                  <Text style={styles.infoValue}>{item.asisten}</Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={() => setJadwalSesi(item)}
                >
                  <Text style={styles.primaryButtonText}>
                    Buat Sesi dari Jadwal Ini
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    activeOpacity={0.8}
                    onPress={() => bukaForm(item)}
                  >
                    <Text style={styles.actionText}>Ubah</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    activeOpacity={0.8}
                    onPress={() => hapus(item)}
                  >
                    <Text style={styles.actionText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Empty state */}
            {jadwalTampil.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
                <Text style={styles.emptyText}>
                  Belum ada jadwal. Tekan "Tambah Jadwal" untuk membuat yang
                  pertama.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Form tambah / ubah jadwal */}
      <Modal
        visible={formTampil}
        transparent
        animationType="fade"
        onRequestClose={() => setFormTampil(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>
                {editId ? "Ubah Jadwal" : "Tambah Jadwal"}
              </Text>

              {pilihanError && (
                <Text style={styles.errorText}>{pilihanError}</Text>
              )}

              <Text style={styles.fieldLabel}>Kelas</Text>
              <View style={styles.chipRow}>
                {daftarKelas.map((k) => (
                  <Chip
                    key={k.id}
                    label={`Kelas ${k.kode}`}
                    aktif={form.kelasId === k.id}
                    onPress={() => setForm({ ...form, kelasId: k.id })}
                  />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Mata Praktikum</Text>
              <View style={styles.chipRow}>
                {daftarMk.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.nama}
                    aktif={form.mataPraktikumId === m.id}
                    onPress={() => setForm({ ...form, mataPraktikumId: m.id })}
                  />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Hari</Text>
              <View style={styles.chipRow}>
                {HARI.map((h) => (
                  <Chip
                    key={h}
                    label={h}
                    aktif={form.hari === h}
                    onPress={() => setForm({ ...form, hari: h })}
                  />
                ))}
              </View>

              <Text style={styles.fieldLabel}>Waktu</Text>
              <TextInput
                style={styles.input}
                value={form.waktu}
                onChangeText={(t) => setForm({ ...form, waktu: t })}
                placeholder="09.00 - 11.00"
                placeholderTextColor="#777E89"
              />

              <Text style={styles.fieldLabel}>Ruangan</Text>
              <TextInput
                style={styles.input}
                value={form.ruangan}
                onChangeText={(t) => setForm({ ...form, ruangan: t })}
                placeholder="Lab Komputer 1"
                placeholderTextColor="#777E89"
              />

              <Text style={styles.fieldLabel}>Asisten</Text>
              <TextInput
                style={styles.input}
                value={form.asisten}
                onChangeText={(t) => setForm({ ...form, asisten: t })}
                placeholder="Nama asisten"
                placeholderTextColor="#777E89"
              />

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  disabled={menyimpan}
                  onPress={() => setFormTampil(false)}
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
                  onPress={simpan}
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

      {/* Pilih tanggal untuk membuat sesi */}
      <Modal
        visible={jadwalSesi !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setJadwalSesi(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Buat Sesi dari Jadwal</Text>

            <Text style={styles.modalSubject}>
              {jadwalSesi?.mataPraktikum} (Kelas {jadwalSesi?.kelas})
            </Text>
            <Text style={styles.hintText}>
              {jadwalSesi?.hari}, {jadwalSesi?.waktu} · {jadwalSesi?.ruangan}
            </Text>

            <Text style={styles.fieldLabel}>Pilih tanggal pertemuan</Text>
            <View style={styles.chipRow}>
              {jadwalSesi &&
                tanggalHari(jadwalSesi.hari).map((t) => {
                  const ada = sudahAda(jadwalSesi.id, t);
                  return (
                    <Chip
                      key={t}
                      label={ada ? `${formatTanggal(t)} ✓` : formatTanggal(t)}
                      disabled={ada || membuat}
                      onPress={() => buatSesiDari(jadwalSesi, t)}
                    />
                  );
                })}
            </View>

            <Text style={styles.hintText}>
              Sesi langsung dibuat saat tanggal dipilih. Tanggal bertanda ✓
              sudah punya sesi.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                disabled={membuat}
                onPress={() => setJadwalSesi(null)}
              >
                <Text style={styles.modalCancelText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#625ff0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  primaryButton: {
    backgroundColor: "#625ff0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
  },
  editButton: {
    borderColor: "#555B65",
  },
  deleteButton: {
    borderColor: "#991B1B",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
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
  modalSubject: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  totalText: {
    color: "#B8BCC4",
    fontSize: 13,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#343941",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: "#45416F",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeText: {
    color: "#C7C5FF",
    fontSize: 12,
    fontWeight: "bold",
  },
  subject: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 24,
  },
  classText: {
    color: "#C7C5FF",
    fontSize: 12,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#505661",
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  infoLabel: {
    color: "#AEB4BE",
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#B8BCC4",
    fontSize: 13,
    textAlign: "center",
  },
});
