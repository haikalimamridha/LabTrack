import { createContext, ReactNode, useContext, useState } from "react";
import { Sesi, sesiDummy } from "../data/sesi";

export type Presensi = {
  sesiId: number;
  waktuHadir: string; // ISO string
};

export type HasilPresensi = { ok: boolean; pesan: string };

type PresensiContextType = {
  daftarSesi: Sesi[];
  riwayat: Presensi[];
  sudahPresensi: (sesiId: number) => boolean;
  lakukanPresensi: (sesiId: number) => HasilPresensi;
};

const PresensiContext = createContext<PresensiContextType | null>(null);

export function PresensiProvider({ children }: { children: ReactNode }) {
  const [riwayat, setRiwayat] = useState<Presensi[]>([]);

  const sudahPresensi = (sesiId: number) =>
    riwayat.some((r) => r.sesiId === sesiId);

  const lakukanPresensi = (sesiId: number): HasilPresensi => {
    const sesi = sesiDummy.find((s) => s.id === sesiId);

    if (!sesi) {
      return { ok: false, pesan: "Sesi tidak ditemukan." };
    }
    if (sesi.status !== "Sedang Berlangsung") {
      return { ok: false, pesan: "Presensi gagal: sesi tidak sedang dibuka." };
    }
    if (sudahPresensi(sesiId)) {
      return {
        ok: false,
        pesan: "Presensi gagal: kamu sudah presensi di sesi ini.",
      };
    }

    setRiwayat((prev) => [
      ...prev,
      { sesiId, waktuHadir: new Date().toISOString() },
    ]);
    return { ok: true, pesan: "Presensi berhasil dicatat!" };
  };

  return (
    <PresensiContext.Provider
      value={{ daftarSesi: sesiDummy, riwayat, sudahPresensi, lakukanPresensi }}
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
