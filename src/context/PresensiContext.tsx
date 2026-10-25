import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  Sesi,
  sesiDummy,
  PraktikanRecord,
  dummyPresensiAwal,
  getWaktuSekarang,
  StatusSesi,
} from "../data/sesi";

export type Presensi = {
  sesiId: number;
  waktuHadir: string;
};

export type HasilPresensi = { ok: boolean; pesan: string };

type PresensiContextType = {
  daftarSesi: Sesi[];
  riwayat: Presensi[];
  daftarPresensiSemua: PraktikanRecord[];
  sudahPresensi: (sesiId: number) => boolean;
  lakukanPresensi: (
    sesiId: number,
    userInfo?: { nim?: string; nama?: string }
  ) => HasilPresensi;
  bukaSesi: (sesiId: number) => HasilPresensi;
  tutupSesi: (sesiId: number) => HasilPresensi;
  getRekapSesi: (sesiId: number) => PraktikanRecord[];
  simulasiPresensi: (sesiId: number) => HasilPresensi;
  kosongkanPresensi: (sesiId: number) => void;
  resetSemuaData: () => void;
};

const PresensiContext = createContext<PresensiContextType | null>(null);

const DUMMY_MAHASISWA_POOL = [
  { nim: "26060124140010", nama: "Dimas Anggara" },
  { nim: "26060124140015", nama: "Fajar Pratama" },
  { nim: "26060124140020", nama: "Gita Larasati" },
  { nim: "26060124140025", nama: "Hendra Wijaya" },
  { nim: "26060124140030", nama: "Indah Permata" },
  { nim: "26060124140035", nama: "Joko Santoso" },
];

