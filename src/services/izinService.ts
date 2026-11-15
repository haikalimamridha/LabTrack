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
} from '@react-native-firebase/firestore';

import { firestore } from '@/config/firebase';
import type { UserProfile } from '@/context/AuthContext';
import { klasifikasiAlasanIzin } from './aiService';
import type { Sesi } from './sessionService';

// ---------------------------------------------------------------------------
// Tipe Data
// ---------------------------------------------------------------------------

export type StatusIzin = 'pending' | 'disetujui' | 'ditolak';

export interface PengajuanIzin {
  id: string;
  sesiId: string;
  kelasId: string;
  mataPraktikumId?: string;
  mataPraktikum: string;
  kode?: string;
  kelas?: string;
  tanggalSesi: string;
  waktuSesi: string;
  ruangan?: string;

  // Data praktikan
  uid: string;
  nama: string;
  nim: string;

  // Alasan & Integrasi AI (FR-07, FR-08)
  alasan: string;
  kategoriAi: string;
  penjelasanAi?: string;
  sumberAi?: 'api' | 'fallback';

  // Status & Keputusan Asisten (FR-09, FR-10)
  status: StatusIzin;
  catatanAsisten?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date | null;

  createdAt: Date | null;
  updatedAt?: Date | null;
}

export interface InputPengajuanIzin {
  sesi: Sesi;
  alasan: string;
  profile: Pick<UserProfile, 'uid' | 'nama' | 'nim' | 'kelasId'>;
}

export type HasilOperasi = { ok: boolean; pesan: string; id?: string };

// ---------------------------------------------------------------------------
// Helper Konversi
// ---------------------------------------------------------------------------

