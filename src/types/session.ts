export type SessionStatus = 'Belum Dibuka' | 'Sedang Berlangsung' | 'Selesai';

export interface PraktikanPresensi {
  id: string;
  nim: string;
  nama: string;
  waktuKehadiran: string; // contoh: "08:05:22 WIB"
  statusKehadiran: 'Tepat Waktu' | 'Terlambat';
  mejaLab: string; // contoh: "PC-05"
}

export interface SesiPraktikum {
  id: string;
  kodeMK: string;
  namaMK: string;
  modul: string;
  deskripsiModul: string;
  kelas: string;
  kelompok: string;
  ruangLab: string;
  tanggal: string;
  waktuMulai: string; // contoh: "08:00"
  waktuSelesai: string; // contoh: "10:00"
  dosenPengampu: string;
  asistenBertugas: string[];
  status: SessionStatus;
  waktuBuka: string | null; // Waktu ketika asisten membuka sesi
  waktuTutup: string | null; // Waktu ketika asisten menutup sesi
  totalPraktikanTerdaftar: number;
  daftarPresensi: PraktikanPresensi[];
}