export function PresensiProvider({ children }: { children: ReactNode }) {
  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>(sesiDummy);
  const [daftarPresensiSemua, setDaftarPresensiSemua] =
    useState<PraktikanRecord[]>(dummyPresensiAwal);
  const [riwayat, setRiwayat] = useState<Presensi[]>([
    { sesiId: 4, waktuHadir: "08.01.20 WIB" },
    { sesiId: 1, waktuHadir: "09.02.15 WIB" },
  ]);

  const sudahPresensi = (sesiId: number) =>
    riwayat.some((r) => r.sesiId === sesiId);

  // FR-13: Asisten dapat membuka sesi praktikum yang belum dibuka
  const bukaSesi = (sesiId: number): HasilPresensi => {
    const sesi = daftarSesi.find((s) => s.id === sesiId);
    if (!sesi) {
      return { ok: false, pesan: "Sesi tidak ditemukan." };
    }
    if (sesi.status !== "Belum Dibuka") {
      return {
        ok: false,
        pesan: `Sesi tidak dapat dibuka karena status saat ini "${sesi.status}".`,
      };
    }

    const jamBuka = getWaktuSekarang();
    setDaftarSesi((prev) =>
      prev.map((s) =>
        s.id === sesiId
          ? {
              ...s,
              status: "Sedang Berlangsung" as StatusSesi,
              waktuBuka: jamBuka,
            }
          : s
      )
    );

    return {
      ok: true,
      pesan: `Sesi "${sesi.mataPraktikum}" berhasil dibuka pada pukul ${jamBuka}!`,
    };
  };

  // FR-15: Asisten dapat menutup sesi praktikum setelah kegiatan selesai
  const tutupSesi = (sesiId: number): HasilPresensi => {
    const sesi = daftarSesi.find((s) => s.id === sesiId);
    if (!sesi) {
      return { ok: false, pesan: "Sesi tidak ditemukan." };
    }
    if (sesi.status !== "Sedang Berlangsung") {
      return {
        ok: false,
        pesan: `Hanya sesi dengan status "Sedang Berlangsung" yang dapat ditutup.`,
      };
    }

    const jamTutup = getWaktuSekarang();
    setDaftarSesi((prev) =>
      prev.map((s) =>
        s.id === sesiId
          ? {
              ...s,
              status: "Selesai" as StatusSesi,
              waktuTutup: jamTutup,
            }
          : s
      )
    );

    return {
      ok: true,
      pesan: `Sesi "${sesi.mataPraktikum}" telah berhasil ditutup pada pukul ${jamTutup}!`,
    };
  };

  // FR-14: Asisten dapat melihat rekap presensi per sesi
  const getRekapSesi = (sesiId: number): PraktikanRecord[] => {
    return daftarPresensiSemua.filter((p) => p.sesiId === sesiId);
  };

  // Mahasiswa / Praktikan melakukan presensi
  const lakukanPresensi = (
    sesiId: number,
    userInfo?: { nim?: string; nama?: string }
  ): HasilPresensi => {
    const sesi = daftarSesi.find((s) => s.id === sesiId);

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

    const waktuHadir = getWaktuSekarang();
    const nimUser = userInfo?.nim ?? "26060124140001";
    const namaUser = userInfo?.nama ?? "Amelia Putri";

    const rekapSesi = getRekapSesi(sesiId);
    const mejaNomor = (rekapSesi.length + 1).toString().padStart(2, "0");

    const presensiBaru: PraktikanRecord = {
      id: `pres-${Date.now()}`,
      sesiId,
      nim: nimUser,
      nama: namaUser,
      waktuHadir,
      statusKehadiran: "Tepat Waktu",
      mejaLab: `PC-${mejaNomor}`,
    };

    setRiwayat((prev) => [...prev, { sesiId, waktuHadir }]);
    setDaftarPresensiSemua((prev) => [presensiBaru, ...prev]);

    return { ok: true, pesan: `Presensi berhasil dicatat pada ${waktuHadir}!` };
  };

  // Simulasi presensi praktikan tambahan (memudahkan pengujian FR-14 & FR-17)
  const simulasiPresensi = (sesiId: number): HasilPresensi => {
    const sesi = daftarSesi.find((s) => s.id === sesiId);
    if (!sesi) return { ok: false, pesan: "Sesi tidak ditemukan." };

    if (sesi.status === "Belum Dibuka") {
      return {
        ok: false,
        pesan: "Presensi belum dapat dilakukan karena sesi belum dibuka!",
      };
    }
    if (sesi.status === "Selesai") {
      return {
        ok: false,
        pesan: "Presensi ditolak karena sesi praktikum telah selesai ditutup.",
      };
    }

    const rekap = getRekapSesi(sesiId);
    const existingNims = new Set(rekap.map((r) => r.nim));
    const candidate = DUMMY_MAHASISWA_POOL.find((m) => !existingNims.has(m.nim));

    const nim =
      candidate?.nim ?? `26060124140${Math.floor(100 + Math.random() * 900)}`;
    const nama = candidate?.nama ?? `Praktikan Mahasiswa ${rekap.length + 1}`;
    const waktuHadir = getWaktuSekarang();
    const mejaLab = `PC-${(rekap.length + 1).toString().padStart(2, "0")}`;

    const presensiBaru: PraktikanRecord = {
      id: `sim-${Date.now()}`,
      sesiId,
      nim,
      nama,
      waktuHadir,
      statusKehadiran: rekap.length >= 2 ? "Terlambat" : "Tepat Waktu",
      mejaLab,
    };

    setDaftarPresensiSemua((prev) => [presensiBaru, ...prev]);
    return {
      ok: true,
      pesan: `Presensi ${nama} (${nim}) berhasil dicatat pada ${waktuHadir}!`,
    };
  };

  // FR-17: Kosongkan presensi sesi ini untuk pengujian tampilan kosong
  const kosongkanPresensi = (sesiId: number) => {
    setDaftarPresensiSemua((prev) => prev.filter((p) => p.sesiId !== sesiId));
  };

  // Reset semua data ke mock default
  const resetSemuaData = () => {
    setDaftarSesi(sesiDummy);
    setDaftarPresensiSemua(dummyPresensiAwal);
    setRiwayat([
      { sesiId: 4, waktuHadir: "08.01.20 WIB" },
      { sesiId: 1, waktuHadir: "09.02.15 WIB" },
    ]);
  };

  return (
    <PresensiContext.Provider
      value={{
        daftarSesi,
        riwayat,
        daftarPresensiSemua,
        sudahPresensi,
        lakukanPresensi,
        bukaSesi,
        tutupSesi,
        getRekapSesi,
        simulasiPresensi,
        kosongkanPresensi,
        resetSemuaData,
      }}
    >
      {children}
    </PresensiContext.Provider>
  );
}

export function usePresensi() {
  const ctx = useContext(PresensiContext);
  if (!ctx) {
    throw new Error("usePresensi harus dipakai di dalam PresensiProvider");
  }
  return ctx;
}
