import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "@react-native-firebase/firestore";

import { firestore } from "@/config/firebase";
import type { UserProfile } from "@/context/AuthContext";

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

// Di database status disimpan dalam bahasa Inggris (dipakai Security Rules),
// di UI dipetakan ke label Indonesia agar layar yang sudah ada tidak berubah.
export type StatusDb = "draft" | "open" | "closed";
export type StatusSesi = "Belum Dibuka" | "Sedang Berlangsung" | "Selesai";
export type ModePraktikum = "online" | "offline";

const LABEL_STATUS: Record<StatusDb, StatusSesi> = {
  draft: "Belum Dibuka",
  open: "Sedang Berlangsung",
  closed: "Selesai",
};

export type Hasil = { ok: boolean; pesan: string };

export type Sesi = {
  id: string; // ID dokumen Firestore (sebelumnya number)
  kelasId: string;
  mataPraktikumId: string;
  mataPraktikum: string; // nama untuk tampilan
  kode: string; // opsional, kosong jika tidak ada
  kelas: string; // kode/nama kelas untuk tampilan, contoh "A"
  scheduleId: string | null;
  labId: string; 
  tanggal: string; // YYYY-MM-DD
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  status: StatusSesi; // label UI
  statusDb: StatusDb; // nilai asli di database
  openedAt: Date | null;
  closedAt: Date | null;
  modePraktikum: ModePraktikum;
  radiusPresensi: number;
};

export type SesiInput = {
  kelasId: string;
  mataPraktikumId: string;
  mataPraktikum: string;
  kelas: string;
  kode?: string;
  scheduleId?: string | null;
  labId: string; 
  tanggal: string;
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  modePraktikum?: ModePraktikum;
  radiusPresensi?: number;
};

export type Jadwal = {
  id: string;
  kelasId: string;
  mataPraktikumId: string;
  mataPraktikum: string;
  kode: string;
  kelas: string;
  labId: string; 
  hari: string;
  waktuMulai: string;
  waktuSelesai: string;
  asisten: string;
};

export type JadwalInput = Omit<Jadwal, "id">;

export type Kehadiran = {
  id: string;
  sesiId: string;
  uid: string;
  nama: string;
  nim: string;
  status: string; // "hadir" (atau "izin" bila kelak dipakai)
  waktu: Date | null;
};

export type Peserta = { uid: string; nama: string; nim: string };

type Unsubscribe = () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = { [field: string]: any };

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

// Firestore Timestamp -> Date (null jika belum terisi, mis. serverTimestamp pending)
const toDate = (v: unknown): Date | null =>
  v && typeof (v as { toDate?: unknown }).toDate === "function"
    ? (v as { toDate: () => Date }).toDate()
    : null;

function toSesi(id: string, d: Data): Sesi {
  const statusDb = (d.status as StatusDb) ?? "draft";
  return {
    id,
    kelasId: d.kelasId ?? "",
    mataPraktikumId: d.mataPraktikumId ?? "",
    mataPraktikum: d.mataPraktikum ?? "",
    kode: d.kode ?? "",
    kelas: d.kelas ?? "",
    scheduleId: d.scheduleId ?? null,
    tanggal: d.tanggal ?? "",
    hari: d.hari ?? "",
    labId: d.labId ?? "",
    waktuMulai: d.waktuMulai ?? "",
    waktuSelesai: d.waktuSelesai ?? "",
    status: LABEL_STATUS[statusDb] ?? "Belum Dibuka",
    statusDb,
    openedAt: toDate(d.openedAt),
    closedAt: toDate(d.closedAt),
    modePraktikum: d.modePraktikum ?? "offline",
    radiusPresensi: d.radiusPresensi ?? 100,
  };
}

function toJadwal(id: string, d: Data): Jadwal {
  return {
    id,
    kelasId: d.kelasId ?? "",
    mataPraktikumId: d.mataPraktikumId ?? "",
    mataPraktikum: d.mataPraktikum ?? "",
    kode: d.kode ?? "",
    kelas: d.kelas ?? "",
    labId: d.labId ?? "",
    hari: d.hari ?? "",
    waktuMulai: d.waktuMulai ?? "",
    waktuSelesai: d.waktuSelesai ?? "",
    asisten: d.asisten ?? "",
  };
}

