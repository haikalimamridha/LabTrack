import BackButton from "@/components/ui/backButton";
import TimePicker from "@/components/ui/timePicker";
import {
  listenLaboratorium,
  type Laboratorium,
} from "@/services/laboratoriumService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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

function tanggalHari(hari: string, jumlah = 6): string[] {
  const indeks = HARI.indexOf(hari);
  if (indeks < 0) return [];

  const target = (indeks + 1) % 7;
  const d = new Date();
  d.setHours(0, 0, 0, 0);

  while (d.getDay() !== target) {
    d.setDate(d.getDate() + 1);
  }

  const hasil: string[] = [];

  for (let i = 0; i < jumlah; i++) {
    hasil.push(toIso(d));
    d.setDate(d.getDate() + 7);
  }

  return hasil;
}

function waktuValid(w: string): boolean {
  const m = w.match(/^(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})$/);
  if (!m) return false;

  const [, h1, m1, h2, m2] = m.map(Number);

  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return false;

  return h2 * 60 + m2 > h1 * 60 + m1;
}

type Form = {
  kelasId: string;
  mataPraktikumId: string;
  labId: string;
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  asisten: string;
};

const FORM_KOSONG: Form = {
  kelasId: "",
  mataPraktikumId: "",
  labId: "",
  hari: "",
  waktuMulai: "",
  waktuSelesai: "",
  asisten: "",
};

