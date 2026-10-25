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
    tanggal: '24 Oktober 2026',
    hari: 'Sabtu',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
    status: 'Berlangsung',
  },
  {
    id: 2,
    kode: 'IF206',
    mataPraktikum: 'Praktikum Basis Data',
    kelas: 'B',
    tanggal: '24 Oktober 2026',
    hari: 'Sabtu',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
    status: 'Berlangsung',
  },
  {
    id: 3,
    kode: 'IF202',
    mataPraktikum: 'Praktikum Algoritma',
    kelas: 'A',
    tanggal: '26 Oktober 2026',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer 1',
    status: 'Akan Datang',
  },
  {
    id: 4,
    kode: 'IF208',
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kelas: 'C',
    tanggal: '20 Oktober 2026',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
    status: 'Selesai',
  },
];
