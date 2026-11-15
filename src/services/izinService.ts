
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
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

  // Alasan dan hasil analisis AI
  alasan: string;
  sentimenAi?: 'positif' | 'netral' | 'negatif' | null;
  penjelasanAi?: string;
  sumberAi?: 'model-edom' | 'fallback';

  // Status dan keputusan Asprak
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

export type HasilOperasi = {
  ok: boolean;
  pesan: string;
  id?: string;
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const toDate = (value: unknown): Date | null => {
  if (!value) return null;

  if (
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (value instanceof Date) return value;

  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPengajuanIzin(
  id: string,
  data: Record<string, any>
): PengajuanIzin {
  return {
    id,
    sesiId: data.sesiId ?? '',
    kelasId: data.kelasId ?? '',
    mataPraktikumId: data.mataPraktikumId ?? '',
    mataPraktikum: data.mataPraktikum ?? '',
    kode: data.kode ?? '',
    kelas: data.kelas ?? '',
    tanggalSesi: data.tanggalSesi ?? '',
    waktuSesi: data.waktuSesi ?? '',
    ruangan: data.ruangan ?? '',

    uid: data.uid ?? '',
    nama: data.nama ?? '',
    nim: data.nim ?? '',

    alasan: data.alasan ?? '',
    sentimenAi: data.sentimenAi ?? data.penjelasanAi?.match(/sentimen (positif|netral|negatif)/i)?.[1]?.toLowerCase() ?? null,
    penjelasanAi: data.penjelasanAi ?? '',
    sumberAi: data.sumberAi ?? 'fallback',

    status: data.status ?? 'pending',
    catatanAsisten: data.catatanAsisten ?? '',
    reviewedBy: data.reviewedBy ?? '',
    reviewedByName: data.reviewedByName ?? '',
    reviewedAt: toDate(data.reviewedAt),

    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// Pengajuan Izin Praktikan (FR-07, FR-08)
// ---------------------------------------------------------------------------

export async function ajukanIzinPraktikum(
  input: InputPengajuanIzin
): Promise<HasilOperasi> {
  const { sesi, alasan, profile } = input;
  const alasanBersih = alasan?.trim() ?? '';

  // Validasi alasan
  if (alasanBersih.length < 5) {
    return {
      ok: false,
      pesan: 'Alasan izin wajib diisi minimal 5 karakter.',
    };
  }

  // Validasi sesi
  if (!sesi?.id) {
    return {
      ok: false,
      pesan: 'Sesi praktikum tidak valid.',
    };
  }

  // Validasi profil
  if (!profile?.uid) {
    return {
      ok: false,
      pesan: 'Profil pengguna tidak valid.',
    };
  }

  try {
    // 1. Periksa apakah praktikan sudah mengajukan izin
    // untuk sesi yang sama
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

    // 2. Klasifikasi alasan menggunakan model EDOM lokal
    const hasilAi = await klasifikasiAlasanIzin(alasanBersih);

    // 3. Simpan pengajuan ke Firestore
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

      alasan: alasanBersih,
      sentimenAi: hasilAi.sentimen ?? null,
      penjelasanAi: hasilAi.penjelasan || '',
      sumberAi: hasilAi.sumber,

      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ok: true,
      pesan: 'Pengajuan izin berhasil dikirim.',
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

// ---------------------------------------------------------------------------
// Riwayat Izin Praktikan (FR-10)
// ---------------------------------------------------------------------------

export function subscribeIzinPraktikan(
  uid: string,
  cb: (data: PengajuanIzin[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(firestore, 'izin'),
    where('uid', '==', uid)
  );

  return onSnapshot(
    q,
    (snap: any) => {
      const list: PengajuanIzin[] = snap.docs.map(
        (d: any) => toPengajuanIzin(d.id, d.data())
      );

      list.sort((a, b) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;

        return timeB - timeA;
      });

      cb(list);
    },
    (error: any) => {
      console.error('Error subscribe izin praktikan:', error);
      onError?.(error);
    }
  );
}

// ---------------------------------------------------------------------------
// Pembatalan Izin Praktikan
// ---------------------------------------------------------------------------

export async function batalkanIzin(
  izinId: string
): Promise<HasilOperasi> {
  if (!izinId) {
    return {
      ok: false,
      pesan: 'ID pengajuan izin tidak valid.',
    };
  }

  try {
    await deleteDoc(doc(firestore, 'izin', izinId));

    return {
      ok: true,
      pesan: 'Pengajuan izin berhasil dibatalkan.',
    };
  } catch (error) {
    console.error('Gagal membatalkan izin:', error);

    return {
      ok: false,
      pesan: 'Gagal membatalkan permohonan izin.',
    };
  }
}

// ---------------------------------------------------------------------------
// Daftar Semua Izin untuk Asprak (FR-09)
// ---------------------------------------------------------------------------

export function subscribeSemuaIzin(
  cb: (data: PengajuanIzin[]) => void,
  onError?: (error: Error) => void
): () => void {
  const colRef = collection(firestore, 'izin');

  return onSnapshot(
    colRef,
    (snap: any) => {
      const list: PengajuanIzin[] = snap.docs.map(
        (d: any) => toPengajuanIzin(d.id, d.data())
      );

      list.sort((a, b) => {
        const timeA = a.createdAt?.getTime() ?? 0;
        const timeB = b.createdAt?.getTime() ?? 0;

        return timeB - timeA;
      });

      cb(list);
    },
    (error: any) => {
      console.error('Error subscribe semua izin:', error);
      onError?.(error);
    }
  );
}

// ---------------------------------------------------------------------------
// Keputusan Izin oleh Asprak (FR-09)
// ---------------------------------------------------------------------------

export async function putuskanIzin(
  izin: PengajuanIzin,
  keputusan: 'disetujui' | 'ditolak',
  catatanAsisten = '',
  asisten?: Pick<UserProfile, 'uid' | 'nama'>
): Promise<HasilOperasi> {
  if (!izin?.id) {
    return {
      ok: false,
      pesan: 'Data pengajuan izin tidak valid.',
    };
  }

  try {
    const izinRef = doc(firestore, 'izin', izin.id);

    // ID attendance mengikuti pola pada sessionService.ts:
    // `${sesiId}_${uid}`
    const attendanceRef = doc(
      firestore,
      'attendance',
      `${izin.sesiId}_${izin.uid}`
    );

    await runTransaction(firestore, async (transaction) => {
      // 1. Ambil data pengajuan terbaru
      const izinSnap = await transaction.get(izinRef);

      if (!izinSnap.exists()) {
        throw new Error('Pengajuan izin tidak ditemukan.');
      }

      const dataIzin = izinSnap.data();

      // 2. Pastikan pengajuan belum diproses
      if (dataIzin.status !== 'pending') {
        throw new Error('Pengajuan izin sudah diproses sebelumnya.');
      }

      // 3. Jika disetujui, periksa dan buat attendance
      if (keputusan === 'disetujui') {
        if (!dataIzin.sesiId || !dataIzin.uid) {
          throw new Error('Data sesi atau pengguna tidak lengkap.');
        }

        const attendanceSnap = await transaction.get(attendanceRef);

        // Jangan menimpa presensi yang sudah ada
        if (attendanceSnap.exists()) {
          throw new Error(
            'Praktikan sudah memiliki catatan presensi untuk sesi ini.'
          );
        }

        transaction.set(attendanceRef, {
          sessionId: dataIzin.sesiId,
          kelasId: dataIzin.kelasId ?? '',
          mataPraktikumId: dataIzin.mataPraktikumId ?? '',
          uid: dataIzin.uid,
          nama: dataIzin.nama ?? '',
          nim: dataIzin.nim ?? '',
          status: 'izin',
          createdAt: serverTimestamp(),
        });
      }

      // 4. Perbarui status pengajuan izin
      transaction.update(izinRef, {
        status: keputusan,
        catatanAsisten: catatanAsisten.trim(),
        reviewedBy: asisten?.uid ?? 'asisten',
        reviewedByName: asisten?.nama ?? 'Asisten Praktikum',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    return {
      ok: true,
      pesan: `Pengajuan izin ${izin.nama} berhasil ${
        keputusan === 'disetujui' ? 'disetujui' : 'ditolak'
      }.`,
    };
  } catch (error) {
    console.error('Gagal memproses keputusan izin:', error);

    return {
      ok: false,
      pesan:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memproses keputusan izin.',
    };
  }
}
