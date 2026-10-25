
export type Jadwal = {
  id: number;
  mataPraktikum: string;
  kode: string;
  hari: string;
  waktu: string;
  ruangan: string;
  asisten: string;
};

export const jadwalDummy: Jadwal[] = [
  {
    id: 1,
    mataPraktikum: 'Praktikum Pemrograman Web',
    kode: 'IF204',
    hari: 'Sabtu',
    waktu: '09.00 - 11.00',
    ruangan: 'Lab Komputer 1',
    asisten: 'Andi Pratama',
  },
  {
    id: 2,
    mataPraktikum: 'Praktikum Basis Data',
    kode: 'IF206',
    hari: 'Sabtu',
    waktu: '13.00 - 15.00',
    ruangan: 'Lab Komputer 2',
    asisten: 'Siti Rahma',
  },
  {
    id: 3,
    mataPraktikum: 'Praktikum Algoritma',
    kode: 'IF202',
    hari: 'Senin',
    waktu: '10.00 - 12.00',
    ruangan: 'Lab Komputer 1',
    asisten: 'Budi Santoso',
  },
  {
    id: 4,
    mataPraktikum: 'Praktikum Jaringan Komputer',
    kode: 'IF208',
    hari: 'Selasa',
    waktu: '08.00 - 10.00',
    ruangan: 'Lab Jaringan',
    asisten: 'Dina Putri',
  },
];
