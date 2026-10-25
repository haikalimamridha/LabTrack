import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SesiPraktikum, SessionStatus, PraktikanPresensi } from '@/types/session';

interface SessionContextType {
  sessions: SesiPraktikum[];
  selectedSessionId: string;
  selectedSession: SesiPraktikum;
  setSelectedSessionId: (id: string) => void;
  bukaSesi: (sessionId: string) => { success: boolean; message: string };
  tutupSesi: (sessionId: string) => { success: boolean; message: string };
  simulasiPresensi: (sessionId: string) => { success: boolean; praktikan?: PraktikanPresensi; message: string };
  kosongkanPresensi: (sessionId: string) => void;
  resetSemuaData: () => void;
}

function getFormattedCurrentTime(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${hours}:${minutes}:${seconds} WIB`;
}

const INITIAL_SESSIONS: SesiPraktikum[] = [
  {
    id: 'SESI-PBO-01',
    kodeMK: 'IF2210',
    namaMK: 'Pemrograman Berorientasi Objek',
    modul: 'Modul 04: Polymorphism, Abstract Class & Interface',
    deskripsiModul:
      'Praktikum implementasi hierarki pewarisan, abstract method, dynamic method dispatch, serta pemanfaatan generic interface dalam bahasa Java.',
    kelas: 'Kelas B',
    kelompok: 'Shift Pagi (Kelompok 2)',
    ruangLab: 'Lab Rekayasa Perangkat Lunak (Gd. Ahmad Dahlan Lt. 3)',
    tanggal: 'Senin, 26 Oktober 2026',
    waktuMulai: '08:00',
    waktuSelesai: '10:00',
    dosenPengampu: 'Dr. Ir. Budi Rahardjo, M.T.',
    asistenBertugas: ['Levi R. (Asisten Utama)', 'Farhan Ramadhan (Asisten Pendamping)'],
    status: 'Belum Dibuka',
    waktuBuka: null,
    waktuTutup: null,
    totalPraktikanTerdaftar: 32,
    daftarPresensi: [], // Kosong untuk demonstrasi FR-17 & FR-13
  },
  {
    id: 'SESI-BDL-02',
    kodeMK: 'IF3130',
    namaMK: 'Basis Data Lanjut',
    modul: 'Modul 06: Query Optimization, Indexing & Triggers',
    deskripsiModul:
      'Praktikum pembuatan indeks B-Tree, analisis execution plan EXPLAIN ANALYZE pada PostgreSQL, dan implementasi stored procedure & audit triggers.',
    kelas: 'Kelas A',
    kelompok: 'Shift Siang (Kelompok 1)',
    ruangLab: 'Lab Basis Data & AI (Gd. Ahmad Dahlan Lt. 2)',
    tanggal: 'Senin, 26 Oktober 2026',
    waktuMulai: '10:30',
    waktuSelesai: '12:30',
    dosenPengampu: 'Prof. Siti Aminah, Ph.D.',
    asistenBertugas: ['Levi R. (Asisten Utama)', 'Aisyah Putri (Asisten Pendamping)'],
    status: 'Sedang Berlangsung',
    waktuBuka: '10:30:15 WIB',
    waktuTutup: null,
    totalPraktikanTerdaftar: 30,
    daftarPresensi: [
      {
        id: 'p1',
        nim: '13523001',
        nama: 'Aditya Pratama Putra',
        waktuKehadiran: '10:31:08 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-01',
      },
      {
        id: 'p2',
        nim: '13523014',
        nama: 'Bernadette Evelyn Salim',
        waktuKehadiran: '10:32:45 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-02',
      },
      {
        id: 'p3',
        nim: '13523027',
        nama: 'Citra Dewi Anggraini',
        waktuKehadiran: '10:34:20 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-03',
      },
      {
        id: 'p4',
        nim: '13523042',
        nama: 'Dimas Wahyu Ramadhan',
        waktuKehadiran: '10:46:12 WIB',
        statusKehadiran: 'Terlambat',
        mejaLab: 'PC-04',
      },
      {
        id: 'p5',
        nim: '13523055',
        nama: 'Elang Satria Baskara',
        waktuKehadiran: '10:48:33 WIB',
        statusKehadiran: 'Terlambat',
        mejaLab: 'PC-05',
      },
      {
        id: 'p6',
        nim: '13523068',
        nama: 'Fiona Putri Maharani',
        waktuKehadiran: '10:51:04 WIB',
        statusKehadiran: 'Terlambat',
        mejaLab: 'PC-06',
      },
    ],
  },
  {
    id: 'SESI-JK-03',
    kodeMK: 'IF3220',
    namaMK: 'Jaringan Komputer & Keamanan Siber',
    modul: 'Modul 02: VLAN Trunking & Dynamic Routing OSPF',
    deskripsiModul:
      'Praktikum konfigurasi perangkat Cisco Router & Switch, 802.1Q trunking antar-switch, dan dynamic routing OSPF area 0.',
    kelas: 'Kelas C',
    kelompok: 'Shift Sore (Kelompok 3)',
    ruangLab: 'Lab Jaringan & Sistem Komputer (Gd. Ahmad Dahlan Lt. 4)',
    tanggal: 'Jumat, 23 Oktober 2026',
    waktuMulai: '13:30',
    waktuSelesai: '15:30',
    dosenPengampu: 'Hendra Gunawan, S.T., M.Kom.',
    asistenBertugas: ['Levi R. (Asisten Utama)', 'Rian Hidayat (Asisten Pendamping)'],
    status: 'Selesai',
    waktuBuka: '13:30:00 WIB',
    waktuTutup: '15:32:40 WIB',
    totalPraktikanTerdaftar: 25,
    daftarPresensi: [
      {
        id: 'p7',
        nim: '13523008',
        nama: 'Gita Saraswati',
        waktuKehadiran: '13:30:55 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-01',
      },
      {
        id: 'p8',
        nim: '13523019',
        nama: 'Haris Munandar',
        waktuKehadiran: '13:31:40 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-02',
      },
      {
        id: 'p9',
        nim: '13523033',
        nama: 'Indah Permatasari',
        waktuKehadiran: '13:33:18 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-03',
      },
      {
        id: 'p10',
        nim: '13523049',
        nama: 'Joko Widodo Susanto',
        waktuKehadiran: '13:35:00 WIB',
        statusKehadiran: 'Tepat Waktu',
        mejaLab: 'PC-04',
      },
      {
        id: 'p11',
        nim: '13523062',
        nama: 'Kartika Chandra',
        waktuKehadiran: '13:47:15 WIB',
        statusKehadiran: 'Terlambat',
        mejaLab: 'PC-05',
      },
      {
        id: 'p12',
        nim: '13523077',
        nama: 'Lutfi Hakim',
        waktuKehadiran: '13:50:22 WIB',
        statusKehadiran: 'Terlambat',
        mejaLab: 'PC-06',
      },
    ],
  },
];

// Mahasiswa pool untuk simulasi presensi interaktif
const MAHASISWA_POOL = [
  { nim: '13523081', nama: 'M. Rizky Ramadhan' },
  { nim: '13523088', nama: 'Nadia Nurhaliza' },
  { nim: '13523095', nama: 'Oscar Pratama' },
  { nim: '13523102', nama: 'Putri Handayani' },
  { nim: '13523110', nama: 'Qori Alamsyah' },
  { nim: '13523118', nama: 'Rafi Ahmad Fauzi' },
  { nim: '13523125', nama: 'Siti Nur Aini' },
  { nim: '13523133', nama: 'Taufik Hidayat' },
  { nim: '13523140', nama: 'Umar Wirahadikusuma' },
  { nim: '13523149', nama: 'Vina Panduwinata' },
];

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<SesiPraktikum[]>(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(INITIAL_SESSIONS[0].id);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  // FR-13: Asisten dapat membuka sesi praktikum yang belum dibuka
  const bukaSesi = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }
    if (session.status !== 'Belum Dibuka') {
      return {
        success: false,
        message: `Sesi tidak dapat dibuka karena status saat ini adalah "${session.status}".`,
      };
    }

    const waktuSekarang = getFormattedCurrentTime();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'Sedang Berlangsung' as SessionStatus,
              waktuBuka: waktuSekarang,
            }
          : s
      )
    );

    return {
      success: true,
      message: `Sesi praktikum "${session.namaMK}" berhasil dibuka pada pukul ${waktuSekarang}.`,
    };
  };

  // FR-15: Asisten dapat menutup sesi praktikum setelah kegiatan selesai
  const tutupSesi = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Sesi praktikum tidak ditemukan.' };
    }
    if (session.status !== 'Sedang Berlangsung') {
      return {
        success: false,
        message: `Hanya sesi dengan status "Sedang Berlangsung" yang dapat ditutup. Status saat ini: "${session.status}".`,
      };
    }

    const waktuSekarang = getFormattedCurrentTime();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'Selesai' as SessionStatus,
              waktuTutup: waktuSekarang,
            }
          : s
      )
    );

    return {
      success: true,
      message: `Sesi praktikum "${session.namaMK}" telah berhasil ditutup pada pukul ${waktuSekarang}.`,
    };
  };

  // Fitur simulasi presensi (membantu pengujian FR-14 dan FR-17)
  const simulasiPresensi = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Sesi tidak ditemukan.' };
    }

    if (session.status === 'Belum Dibuka') {
      return {
        success: false,
        message: 'Presensi belum dapat dilakukan karena sesi praktikum belum dibuka!',
      };
    }

    if (session.status === 'Selesai') {
      return {
        success: false,
        message: 'Presensi tidak dapat dilakukan karena sesi praktikum telah selesai ditutup.',
      };
    }

    // Ambil praktikan yang belum terpresensi
    const currentNims = new Set(session.daftarPresensi.map((p) => p.nim));
    const kandidat = MAHASISWA_POOL.find((m) => !currentNims.has(m.nim));

    if (!kandidat) {
      // Jika pool habis, buat data acak baru
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const baru: PraktikanPresensi = {
        id: `sim-${Date.now()}`,
        nim: `13523${randomId.toString().slice(0, 3)}`,
        nama: `Mahasiswa Praktikan ${session.daftarPresensi.length + 1}`,
        waktuKehadiran: getFormattedCurrentTime(),
        statusKehadiran: session.daftarPresensi.length % 3 === 0 ? 'Terlambat' : 'Tepat Waktu',
        mejaLab: `PC-${(session.daftarPresensi.length + 1).toString().padStart(2, '0')}`,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, daftarPresensi: [baru, ...s.daftarPresensi] }
            : s
        )
      );

      return {
        success: true,
        praktikan: baru,
        message: `Presensi berhasil dicatat untuk ${baru.nama} (${baru.nim}) pada ${baru.waktuKehadiran}.`,
      };
    }

    const mejaNomor = (session.daftarPresensi.length + 1).toString().padStart(2, '0');
    const baru: PraktikanPresensi = {
      id: `sim-${Date.now()}-${kandidat.nim}`,
      nim: kandidat.nim,
      nama: kandidat.nama,
      waktuKehadiran: getFormattedCurrentTime(),
      statusKehadiran: session.daftarPresensi.length >= 3 ? 'Terlambat' : 'Tepat Waktu',
      mejaLab: `PC-${mejaNomor}`,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, daftarPresensi: [baru, ...s.daftarPresensi] }
          : s
      )
    );

    return {
      success: true,
      praktikan: baru,
      message: `Presensi berhasil dicatat untuk ${baru.nama} (${baru.nim}) pada ${baru.waktuKehadiran}.`,
    };
  };

  // Mengosongkan presensi sesi ini (untuk mempermudah verifikasi FR-17: Empty State)
  const kosongkanPresensi = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, daftarPresensi: [] } : s))
    );
  };

  // Reset semua data ke mock default
  const resetSemuaData = () => {
    setSessions(INITIAL_SESSIONS);
    setSelectedSessionId(INITIAL_SESSIONS[0].id);
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        selectedSessionId,
        selectedSession,
        setSelectedSessionId,
        bukaSesi,
        tutupSesi,
        simulasiPresensi,
        kosongkanPresensi,
        resetSemuaData,
      }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext harus digunakan di dalam SessionProvider');
  }
  return context;
}
