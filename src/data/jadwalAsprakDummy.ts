export type JadwalAsprak = {
  id: number;
  kode: string;
  mataPraktikum: string;
  kelas: string;
  tanggal: string;
  hari: string;
  waktu: string;
  ruangan: string;
  status: string;
};

export const jadwalAsprakDummy: JadwalAsprak[] = [
  {
    id: 1,
    kode: 'IF204',
    mataPraktikum: 'Praktikum Pemrograman Web',
    kelas: 'A',
    tanggal: '22 Oktober 2026',
    hari: 'Kamis',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer B',
    status: 'Berlangsung',
  },
  {
    id: 2,
    kode: 'IF206',
    mataPraktikum: 'Praktikum Basis Data',
    kelas: 'B',
    tanggal: '23 Oktober 2026',
    hari: 'Jumat',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer C',
    status: 'Akan Datang',
  },
  {
    id: 3,
    kode: 'IF202',
    mataPraktikum: 'Praktikum Algoritma',
    kelas: 'A',
    tanggal: '26 Oktober 2026',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer D',
    status: 'Selesai',
  },
];