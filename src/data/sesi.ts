export type StatusSesi = "Belum Dibuka" | "Sedang Berlangsung" | "Selesai";

export type Sesi = {
  id: number;
  mataPraktikum: string;
  kode: string;
  kelas: string;
  tanggal: string;
  hari: string;
  waktu: string;
  ruangan: string;
  status: StatusSesi;
};

// Data dummy khusus modul presensi praktikan.
// Status sengaja dibuat berbeda-beda supaya semua kondisi tombol bisa didemokan.
export const sesiDummy: Sesi[] = [
  {
    id: 1,
    mataPraktikum: "Praktikum Pemrograman Web",
    kode: "IF204",
    kelas: "A",
    tanggal: "24 Oktober 2026",
    hari: "Sabtu",
    waktu: "09.00 - 11.00",
    ruangan: "Lab Komputer 1",
    status: "Sedang Berlangsung",
  },
  {
    id: 2,
    mataPraktikum: "Praktikum Basis Data",
    kode: "IF206",
    kelas: "B",
    tanggal: "24 Oktober 2026",
    hari: "Sabtu",
    waktu: "13.00 - 15.00",
    ruangan: "Lab Komputer 2",
    status: "Sedang Berlangsung",
  },
  {
    id: 3,
    mataPraktikum: "Praktikum Algoritma",
    kode: "IF202",
    kelas: "A",
    tanggal: "26 Oktober 2026",
    hari: "Senin",
    waktu: "10.00 - 12.00",
    ruangan: "Lab Komputer 1",
    status: "Belum Dibuka",
  },
  {
    id: 4,
    mataPraktikum: "Praktikum Jaringan Komputer",
    kode: "IF208",
    kelas: "C",
    tanggal: "20 Oktober 2026",
    hari: "Selasa",
    waktu: "08.00 - 10.00",
    ruangan: "Lab Jaringan",
    status: "Selesai",
  },
];

export function formatJam(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
}