function toKehadiran(id: string, d: Data): Kehadiran {
  return {
    id,
    sesiId: d.sessionId ?? "",
    uid: d.uid ?? "",
    nama: d.nama ?? "",
    nim: d.nim ?? "",
    status: d.status ?? "hadir",
    waktu: toDate(d.createdAt),
  };
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** "2026-11-21" -> "21 November 2026" */
export function formatTanggal(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m > 12) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export const HARI = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

/** Waktu mulai sesi (ms) dari tanggal "YYYY-MM-DD" dan waktu "09.00 - 11.00". */
export const waktuMulaiSesi = (item: Sesi) => {
  const [tahun, bulan, hari] = item.tanggal.split("-").map(Number);
  const [jam, menit] = item.waktuMulai.split(":").map(Number);

  return new Date(
    tahun,
    bulan - 1,
    hari,
    jam,
    menit
  ).getTime();
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Beberapa tanggal terdekat (mulai hari ini) yang jatuh pada hari tertentu. */
export function tanggalHari(hari: string, jumlah = 6): string[] {
  const indeks = HARI.indexOf(hari);
  if (indeks < 0) return [];

  const target = (indeks + 1) % 7; // HARI mulai Senin, getDay() mulai Minggu = 0
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (d.getDay() !== target) d.setDate(d.getDate() + 1);

  const hasil: string[] = [];
  for (let i = 0; i < jumlah; i++) {
    hasil.push(
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    );
    d.setDate(d.getDate() + 7);
  }
  return hasil;
}

/** Format wajib "09.00 - 11.00", jam selesai harus setelah jam mulai. */
export function waktuValid(w: string): boolean {
  const m = w.match(/^(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})$/);
  if (!m) return false;
  const [, h1, m1, h2, m2] = m.map(Number);
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) return false;
  return h2 * 60 + m2 > h1 * 60 + m1;
}

/** Ubah error Firebase menjadi pesan yang ramah untuk pengguna. */
export function pesanError(
  e: unknown,
  pesanDitolak = "Akses ditolak.",
): string {
  const code = (e as { code?: string } | null)?.code ?? "";
  if (code.includes("permission-denied")) return pesanDitolak;
  if (code.includes("unavailable") || code.includes("network"))
    return "Tidak dapat terhubung ke server. Periksa koneksi internet.";
  return "Terjadi kesalahan. Coba lagi.";
}

// ---------------------------------------------------------------------------
// Jadwal
// ---------------------------------------------------------------------------

/** kelasId null = semua jadwal (untuk asprak). */
export function subscribeJadwal(
  kelasId: string | null,
  cb: (data: Jadwal[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const col = collection(firestore, "schedules");
  const q = kelasId ? query(col, where("kelasId", "==", kelasId)) : query(col);
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toJadwal(d.id, d.data()))),
    onError,
  );
}

/**
 * Listener jadwal berdasarkan laboratorium.
 */
export function subscribeJadwalLab(
  labId: string,
  cb: (data: Jadwal[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(firestore, "schedules"),
    where("labId", "==", labId),
  );

  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => toJadwal(d.id, d.data())));
    },
    onError,
  );
}

export const buatJadwal = (input: JadwalInput) =>
  addDoc(collection(firestore, "schedules"), {
    ...input,
    createdAt: serverTimestamp(),
  });

export const ubahJadwal = (id: string, input: Partial<JadwalInput>) =>
  updateDoc(doc(firestore, "schedules", id), input);

export const hapusJadwal = (id: string) =>
  deleteDoc(doc(firestore, "schedules", id));

// ---------------------------------------------------------------------------
// Sesi
// ---------------------------------------------------------------------------

