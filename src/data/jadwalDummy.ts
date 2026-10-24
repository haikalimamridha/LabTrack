
export type Jadwal = {
  id: number;
  mataPraktikum: string;
  kode: string;
  tanggal: string;
  hari: string;
  waktu: string;
  ruangan: string;
  asisten: string;
  status: string;
};

export const jadwalDummy: Jadwal[] = [
  {
    id: 1,
    mataPraktikum: 'Praktikum Pemrograman Web',
    kode: 'IF204',
    tanggal: '22 Oktober 2026',
    hari: 'Kamis',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
    asisten: 'Andi Pratama',
    status: 'Akan Datang',
  },
  {
    id: 2,
    mataPraktikum: 'Praktikum Basis Data',
    kode: 'IF206',
    tanggal: '23 Oktober 2026',
    hari: 'Jumat',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
    asisten: 'Siti Rahma',
    status: 'Akan Datang',
  },
  {
    id: 3,
    mataPraktikum: 'Praktikum Algoritma',
    kode: 'IF202',
    tanggal: '26 Oktober 2026',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer 1',
    asisten: 'Budi Santoso',
    status: 'Akan Datang',
  },
  {
    id: 4,
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kode: 'IF208',
    tanggal: '20 Oktober 2026',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
    asisten: 'Dina Putri',
    status: 'Selesai',
  },
];
