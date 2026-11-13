
import {
    collection,
    getDocs,
    query,
    where,
} from '@react-native-firebase/firestore';

import { firestore } from '@/config/firebase';

export type Kelas = {
  id: string;
  nama: string;
  kode: string;
  aktif: boolean;
};

export async function getKelasAktif(): Promise<Kelas[]> {
  const kelasRef = collection(firestore, 'kelas');

  const q = query(
    kelasRef,
    where('aktif', '==', true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    nama: item.data().nama,
    kode: item.data().kode,
    aktif: item.data().aktif,
  }));
}
