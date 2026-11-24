import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  buatSesi,
  bukaSesiDb,
  hapusSesiDb,
  pesanError,
  subscribeKehadiranSesi,
  subscribePesertaKelas,
  subscribeSesi,
  tutupSesiDb,
  ubahSesiDb,
  type Hasil,
  type Kehadiran,
  type Peserta,
  type Sesi,
  type SesiInput,
} from "../services/sessionService";
import {
  notifikasiJadwalBerubah,
  notifikasiSesiDibuka,
} from "../services/notificationService";
import { useAuth } from "./AuthContext";

type SesiContextType = {
  daftarSesi: Sesi[];
  loading: boolean;
  error: string | null;
  bukaSesi: (id: string) => Promise<Hasil>;
  tutupSesi: (id: string) => Promise<Hasil>;
  tambahSesi: (input: SesiInput) => Promise<Hasil>;
  ubahSesi: (id: string, input: Partial<SesiInput>) => Promise<Hasil>;
  hapusSesi: (id: string) => Promise<Hasil>;
};

const SesiContext = createContext<SesiContextType | undefined>(undefined);

async function jalankan(
  aksi: () => Promise<unknown>,
  pesanSukses: string,
): Promise<Hasil> {
  try {
    await aksi();
    return { ok: true, pesan: pesanSukses };
  } catch (e) {
    console.error("Aksi sesi gagal:", e);
    return {
      ok: false,
      pesan: pesanError(e, "Kamu tidak punya izin untuk aksi ini."),
    };
  }
}

export function SesiProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const uid = profile?.uid ?? null;
  const role = profile?.role ?? null;

  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    // Hanya asprak yang memuat semua sesi.
    if (!uid || role !== "asprak") {
      setDaftarSesi([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const stop = subscribeSesi(
      null,
      (data) => {
        setDaftarSesi(data);
        setLoading(false);
      },
      (e) => {
        console.error("Listener sesi gagal:", e);
        setError(pesanError(e, "Kamu tidak punya akses ke data sesi."));
        setLoading(false);
      },
    );

    return stop;
  }, [uid, role]);

  // FR-12: Buka sesi + kirim notifikasi ke praktikan kelas
  const bukaSesi = async (id: string): Promise<Hasil> => {
    const sesi = daftarSesi.find((s) => s.id === id);
    if (!sesi) return { ok: false, pesan: "Sesi tidak ditemukan." };
    if (sesi.statusDb !== "draft")
      return {
        ok: false,
        pesan: 'Hanya sesi "Belum Dibuka" yang dapat dibuka.',
      };
    const hasil = await jalankan(() => bukaSesiDb(id), "Sesi dibuka.");
    if (hasil.ok) {
      // Fire-and-forget: gagal kirim notifikasi tidak batalkan aksi
      void notifikasiSesiDibuka(sesi.kelasId, sesi.mataPraktikum, id);
    }
    return hasil;
  };

  const tutupSesi = async (id: string): Promise<Hasil> => {
    const sesi = daftarSesi.find((s) => s.id === id);
    if (!sesi) return { ok: false, pesan: "Sesi tidak ditemukan." };
    if (sesi.statusDb !== "open")
      return {
        ok: false,
        pesan: "Hanya sesi yang sedang berlangsung yang dapat ditutup.",
      };
    return jalankan(() => tutupSesiDb(id), "Sesi ditutup.");
  };

  const tambahSesi = (input: SesiInput) =>
    jalankan(() => buatSesi(input), "Sesi ditambahkan.");

  // FR-13: Ubah sesi + kirim notifikasi jadwal berubah
  const ubahSesi = async (id: string, input: Partial<SesiInput>): Promise<Hasil> => {
    const sesi = daftarSesi.find((s) => s.id === id);
    const hasil = await jalankan(() => ubahSesiDb(id, input), "Sesi diperbarui.");
    if (hasil.ok && sesi) {
      void notifikasiJadwalBerubah(sesi.kelasId, sesi.mataPraktikum, id);
    }
    return hasil;
  };

  const hapusSesi = (id: string) =>
    jalankan(() => hapusSesiDb(id), "Sesi dihapus.");

  return (
    <SesiContext.Provider
      value={{
        daftarSesi,
        loading,
        error,
        bukaSesi,
        tutupSesi,
        tambahSesi,
        ubahSesi,
        hapusSesi,
      }}
    >
      {children}
    </SesiContext.Provider>
  );
}

export function useSesi() {
  const context = useContext(SesiContext);

  if (!context) {
    throw new Error("useSesi harus digunakan di dalam SesiProvider");
  }

  return context;
}

/**
 * Rekap kehadiran real-time untuk satu sesi (layar asprak).
 * Mengembalikan daftar yang sudah hadir dan daftar seluruh peserta kelas,
 * sehingga layar bisa menampilkan "hadir X dari Y" dan siapa yang belum hadir.
 */
export function useRekapSesi(sesi: Sesi | null | undefined) {
  const sesiId = sesi?.id ?? null;
  const kelasId = sesi?.kelasId ?? null;

  const [kehadiran, setKehadiran] = useState<Kehadiran[]>([]);
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    if (!sesiId || !kelasId) {
      setKehadiran([]);
      setPeserta([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const stopKehadiran = subscribeKehadiranSesi(
      sesiId,
      (data) => {
        setKehadiran(data);
        setLoading(false);
      },
      (e) => {
        console.error("Listener rekap gagal:", e);
        setError(pesanError(e, "Kamu tidak punya akses ke rekap ini."));
        setLoading(false);
      },
    );

    // Daftar peserta bersifat pelengkap: kalau gagal, rekap tetap tampil.
    const stopPeserta = subscribePesertaKelas(kelasId, setPeserta, (e) => {
      console.warn("Daftar peserta tidak dapat dimuat:", e);
      setPeserta([]);
    });

    return () => {
      stopKehadiran();
      stopPeserta();
    };
  }, [sesiId, kelasId]);

  const hadirUid = new Set(kehadiran.map((k) => k.uid));
  const belumHadir = peserta.filter((p) => !hadirUid.has(p.uid));

  return { kehadiran, peserta, belumHadir, loading, error };
}