// ---------------------------------------------------------------------------
// Komponen Chip
// ---------------------------------------------------------------------------

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
      {aktif && (
        <MaterialCommunityIcons
          size={14}
          color="#FFFFFF"
        />
      )}

      <Text style={[styles.chipText, aktif && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Komponen Input
// ---------------------------------------------------------------------------

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#89839F"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Layar Jadwal
// ---------------------------------------------------------------------------

export default function JadwalScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const { jadwal: jadwalTampil, loading, error } = useJadwal();
  const { daftarSesi, tambahSesi } = useSesi();

  // Pilihan form
  const [daftarKelas, setDaftarKelas] = useState<Kelas[]>([]);
  const [daftarMk, setDaftarMk] = useState<MataPraktikum[]>([]);
  const [daftarLab, setDaftarLab] = useState<Laboratorium[]>([]);
  const [labLoading, setLabLoading] = useState(true);
  const [labError, setLabError] = useState<string | null>(null);
  const [pilihanError, setPilihanError] = useState<string | null>(null);

  // Form jadwal
  const [formTampil, setFormTampil] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(FORM_KOSONG);
  const [formError, setFormError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [dropdownHariTampil, setDropdownHariTampil] = useState(false);

  // Pembuatan sesi
  const [jadwalSesi, setJadwalSesi] = useState<Jadwal | null>(null);
  const [membuat, setMembuat] = useState(false);

  // Memuat pilihan kelas dan mata praktikum
  useEffect(() => {
    let aktif = true;

    Promise.all([getKelasAktif(), getMataPraktikumAktif()])
      .then(([kelas, mk]) => {
        if (!aktif) return;

        setDaftarKelas(
          [...kelas].sort((a, b) => a.kode.localeCompare(b.kode))
        );

        setDaftarMk(
          [...mk].sort((a, b) => a.nama.localeCompare(b.nama))
        );
      })
      .catch((e) => {
        console.error("Gagal memuat pilihan form:", e);

        if (aktif) {
          setPilihanError(
            "Gagal memuat pilihan kelas dan mata praktikum."
          );
        }
      });

    return () => {
      aktif = false;
    };
  }, []);

  // Memuat laboratorium aktif secara real-time
  useEffect(() => {
    const unsubscribe = listenLaboratorium(
      (data) => {
        setDaftarLab(data);
        setLabLoading(false);
        setLabError(null);
      },
      (error) => {
        console.error("Gagal memuat laboratorium:", error);
        setLabError("Gagal memuat daftar laboratorium.");
        setLabLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Membuka form tambah atau edit
  const bukaForm = (item?: Jadwal) => {
    setFormError(null);
    setEditId(item?.id ?? null);

    setForm(
      item
        ? {
            kelasId: item.kelasId,
            mataPraktikumId: item.mataPraktikumId,
            labId: item.labId ?? "",
            hari: item.hari,
            waktuMulai: item.waktuMulai,
            waktuSelesai: item.waktuSelesai,
            asisten: item.asisten,
          }
        : FORM_KOSONG
    );

    setFormTampil(true);
  };

  // Simpan jadwal
  const simpan = async () => {
    if (menyimpan) return;

    const kelas = daftarKelas.find((k) => k.id === form.kelasId);
    const mk = daftarMk.find((m) => m.id === form.mataPraktikumId);
    const lab = daftarLab.find((l) => l.id === form.labId);

    const waktuMulai = form.waktuMulai.trim();
    const waktuSelesai = form.waktuSelesai.trim();
    const asisten = form.asisten.trim();

    let pesan: string | null = null;

    if (!kelas) pesan = "Pilih kelas terlebih dahulu.";
    else if (!mk) pesan = "Pilih mata praktikum terlebih dahulu.";
    else if (!lab) pesan = "Pilih laboratorium terlebih dahulu.";
    else if (!HARI.includes(form.hari)) pesan = "Pilih hari terlebih dahulu.";
    else if (!asisten) pesan = "Nama asisten wajib diisi.";

    if (pesan || !kelas || !mk || !lab) {
      setFormError(pesan);
      return;
    }

    const input: JadwalInput = {
      kelasId: kelas.id,
      mataPraktikumId: mk.id,
      mataPraktikum: mk.nama,
      labId: lab.id,
      kode: "",
      kelas: kelas.kode,
      hari: form.hari,
      waktuMulai,
      waktuSelesai,
      asisten,
    };

    setMenyimpan(true);
    setFormError(null);

    try {
      if (editId) {
        await ubahJadwal(editId, input);
      } else {
        await buatJadwal(input);
      }

      setFormTampil(false);
    } catch (e) {
      console.error("Gagal menyimpan jadwal:", e);

      setFormError(
        pesanError(e, "Kamu tidak punya izin untuk menyimpan jadwal.")
      );
    } finally {
      setMenyimpan(false);
    }
  };

  // Hapus jadwal
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
                pesanError(e, "Kamu tidak punya izin untuk menghapus jadwal.")
              );
            }
          },
        },
      ]
    );
  };

  // Mengecek sesi yang sudah dibuat
  const sudahAda = (jadwalId: string, tanggal: string) =>
    daftarSesi.some(
      (s) => s.scheduleId === jadwalId && s.tanggal === tanggal
    );

  // Membuat sesi dari jadwal
  const buatSesiDari = async (item: Jadwal, tanggal: string) => {
    if (membuat) return;

    // Pastikan jadwal memiliki laboratorium
    if (!item.labId) {
      Alert.alert(
        "Laboratorium Belum Dipilih",
        "Jadwal ini belum terhubung ke laboratorium. Ubah jadwal terlebih dahulu."
      );
      return;
    }

    // Pastikan laboratorium masih aktif dan tersedia
    const lab = daftarLab.find((l) => l.id === item.labId);

    if (!lab) {
      Alert.alert(
        "Laboratorium Tidak Tersedia",
        "Laboratorium pada jadwal ini tidak ditemukan atau sudah tidak aktif. Silakan ubah jadwal dan pilih laboratorium aktif."
      );
      return;
    }

    setMembuat(true);

    try {
      const hasil = await tambahSesi({
        kelasId: item.kelasId,
        mataPraktikumId: item.mataPraktikumId,
        mataPraktikum: item.mataPraktikum,
        kode: item.kode,
        kelas: item.kelas,
        scheduleId: item.id,
        labId: item.labId,
        tanggal,
        hari: item.hari,
        waktuMulai: item.waktuMulai,
        waktuSelesai: item.waktuSelesai,
      });

      if (hasil.ok) {
        setJadwalSesi(null);

        Alert.alert(
          "Berhasil",
          `Sesi ${formatTanggal(tanggal)} dibuat di ${lab.nama}. Buka sesinya dari tab Sesi.`
        );
      } else {
        Alert.alert("Gagal", hasil.pesan);
      }
    } catch (e) {
      console.error("Gagal membuat sesi:", e);
      Alert.alert("Gagal", "Terjadi kesalahan saat membuat sesi.");
    } finally {
      setMembuat(false);
    }
  };

  const totalKelas = new Set(jadwalTampil.map((item) => item.kelasId)).size;

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

          <Text style={styles.headerTitle}>Jadwal Praktikum</Text>
        </LinearGradient>

        {/* STATISTIK */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{jadwalTampil.length}</Text>
            <Text style={styles.statLabel}>Total Jadwal</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalKelas}</Text>
            <Text style={styles.statLabel}>Total Kelas</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daftarMk.length}</Text>
            <Text style={styles.statLabel}>Mata Praktikum</Text>
          </View>
        </View>

        {/* DAFTAR JADWAL */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Daftar Jadwal</Text>
            <Text style={styles.sectionSubtitle}>
              {jadwalTampil.length} jadwal tersedia
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => bukaForm()}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* ERROR PILIHAN */}
        {pilihanError && (
          <View style={styles.warningBox}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color="#F3C879"
            />
            <Text style={styles.warningText}>{pilihanError}</Text>
          </View>
        )}

        {/* LOADING */}
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#A77BFF" />
            <Text style={styles.stateText}>Memuat jadwal...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color="#F18A8A"
            />
            <Text style={styles.emptyTitle}>Gagal memuat jadwal</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <>
            {jadwalTampil.map((item) => (
              <View key={item.id} style={styles.card}>
                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={24}
                      color="#B99AFF"
                    />
                  </View>

                  <View style={styles.cardHeading}>
                    <Text style={styles.subject}>{item.mataPraktikum}</Text>
                    <Text style={styles.classText}>
                      Kelas {item.kelas}
                    </Text>
                  </View>

                  {item.kode ? (
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{item.kode}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.divider} />

                {/* INFORMASI JADWAL */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="calendar-outline"
                      size={18}
                      color="#B99AFF"
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Hari</Text>
                      <Text style={styles.infoValue}>{item.hari}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color="#B99AFF"
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Waktu</Text>
                      <Text style={styles.infoValue}>{item.waktuMulai} - {item.waktuSelesai}</Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="domain"
                      size={18}
                      color="#B99AFF"
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Laboratorium</Text>
                      <Text style={styles.infoValue}>
                        {daftarLab.find((lab) => lab.id === item.labId)?.nama ??
                          "Laboratorium tidak tersedia"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="account-outline"
                      size={18}
                      color="#B99AFF"
                    />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Asisten</Text>
                      <Text style={styles.infoValue}>{item.asisten}</Text>
                    </View>
                  </View>
                </View>

                {/* BUAT SESI */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setJadwalSesi(item)}
                  style={styles.createSessionButton}
                >
                  <LinearGradient
                    colors={["#7651C9", "#49358B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.createSessionGradient}
                  >
                    <MaterialCommunityIcons
                      name="calendar-plus"
                      size={19}
                      color="#FFFFFF"
                    />
                    <Text style={styles.createSessionText}>
                      Buat Sesi dari Jadwal Ini
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={18}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* ACTION */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={() => bukaForm(item)}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={17}
                      color="#B99AFF"
                    />
                    <Text style={styles.editButtonText}>Ubah</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    activeOpacity={0.8}
                    onPress={() => hapus(item)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={17}
                      color="#F18A8A"
                    />
                    <Text style={styles.deleteButtonText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* EMPTY STATE */}
            {jadwalTampil.length === 0 && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons
                    name="calendar-blank-outline"
                    size={36}
                    color="#B99AFF"
                  />
                </View>

                <Text style={styles.emptyTitle}>Belum Ada Jadwal</Text>

                <Text style={styles.emptyText}>
                  Belum ada jadwal praktikum. Tambahkan jadwal pertama untuk
                  mulai mengelola kegiatan praktikum.
                </Text>

                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => bukaForm()}
                >
                  <Text style={styles.emptyButtonText}>
                    + Tambah Jadwal
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ================================================================ */}
      {/* MODAL TAMBAH / UBAH JADWAL */}
      {/* ================================================================ */}


      {/* MODAL FORM JADWAL */}
      <Modal
        visible={formTampil}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setFormTampil(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editId ? "Ubah Jadwal" : "Tambah Jadwal"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Lengkapi informasi jadwal praktikum
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setFormTampil(false)}
                disabled={menyimpan}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {pilihanError && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>{pilihanError}</Text>
                </View>
              )}

              {/* KELAS */}
              <Text style={styles.inputLabel}>Pilih Kelas *</Text>
              <View style={styles.chipRow}>
                {daftarKelas.map((k) => (
                  <Chip
                    key={k.id}
                    label={`Kelas ${k.kode}`}
                    aktif={form.kelasId === k.id}
                    onPress={() =>
                      setForm({ ...form, kelasId: k.id })
                    }
                  />
                ))}
              </View>

              {daftarKelas.length === 0 && (
                <Text style={styles.helperText}>
                  Belum ada kelas aktif yang tersedia.
                </Text>
              )}

              {/* MATA PRAKTIKUM */}
              <Text style={styles.inputLabel}>Mata Praktikum *</Text>
              <View style={styles.chipRow}>
                {daftarMk.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.nama}
                    aktif={form.mataPraktikumId === m.id}
                    onPress={() =>
                      setForm({ ...form, mataPraktikumId: m.id })
                    }
                  />
                ))}
              </View>

              {daftarMk.length === 0 && (
                <Text style={styles.helperText}>
                  Belum ada mata praktikum aktif yang tersedia.
                </Text>
              )}

              {/* LABORATORIUM */}
              <Text style={styles.inputLabel}>Pilih Laboratorium *</Text>

              {labLoading ? (
                <View style={styles.labLoading}>
                  <ActivityIndicator size="small" color="#B99AFF" />
                  <Text style={styles.helperText}>
                    Memuat daftar laboratorium...
                  </Text>
                </View>
              ) : labError ? (
                <Text style={styles.errorText}>{labError}</Text>
              ) : (
                <View style={styles.chipRow}>
                  {daftarLab.map((lab) => (
                    <Chip
                      key={lab.id}
                      label={lab.nama}
                      aktif={form.labId === lab.id}
                      onPress={() =>
                        setForm({ ...form, labId: lab.id })
                      }
                    />
                  ))}
                </View>
              )}

              {!labLoading && !labError && daftarLab.length === 0 && (
                <Text style={styles.helperText}>
                  Belum ada laboratorium aktif. Tambahkan atau aktifkan
                  laboratorium terlebih dahulu.
                </Text>
              )}

              {form.labId !== "" && (
                <View style={styles.labInfoBox}>
                  {(() => {
                    const lab = daftarLab.find(
                      (l) => l.id === form.labId
                    );

                    if (!lab) return null;

                    return (
                      <>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.labInfoName}>
                            {lab.nama}
                          </Text>
                          <Text style={styles.labInfoDetail}>
                            Gedung {lab.gedung} · Lantai {lab.lantai} ·
                            Radius presensi {lab.radiusPresensiMeter} meter
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              )}

              {/* HARI */}
              <Text style={styles.inputLabel}>Hari Praktikum *</Text>

              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setDropdownHariTampil(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !form.hari && styles.dropdownPlaceholder,
                  ]}
                >
                  {form.hari || "Pilih hari praktikum"}
                </Text>

                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color="#B99AFF"
                />
              </TouchableOpacity>

              {/* WAKTU */}
              <Text style={styles.inputLabel}>Waktu Mulai *</Text>
              <TimePicker
                label="Waktu Mulai"
                type="mulai"
                value={form.waktuMulai}
                endTime={form.waktuSelesai}
                onChange={(value) =>
                  setForm({ ...form, waktuMulai: value })
                }
              />

              <Text style={styles.inputLabel}>Waktu Selesai *</Text>
              <TimePicker
                label="Waktu Selesai"
                type="selesai"
                value={form.waktuSelesai}
                startTime={form.waktuMulai}
                onChange={(value) =>
                  setForm({ ...form, waktuSelesai: value })
                }
              />

              {/* ASISTEN */}
              <FormInput
                label="Nama Asisten"
                value={form.asisten}
                onChangeText={(t) =>
                  setForm({ ...form, asisten: t })
                }
                placeholder="Masukkan nama asisten"
              />

              {/* ERROR */}
              {formError && (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={18}
                    color="#F18A8A"
                  />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              {/* BUTTON */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  disabled={menyimpan}
                  onPress={() => setFormTampil(false)}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  disabled={menyimpan}
                  activeOpacity={0.8}
                  onPress={simpan}
                >
                  <LinearGradient
                    colors={["#7651C9", "#49358B"]}
                    style={styles.confirmGradient}
                  >
                    {menyimpan ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="content-save-outline"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.confirmButtonText}>
                          {editId ? "Simpan Perubahan" : "Simpan Jadwal"}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DROPDOWN HARI */}
      <Modal
        visible={dropdownHariTampil}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDropdownHariTampil(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownHariTampil(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.dropdownTitle}>
              Pilih Hari Praktikum
            </Text>

            {HARI.map((hari) => {
              const terpilih = form.hari === hari;

              return (
                <TouchableOpacity
                  key={hari}
                  style={[
                    styles.dropdownItem,
                    terpilih && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setForm({ ...form, hari });
                    setDropdownHariTampil(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      terpilih && styles.dropdownItemTextActive,
                    ]}
                  >
                    {hari}
                  </Text>

                  {terpilih && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#B99AFF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>


      {/* ================================================================ */}
      {/* MODAL BUAT SESI */}
      {/* ================================================================ */}

      <Modal
        visible={jadwalSesi !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setJadwalSesi(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.sessionModalIcon}>
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={25}
                  color="#B99AFF"
                />
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setJadwalSesi(null)}
                disabled={membuat}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Buat Sesi Praktikum</Text>

            <Text style={styles.modalSubtitle}>
              Pilih tanggal pertemuan untuk membuat sesi.
            </Text>

            <View style={styles.sessionInfo}>
              <Text style={styles.sessionSubject}>
                {jadwalSesi?.mataPraktikum}
              </Text>

              <Text style={styles.sessionClass}>
                Kelas {jadwalSesi?.kelas}
              </Text>

              <Text style={styles.sessionClass}>
                Kelas {jadwalSesi?.kelas}
              </Text>

              <View style={styles.sessionLabInfo}>
                <MaterialCommunityIcons
                  name="domain"
                  size={17}
                  color="#69D9A3"
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionLabName}>
                    {daftarLab.find((lab) => lab.id === jadwalSesi?.labId)?.nama ??
                      "Laboratorium tidak tersedia"}
                  </Text>
                </View>
              </View>

              <View style={styles.sessionDetails}>
                <View style={styles.sessionDetailItem}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={16}
                    color="#B99AFF"
                  />
                  <Text style={styles.sessionDetailText}>
                    {jadwalSesi?.hari}
                  </Text>
                </View>

                <View style={styles.sessionDetailItem}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color="#B99AFF"
                  />
                  <Text style={styles.sessionDetailText}>
                    {jadwalSesi?.waktuMulai} - {jadwalSesi?.waktuSelesai}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.fieldLabel}>
              Pilih Tanggal Pertemuan
            </Text>

            <View style={styles.dateList}>
              {jadwalSesi &&
                tanggalHari(jadwalSesi.hari).map((t) => {
                  const ada = sudahAda(jadwalSesi.id, t);

                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.dateItem,
                        ada && styles.dateItemDisabled,
                      ]}
                      disabled={ada || membuat}
                      activeOpacity={0.8}
                      onPress={() => buatSesiDari(jadwalSesi, t)}
                    >
                      <View style={styles.dateIcon}>
                        <MaterialCommunityIcons
                          name={ada ? "check-circle" : "calendar"}
                          size={20}
                          color={ada ? "#69D9A3" : "#B99AFF"}
                        />
                      </View>

                      <View style={styles.dateInfo}>
                        <Text style={styles.dateText}>
                          {formatTanggal(t)}
                        </Text>

                        <Text style={styles.dateStatus}>
                          {ada ? "Sesi sudah dibuat" : "Belum ada sesi"}
                        </Text>
                      </View>

                      {membuat && !ada ? (
                        <ActivityIndicator color="#B99AFF" />
                      ) : (
                        <MaterialCommunityIcons
                          name={ada ? "check" : "chevron-right"}
                          size={20}
                          color={ada ? "#69D9A3" : "#A9A2C7"}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </View>

            <Text style={styles.helperText}>
              Sesi langsung dibuat saat tanggal dipilih. Tanggal dengan tanda
              centang sudah memiliki sesi.
            </Text>

            <TouchableOpacity
              style={styles.closeModalButton}
              disabled={membuat}
              onPress={() => setJadwalSesi(null)}
            >
              <Text style={styles.cancelButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B35",
  },

  scrollContent: {
    paddingBottom: 35,
  },

  // Header
  header: {
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  // Statistik
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#302A4D",
    borderRadius: 17,
    padding: 13,
    alignItems: "center",
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    color: "#B8B0D0",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#7651C9",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Card
  card: {
    backgroundColor: "#302A4D",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#453B64",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeading: {
    flex: 1,
    marginLeft: 12,
  },

  subject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },

  classText: {
    color: "#B99AFF",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },

  codeBadge: {
    backgroundColor: "#45366B",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  codeText: {
    color: "#CDB7FF",
    fontSize: 10,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#49415F",
    marginVertical: 15,
  },

  // Informasi jadwal
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    marginBottom: 12,
  },

  infoItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    gap: 9,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#A9A2C7",
    fontSize: 10,
    marginBottom: 3,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Tombol buat sesi
  createSessionButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },

  createSessionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },

  createSessionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
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

  // Loading dan empty state
  stateContainer: {
    alignItems: "center",
    paddingVertical: 55,
  },

  stateText: {
    color: "#B8B0D0",
    fontSize: 12,
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 45,
    marginHorizontal: 18,
    backgroundColor: "#302A4D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#453B64",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },

  emptyText: {
    color: "#A9A2C7",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },

  emptyButton: {
    backgroundColor: "#7651C9",
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 18,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  // Peringatan
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(243,200,121,0.10)",
    borderRadius: 11,
    padding: 12,
    marginHorizontal: 18,
    marginBottom: 14,
  },

  warningText: {
    color: "#F3C879",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#25213D",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 21,
    paddingTop: 22,
    paddingBottom: 45,
    maxHeight: "90%",
    flexShrink: 1,
  },

  modalBox: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    backgroundColor: "#25213D",
    borderRadius: 23,
    padding: 20,
    borderWidth: 1,
    borderColor: "#49415F",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  modalSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#403957",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form
  fieldLabel: {
    color: "#DDD6EF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 17,
    marginBottom: 10,
  },

  formGroup: {
    marginTop: 5,
  },

  input: {
    backgroundColor: "#342E50",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: "#FFFFFF",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#49415F",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#342E50",
    borderWidth: 1,
    borderColor: "#49415F",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  chipActive: {
    backgroundColor: "#7651C9",
    borderColor: "#A77BFF",
  },

  chipDisabled: {
    opacity: 0.4,
  },

  chipText: {
    color: "#C4BCD9",
    fontSize: 11,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  helperText: {
    color: "#A9A2C7",
    fontSize: 11,
    marginTop: 8,
    lineHeight: 17,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(241,138,138,0.10)",
    padding: 12,
    borderRadius: 11,
    marginTop: 15,
  },

  errorText: {
    color: "#F18A8A",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 23,
    marginBottom: 5,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#5A526E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#D5CFE6",
    fontSize: 12,
    fontWeight: "700",
  },

  confirmButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: "hidden",
  },

  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  // Modal sesi
  sessionModalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
  },

  sessionInfo: {
    backgroundColor: "#342E50",
    borderRadius: 14,
    padding: 14,
    marginTop: 17,
  },

  sessionSubject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  sessionClass: {
    color: "#B99AFF",
    fontSize: 12,
    marginTop: 5,
    fontWeight: "600",
  },

  sessionDetails: {
    gap: 9,
    marginTop: 13,
  },

  sessionDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sessionDetailText: {
    color: "#D5CFE6",
    fontSize: 12,
  },

  // Pilihan tanggal
  dateList: {
    gap: 9,
  },

  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#342E50",
    borderWidth: 1,
    borderColor: "#49415F",
    borderRadius: 12,
    padding: 12,
    gap: 11,
  },

  dateItemDisabled: {
    opacity: 0.55,
    borderColor: "#69D9A3",
  },

  dateIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
  },

  dateInfo: {
    flex: 1,
  },

  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  dateStatus: {
    color: "#A9A2C7",
    fontSize: 10,
    marginTop: 4,
  },

  closeModalButton: {
    borderWidth: 1,
    borderColor: "#5A526E",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 20,
  },
  // Informasi laboratorium
  labLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  labInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(105,217,163,0.10)",
    borderWidth: 1,
    borderColor: "rgba(105,217,163,0.25)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },

  labInfoName: {
    color: "#69D9A3",
    fontSize: 12,
    fontWeight: "700",
  },

  labInfoDetail: {
    color: "#B8B0D0",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 16,
  },

  // Informasi laboratorium pada modal sesi
  sessionLabInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(105,217,163,0.10)",
    borderRadius: 10,
    padding: 11,
    marginTop: 12,
  },

  sessionLabName: {
    color: "#69D9A3",
    fontSize: 12,
    fontWeight: "700",
  },

  sessionLabRadius: {
    color: "#B8B0D0",
    fontSize: 10,
    marginTop: 4,
  },
  inputLabel: {
    color: "#DDD6EF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 13,
  },
  dropdownButton: {
    backgroundColor: "#302A4D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#494166",
    paddingHorizontal: 15,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  dropdownPlaceholder: {
    color: "#9993AE",
    fontWeight: "400",
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  dropdownModal: {
    width: "100%",
    backgroundColor: "#25213D",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#494166",
  },

  dropdownTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },

  dropdownItemActive: {
    backgroundColor: "#49358B",
  },

  dropdownItemText: {
    color: "#D8D2E8",
    fontSize: 14,
  },

  dropdownItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