/** kelasId null = semua sesi (untuk asprak). Diurutkan tanggal terbaru dulu. */
export function subscribeSesi(
  kelasId: string | null,
  cb: (data: Sesi[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const col = collection(firestore, "sessions");
  const q = kelasId ? query(col, where("kelasId", "==", kelasId)) : query(col);
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs
          .map((d) => toSesi(d.id, d.data()))
          .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
      ),
    onError,
  );
}

/**
 * Listener sesi berdasarkan laboratorium.
 */
export function subscribeSesiLab(
  labId: string,
  cb: (data: Sesi[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(firestore, "sessions"),
    where("labId", "==", labId),
  );

  return onSnapshot(
    q,
    (snap) => {
      cb(snap.docs.map((d) => toSesi(d.id, d.data())));
    },
    onError,
  );
}

export const buatSesi = (input: SesiInput) =>
  addDoc(collection(firestore, "sessions"), {
    ...input,
    kode: input.kode ?? "",
    scheduleId: input.scheduleId ?? null,
    modePraktikum: input.modePraktikum ?? "offline",
    radiusPresensi: input.radiusPresensi ?? 100,
    status: "draft" satisfies StatusDb,
    createdAt: serverTimestamp(),
  });

export const ubahSesiDb = (id: string, input: Partial<SesiInput>) =>
  updateDoc(doc(firestore, "sessions", id), input);

/** Menghapus sesi beserta seluruh catatan presensinya (agar tidak ada data yatim). */
export async function hapusSesiDb(id: string): Promise<void> {
  const snap = await getDocs(
    query(collection(firestore, "attendance"), where("sessionId", "==", id)),
  );
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(firestore, "sessions", id));
}

export const bukaSesiDb = (id: string) =>
  updateDoc(doc(firestore, "sessions", id), {
    status: "open" satisfies StatusDb,
    openedAt: serverTimestamp(),
  });

export const tutupSesiDb = (id: string) =>
  updateDoc(doc(firestore, "sessions", id), {
    status: "closed" satisfies StatusDb,
    closedAt: serverTimestamp(),
  });

// ---------------------------------------------------------------------------
// Presensi
// ---------------------------------------------------------------------------

/** Rekap kehadiran satu sesi (untuk asprak). */
export function subscribeKehadiranSesi(
  sesiId: string,
  cb: (data: Kehadiran[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(firestore, "attendance"),
    where("sessionId", "==", sesiId),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toKehadiran(d.id, d.data()))),
    onError,
  );
}

/** Seluruh presensi milik satu praktikan (untuk riwayat & menonaktifkan tombol). */
export function subscribeKehadiranSaya(
  uid: string,
  cb: (data: Kehadiran[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(collection(firestore, "attendance"), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => toKehadiran(d.id, d.data()))),
    onError,
  );
}

/** Daftar praktikan satu kelas, untuk menghitung "hadir X dari Y". */
export function subscribePesertaKelas(
  kelasId: string,
  cb: (data: Peserta[]) => void,
  onError: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(firestore, "users"),
    where("kelasId", "==", kelasId),
    where("role", "==", "praktikan"),
  );
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs
          .map((d) => {
            const x = d.data();
            return { uid: d.id, nama: x.nama ?? "", nim: x.nim ?? "" };
          })
          .sort((a, b) => a.nim.localeCompare(b.nim)),
      ),
    onError,
  );
}

/**
 * Mencatat presensi. ID dokumen = `${sesiId}_${uid}`, sehingga presensi kedua
 * menjadi UPDATE pada dokumen yang sama dan ditolak oleh Security Rules.
 */
export function catatKehadiran(
  sesi: Sesi,
  profile: Pick<UserProfile, "uid" | "nama" | "nim">,
) {
  return setDoc(doc(firestore, "attendance", `${sesi.id}_${profile.uid}`), {
    sessionId: sesi.id,
    kelasId: sesi.kelasId,
    mataPraktikumId: sesi.mataPraktikumId,
    uid: profile.uid,
    nama: profile.nama,
    nim: profile.nim,
    status: "hadir",
    createdAt: serverTimestamp(),
  });
}
