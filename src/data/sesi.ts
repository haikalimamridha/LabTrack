export type StatusSesi = "Belum Dibuka" | "Sedang Berlangsung" | "Selesai";

export type PraktikanRecord = {
  id: string;
  sesiId: number;
  nim: string;
  nama: string;
  waktuHadir: string; // contoh: "09.15.24 WIB"
  statusKehadiran: "Tepat Waktu" | "Terlambat";
  mejaLab: string; // contoh: "PC-04"
};

export type Sesi = {
  id: number;
  mataPraktikum: string;
  kode: string;
  modul?: string;
  deskripsiModul?: string;
  kelas: string;
  tanggal: string;
  hari: string;
  waktu: string;
  ruangan: string;
  dosen?: string;
  asisten?: string;
  status: StatusSesi;
  waktuBuka?: string | null;
  waktuTutup?: string | null;
  totalPraktikan: number;
};

// Data dummy sesi praktikum
export const sesiDummy: Sesi[] = [
  {
    id: 1,
    mataPraktikum: "Praktikum Pemrograman Web",
    kode: "IF204",
    modul: "Modul 04: REST API, Authentication & Fetch",
    deskripsiModul:
      "Praktikum pembuatan endpoint API dengan Express.js, JWT Authentication, dan integrasi dengan antarmuka frontend.",
    kelas: "A",
    tanggal: "24 Oktober 2026",
    hari: "Sabtu",
    waktu: "09.00 - 11.00",
    ruangan: "Lab Komputer 1",
    dosen: "Dr. Ir. Budi Rahardjo, M.T.",
    asisten: "Bagas Saputra & Andi Pratama",
    status: "Sedang Berlangsung",
    waktuBuka: "09.00.12 WIB",
    waktuTutup: null,
    totalPraktikan: 30,
  },
  {
    id: 2,
    mataPraktikum: "Praktikum Basis Data",
    kode: "IF206",
    modul: "Modul 06: Query Optimization & Triggers",
    deskripsiModul:
      "Praktikum pembuatan indeks B-Tree, analisis execution plan EXPLAIN ANALYZE, dan pembuatan stored procedure.",
    kelas: "B",
    tanggal: "24 Oktober 2026",
    hari: "Sabtu",
    waktu: "13.00 - 15.00",
    ruangan: "Lab Komputer 2",
    dosen: "Prof. Siti Aminah, Ph.D.",
    asisten: "Nadia Rahmawati",
    status: "Sedang Berlangsung",
    waktuBuka: "13.01.05 WIB",
    waktuTutup: null,
    totalPraktikan: 28,
  },
  {
    id: 3,
    mataPraktikum: "Praktikum Algoritma",
    kode: "IF202",
    modul: "Modul 03: Divide and Conquer & Dynamic Programming",
    deskripsiModul:
      "Praktikum implementasi Merge Sort, Quick Sort, Knapsack Problem, dan analisis kompleksitas Big-O.",
    kelas: "A",
    tanggal: "26 Oktober 2026",
    hari: "Senin",
    waktu: "10.00 - 12.00",
    ruangan: "Lab Komputer 1",
    dosen: "Hendra Gunawan, M.Kom.",
    asisten: "Bagas Saputra",
    status: "Belum Dibuka",
    waktuBuka: null,
    waktuTutup: null,
    totalPraktikan: 32,
  },
  {
    id: 4,
    mataPraktikum: "Praktikum Jaringan Komputer",
    kode: "IF208",
    modul: "Modul 02: VLAN Trunking & Dynamic Routing OSPF",
    deskripsiModul:
      "Praktikum konfigurasi perangkat Cisco Router & Switch, 802.1Q trunking, dan dynamic routing OSPF.",
    kelas: "C",
    tanggal: "20 Oktober 2026",
    hari: "Selasa",
    waktu: "08.00 - 10.00",
    ruangan: "Lab Jaringan",
    dosen: "Ahmad Fauzi, M.T.",
    asisten: "Andi Pratama",
    status: "Selesai",
    waktuBuka: "08.00.00 WIB",
    waktuTutup: "10.02.15 WIB",
    totalPraktikan: 25,
  },
];

export const dummyPresensiAwal: PraktikanRecord[] = [
  {
    id: "pres-1",
    sesiId: 1,
    nim: "26060124140001",
    nama: "Amelia Putri",
    waktuHadir: "09.02.15 WIB",
    statusKehadiran: "Tepat Waktu",
    mejaLab: "PC-01",
  },
  {
    id: "pres-2",
    sesiId: 1,
    nim: "26060124140002",
    nama: "Nabila Ramadhani",
    waktuHadir: "09.04.40 WIB",
    statusKehadiran: "Tepat Waktu",
    mejaLab: "PC-02",
  },
  {
    id: "pres-3",
    sesiId: 1,
    nim: "25060124140003",
    nama: "Rizky Firmansyah",
    waktuHadir: "09.18.30 WIB",
    statusKehadiran: "Terlambat",
    mejaLab: "PC-03",
  },
  {
    id: "pres-4",
    sesiId: 2,
    nim: "26060124140001",
    nama: "Amelia Putri",
    waktuHadir: "13.05.12 WIB",
    statusKehadiran: "Tepat Waktu",
    mejaLab: "PC-01",
  },
  {
    id: "pres-5",
    sesiId: 4,
    nim: "26060124140001",
    nama: "Amelia Putri",
    waktuHadir: "08.01.20 WIB",
    statusKehadiran: "Tepat Waktu",
    mejaLab: "PC-01",
  },
  {
    id: "pres-6",
    sesiId: 4,
    nim: "26060124140002",
    nama: "Nabila Ramadhani",
    waktuHadir: "08.03.11 WIB",
    statusKehadiran: "Tepat Waktu",
    mejaLab: "PC-02",
  },
  {
    id: "pres-7",
    sesiId: 4,
    nim: "25060124140003",
    nama: "Rizky Firmansyah",
    waktuHadir: "08.16.50 WIB",
    statusKehadiran: "Terlambat",
    mejaLab: "PC-03",
  },
];

export function formatJam(iso: string): string {
  if (iso.includes("WIB")) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())} WIB`;
}

export function getWaktuSekarang(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(now.getHours())}.${p(now.getMinutes())}.${p(now.getSeconds())} WIB`;
}
