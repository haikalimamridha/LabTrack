export type JadwalAsprak = {
  id: number;
  kode: string;
  mataPraktikum: string;
  kelas: string;
  hari: string;
  waktu: string;
  ruangan: string;
};

export const jadwalAsprakDummy: JadwalAsprak[] = [
  {
    id: 1,
    kode: 'IF204',
    mataPraktikum: 'Praktikum Pemrograman Web',
    kelas: 'A',
    hari: 'Sabtu',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
  },
  {
    id: 2,
    kode: 'IF206',
    mataPraktikum: 'Praktikum Basis Data',
    kelas: 'B',
    hari: 'Sabtu',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
  },
  {
    id: 3,
    kode: 'IF202',
    mataPraktikum: 'Praktikum Algoritma',
    kelas: 'A',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer 1',
  },
  {
    id: 4,
    kode: 'IF208',
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kelas: 'C',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
  },
];