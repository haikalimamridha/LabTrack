/**
 * notificationService.ts
 *
 * FR-12  – Notifikasi ke praktikan saat sesi dibuka.
 * FR-13  – Notifikasi ke pengguna saat jadwal berubah.
 * FR-14  – Notifikasi ke praktikan pengaju saat izin diputuskan.
 * FR-15  – Simpan FCM token per pengguna; kirim hanya ke yang berkepentingan.
 * FR-17  – Pesan error yang jelas untuk setiap kondisi gagal.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import { firestore } from '@/config/firebase';
import { getDevicePushTokenSafe } from './notificationHelper';

// ---------------------------------------------------------------------------
// Tipe
// ---------------------------------------------------------------------------

export type HasilNotifikasi = { ok: boolean; pesan: string };

// ---------------------------------------------------------------------------
// FR-15: Simpan token FCM / Push pengguna ke Firestore
// ---------------------------------------------------------------------------

/**
 * Ambil token FCM / Push perangkat saat ini dan simpan (atau perbarui) ke koleksi
 * `notificationTokens/{uid}`.
 * Berjalan aman di Expo Go, Simulator, maupun Production Build.
 */
export async function simpanTokenFCM(uid: string): Promise<HasilNotifikasi> {
  if (!uid) {
    return { ok: false, pesan: 'UID pengguna tidak valid.' };
  }

  try {
    const token = await getDevicePushTokenSafe(uid);

    if (!token) {
      return {
        ok: false,
        pesan: 'Token notifikasi tidak tersedia pada simulator atau perangkat ini.',
      };
    }

    await setDoc(
      doc(firestore, 'notificationTokens', uid),
      {
        token,
        uid,
        platform: Platform.OS,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true, pesan: 'Token notifikasi berhasil disimpan.' };
  } catch (e) {
    console.warn('[notificationService] Gagal simpan token:', e);
    return {
      ok: false,
      pesan: 'Gagal menyimpan token notifikasi. Periksa koneksi internet.',
    };
  }
}

/**
 * Hapus token FCM dari Firestore saat logout agar notifikasi tidak dikirim
 * ke perangkat yang sudah tidak masuk.
 */
export async function hapusTokenFCM(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await setDoc(
      doc(firestore, 'notificationTokens', uid),
      { token: null, updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (e) {
    console.warn('[notificationService] Gagal hapus token FCM:', e);
  }
}

// ---------------------------------------------------------------------------
// Helper: ambil token FCM dari daftar uid
// ---------------------------------------------------------------------------

async function ambilToken(uid: string): Promise<string | null> {
  try {
    const snap = await getDocs(
      query(
        collection(firestore, 'notificationTokens'),
        where('uid', '==', uid),
      ),
    );
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    return (data?.token as string) ?? null;
  } catch {
    return null;
  }
}

async function ambilTokenKelas(kelasId: string): Promise<string[]> {
  try {
    // Ambil uid semua praktikan di kelas ini
    const usersSnap = await getDocs(
      query(
        collection(firestore, 'users'),
        where('kelasId', '==', kelasId),
        where('role', '==', 'praktikan'),
      ),
    );

    const uids = usersSnap.docs.map((d) => d.id);
    if (uids.length === 0) return [];

    // FCM "in" dibatasi 30 item; chunk jika lebih banyak
    const chunks: string[][] = [];
    for (let i = 0; i < uids.length; i += 30) {
      chunks.push(uids.slice(i, i + 30));
    }

    const tokens: string[] = [];
    for (const chunk of chunks) {
      const tokenSnap = await getDocs(
        query(
          collection(firestore, 'notificationTokens'),
          where('uid', 'in', chunk),
        ),
      );
      tokenSnap.docs.forEach((d) => {
        const t = d.data()?.token;
        if (t) tokens.push(t as string);
      });
    }

    return tokens;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helper: kirim notifikasi via FCM HTTP v1 melalui Firestore trigger
//
// Karena tidak ada Cloud Functions terpisah, kita tulis dokumen ke koleksi
// `notificationQueue` yang dapat dibaca oleh Cloud Functions atau
// diproses oleh trigger Firestore. Ini pola umum untuk student project.
//
// Jika ingin langsung memakai FCM REST API, ganti implementasi ini.
// ---------------------------------------------------------------------------

interface PayloadNotifikasi {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function kirimNotifikasi(payload: PayloadNotifikasi): Promise<void> {
  const validTokens = payload.tokens.filter(Boolean);
  if (validTokens.length === 0) return;

  try {
    // Simpan ke antrian — Cloud Functions akan mem-proses dan mengirim via FCM.
    await setDoc(
      doc(collection(firestore, 'notificationQueue')),
      {
        tokens: validTokens,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        createdAt: serverTimestamp(),
        status: 'pending',
      },
    );
  } catch (e) {
    console.warn('[notificationService] Gagal enqueue notifikasi:', e);
  }
}

// ---------------------------------------------------------------------------
// FR-12: Notifikasi ke praktikan kelas saat sesi dibuka
// ---------------------------------------------------------------------------

/**
 * Dipanggil setelah `bukaSesiDb` berhasil.
 *
 * @param kelasId       ID kelas yang terkait sesi.
 * @param mataPraktikum Nama mata praktikum untuk isi notifikasi.
 * @param sesiId        ID dokumen sesi (untuk deep-link opsional).
 */
export async function notifikasiSesiDibuka(
  kelasId: string,
  mataPraktikum: string,
  sesiId: string,
): Promise<void> {
  const tokens = await ambilTokenKelas(kelasId);
  if (tokens.length === 0) return;

  await kirimNotifikasi({
    tokens,
    title: '🔔 Sesi Praktikum Dibuka',
    body: `Sesi ${mataPraktikum} telah dibuka. Segera lakukan presensi!`,
    data: { type: 'sesi_dibuka', sesiId },
  });
}

// ---------------------------------------------------------------------------
// FR-13: Notifikasi ke praktikan kelas saat jadwal berubah
// ---------------------------------------------------------------------------

/**
 * Dipanggil setelah `ubahSesiDb` atau `ubahJadwal` berhasil.
 *
 * @param kelasId       ID kelas yang terkait jadwal/sesi.
 * @param mataPraktikum Nama mata praktikum.
 * @param sesiId        ID sesi (opsional, untuk deep-link).
 */
export async function notifikasiJadwalBerubah(
  kelasId: string,
  mataPraktikum: string,
  sesiId?: string,
): Promise<void> {
  const tokens = await ambilTokenKelas(kelasId);
  if (tokens.length === 0) return;

  await kirimNotifikasi({
    tokens,
    title: '📅 Jadwal Praktikum Diperbarui',
    body: `Jadwal sesi ${mataPraktikum} telah diperbarui. Cek detail terbaru.`,
    data: { type: 'jadwal_berubah', sesiId: sesiId ?? '' },
  });
}

// ---------------------------------------------------------------------------
// FR-14: Notifikasi ke praktikan pengaju saat izin diputuskan
// ---------------------------------------------------------------------------

/**
 * Dipanggil setelah `putuskanIzin` berhasil.
 *
 * @param uid           UID praktikan pengaju izin.
 * @param mataPraktikum Nama mata praktikum.
 * @param keputusan     'disetujui' | 'ditolak'
 * @param izinId        ID dokumen izin (untuk deep-link).
 */
export async function notifikasiKeputusanIzin(
  uid: string,
  mataPraktikum: string,
  keputusan: 'disetujui' | 'ditolak',
  izinId: string,
): Promise<void> {
  const token = await ambilToken(uid);
  if (!token) return;

  const disetujui = keputusan === 'disetujui';

  await kirimNotifikasi({
    tokens: [token],
    title: disetujui ? '✅ Izin Disetujui' : '❌ Izin Ditolak',
    body: disetujui
      ? `Izin praktikum ${mataPraktikum} Anda telah disetujui.`
      : `Izin praktikum ${mataPraktikum} Anda ditolak. Periksa keterangan asisten.`,
    data: { type: 'keputusan_izin', izinId, keputusan },
  });
}