const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  if (typeof (v as { toDate?: unknown }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  if (v instanceof Date) return v;
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPengajuanIzin(id: string, d: Record<string, any>): PengajuanIzin {
  return {
    id,
    sesiId: d.sesiId ?? '',
    kelasId: d.kelasId ?? '',
    mataPraktikumId: d.mataPraktikumId ?? '',
    mataPraktikum: d.mataPraktikum ?? '',
    kode: d.kode ?? '',
    kelas: d.kelas ?? '',
    tanggalSesi: d.tanggalSesi ?? '',
    waktuSesi: d.waktuSesi ?? '',
    ruangan: d.ruangan ?? '',

    uid: d.uid ?? '',
    nama: d.nama ?? '',
    nim: d.nim ?? '',

    alasan: d.alasan ?? '',
    kategoriAi: d.kategoriAi ?? 'Belum Diklasifikasi',
    penjelasanAi: d.penjelasanAi ?? '',
    sumberAi: d.sumberAi ?? 'fallback',

    status: (d.status as StatusIzin) ?? 'pending',
    catatanAsisten: d.catatanAsisten ?? '',
    reviewedBy: d.reviewedBy ?? '',
    reviewedByName: d.reviewedByName ?? '',
    reviewedAt: toDate(d.reviewedAt),

    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// Operasi Praktikan (FR-07, FR-08, FR-10)
// ---------------------------------------------------------------------------

/**
 * Mengajukan izin ketidakhadiran praktikum.
 * - Memeriksa apakah praktikan sudah pernah mengajukan untuk sesi ini
 * - Menjalankan klasifikasi AI untuk mendapatkan rekomendasi kategori
 * - Menyimpan dokumen izin ke Firestore
 */
export async function ajukanIzinPraktikum(
  input: InputPengajuanIzin
): Promise<HasilOperasi> {
  const { sesi, alasan, profile } = input;

  if (!alasan || alasan.trim().length < 5) {
    return { ok: false, pesan: 'Alasan izin wajib diisi minimal 5 karakter.' };
  }

  if (!sesi || !sesi.id) {
    return { ok: false, pesan: 'Sesi praktikum tidak valid.' };
  }

  try {
    // 1. Cek apakah sudah ada pengajuan izin untuk sesi ini oleh praktikan yang sama
    const qCek = query(
      collection(firestore, 'izin'),
      where('sesiId', '==', sesi.id),
      where('uid', '==', profile.uid)
    );
    const existingSnap = await getDocs(qCek);
    if (!existingSnap.empty) {
      return {
        ok: false,
        pesan: 'Kamu sudah pernah mengajukan izin untuk sesi praktikum ini.',
      };
    }

    // 2. Integrasi AI (FR-08)
    const hasilAi = await klasifikasiAlasanIzin(alasan.trim());

    // 3. Simpan ke Firestore (FR-07)
    const docRef = await addDoc(collection(firestore, 'izin'), {
      sesiId: sesi.id,
      kelasId: sesi.kelasId || profile.kelasId || '',
      mataPraktikumId: sesi.mataPraktikumId || '',
      mataPraktikum: sesi.mataPraktikum || '',
      kode: sesi.kode || '',
      kelas: sesi.kelas || '',
      tanggalSesi: sesi.tanggal || '',
      waktuSesi: sesi.waktu || '',
      ruangan: sesi.ruangan || '',

      uid: profile.uid,
      nama: profile.nama,
      nim: profile.nim,

      alasan: alasan.trim(),
      kategoriAi: hasilAi.kategori,
      penjelasanAi: hasilAi.penjelasan || '',
      sumberAi: hasilAi.sumber,

      status: 'pending' as StatusIzin,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ok: true,
      pesan: `Izin berhasil diajukan! Kategori AI: ${hasilAi.kategori}`,
      id: docRef.id,
    };
  } catch (error) {
    console.error('Gagal mengajukan izin:', error);
    return {
      ok: false,
      pesan: 'Gagal mengajukan izin. Periksa koneksi internet Anda.',
    };
  }
}

/**
 * Real-time listener riwayat izin milik praktikan yang sedang login (FR-10).
 */
export function subscribeIzinPraktikan(
  uid: string,
  cb: (data: PengajuanIzin[]) => void,
  onError?: (e: Error) => void
): () => void {
  const q = query(collection(firestore, 'izin'), where('uid', '==', uid));

  return onSnapshot(
    q,
    (snap: any) => {
      const list = snap.docs.map((d: any) => toPengajuanIzin(d.id, d.data()));
      // Urutkan pengajuan terbaru di atas
      list.sort((a: PengajuanIzin, b: PengajuanIzin) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;
        return timeB - timeA;
      });
      cb(list);
    },
    (err: any) => {
      console.error('Error subscribe izin praktikan:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Membatalkan pengajuan izin (hanya jika masih berstatus pending).
 */
export async function batalkanIzin(izinId: string): Promise<HasilOperasi> {
  try {
    await deleteDoc(doc(firestore, 'izin', izinId));
    return { ok: true, pesan: 'Pengajuan izin berhasil dibatalkan.' };
  } catch (error) {
    console.error('Gagal membatalkan izin:', error);
    return { ok: false, pesan: 'Gagal membatalkan permohonan izin.' };
  }
}

// ---------------------------------------------------------------------------
// Operasi Asisten (FR-09, FR-10)
// ---------------------------------------------------------------------------

/**
 * Real-time listener seluruh permohonan izin untuk Asisten Praktikum.
 */
export function subscribeSemuaIzin(
  cb: (data: PengajuanIzin[]) => void,
  onError?: (e: Error) => void
): () => void {
  const colRef = collection(firestore, 'izin');

  return onSnapshot(
    colRef,
    (snap: any) => {
      const list = snap.docs.map((d: any) => toPengajuanIzin(d.id, d.data()));
      // Urutkan terbaru di atas
      list.sort((a: PengajuanIzin, b: PengajuanIzin) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;
        return timeB - timeA;
      });
      cb(list);
    },
    (err: any) => {
      console.error('Error subscribe semua izin:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Asisten memberikan keputusan (Disetujui / Ditolak) terhadap permohonan izin (FR-09).
 * Jika disetujui, otomatis dicatat di koleksi attendance dengan status "izin".
 */
export async function putuskanIzin(
  izin: PengajuanIzin,
  keputusan: 'disetujui' | 'ditolak',
  catatanAsisten = '',
  asisten?: Pick<UserProfile, 'uid' | 'nama'>
): Promise<HasilOperasi> {
  try {
    const izinRef = doc(firestore, 'izin', izin.id);

    // 1. Update status pada dokumen izin
    await updateDoc(izinRef, {
      status: keputusan,
      catatanAsisten: catatanAsisten.trim(),
      reviewedBy: asisten?.uid ?? 'asisten',
      reviewedByName: asisten?.nama ?? 'Asisten Praktikum',
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Jika disetujui, sinkronkan ke koleksi presensi (attendance) sebagai "izin"
    if (keputusan === 'disetujui' && izin.sesiId && izin.uid) {
      const attendanceRef = doc(
        firestore,
        'attendance',
        `${izin.sesiId}_${izin.uid}`
      );
      await setDoc(attendanceRef, {
        sessionId: izin.sesiId,
        kelasId: izin.kelasId,
        mataPraktikumId: izin.mataPraktikumId ?? '',
        uid: izin.uid,
        nama: izin.nama,
        nim: izin.nim,
        status: 'izin',
        createdAt: serverTimestamp(),
      });
    }

    const labelStatus = keputusan === 'disetujui' ? 'disetujui' : 'ditolak';
    return {
      ok: true,
      pesan: `Pengajuan izin ${izin.nama} berhasil ${labelStatus}.`,
    };
  } catch (error) {
    console.error('Gagal memproses keputusan izin:', error);
    return {
      ok: false,
      pesan: 'Terjadi kesalahan saat memproses keputusan izin.',
    };
  }
}
