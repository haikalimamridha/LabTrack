import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  catatKehadiran,
  pesanError,
  subscribeKehadiranSaya,
  subscribeSesi,
  type Hasil,
  type Sesi,
} from "../services/sessionService";
import { useAuth } from "./AuthContext";

export type Presensi = {
  sesiId: string;
  waktuHadir: string; // ISO string
};

export type HasilPresensi = Hasil;

type PresensiContextType = {
  daftarSesi: Sesi[];
  riwayat: Presensi[];
  loading: boolean;
  error: string | null;
  sudahPresensi: (sesiId: string) => boolean;
  lakukanPresensi: (sesiId: string) => Promise<HasilPresensi>;
};

const PresensiContext = createContext<PresensiContextType | null>(null);

export function PresensiProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const uid = profile?.uid ?? null;
  const kelasId = profile?.kelasId ?? null;
  const role = profile?.role ?? null;

  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>([]);
  const [riwayat, setRiwayat] = useState<Presensi[]>([]);
  const [sesiSiap, setSesiSiap] = useState(false);
  const [riwayatSiap, setRiwayatSiap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    // Belum login, bukan praktikan, atau belum punya kelas: tidak ada yang dimuat.
    if (!uid || !kelasId || role !== "praktikan") {
      setDaftarSesi([]);
      setRiwayat([]);
      setSesiSiap(true);
      setRiwayatSiap(true);
      return;
    }

    setSesiSiap(false);
    setRiwayatSiap(false);

    const onErr = (e: Error) => {
      console.error("Listener presensi gagal:", e);
      setError(pesanError(e, "Kamu tidak punya akses ke data ini."));
      setSesiSiap(true);
      setRiwayatSiap(true);
    };

    const stopSesi = subscribeSesi(
      kelasId,
      (data) => {
        setDaftarSesi(data);
        setSesiSiap(true);
      },
      onErr,
    );

    const stopRiwayat = subscribeKehadiranSaya(
      uid,
      (data) => {
        setRiwayat(
          data.map((k) => ({
            sesiId: k.sesiId,
            // Timestamp server bisa null sesaat sebelum dikonfirmasi server.
            waktuHadir: (k.waktu ?? new Date()).toISOString(),
          })),
        );
        setRiwayatSiap(true);
      },
      onErr,
    );

    // Wajib: hentikan listener saat logout / ganti akun / unmount.
    return () => {
      stopSesi();
      stopRiwayat();
    };
  }, [uid, kelasId, role]);

  const sudahPresensi = (sesiId: string) =>
    riwayat.some((r) => r.sesiId === sesiId);

  const lakukanPresensi = async (sesiId: string): Promise<HasilPresensi> => {
    if (!profile) {
      return { ok: false, pesan: "Kamu belum login." };
    }

    const sesi = daftarSesi.find((s) => s.id === sesiId);

    if (!sesi) {
      return { ok: false, pesan: "Sesi tidak ditemukan." };
    }
    if (sesi.statusDb !== "open") {
      return { ok: false, pesan: "Presensi gagal: sesi tidak sedang dibuka." };
    }
    if (sudahPresensi(sesiId)) {
      return {
        ok: false,
        pesan: "Presensi gagal: kamu sudah presensi di sesi ini.",
      };
    }

    try {
      await catatKehadiran(sesi, profile);
      return { ok: true, pesan: "Presensi berhasil dicatat!" };
    } catch (e) {
      console.error("Presensi gagal:", e);
      return {
        ok: false,
        pesan: pesanError(
          e,
          "Presensi gagal: sesi sudah ditutup atau kamu sudah presensi.",
        ),
      };
    }
  };

  return (
    <PresensiContext.Provider
      value={{
        daftarSesi,
        riwayat,
        loading: !(sesiSiap && riwayatSiap),
        error,
        sudahPresensi,
        lakukanPresensi,
      }}
    >
      {children}
    </PresensiContext.Provider>
  );
}

export function usePresensi() {
  const ctx = useContext(PresensiContext);
  if (!ctx)
    throw new Error("usePresensi harus dipakai di dalam PresensiProvider");
  return ctx;
}
