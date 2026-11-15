import {
    collection,
    getDocs,
    query,
    where,
} from "@react-native-firebase/firestore";

import { firestore } from "@/config/firebase";

export type MataPraktikum = {
  id: string;
  nama: string;
  aktif: boolean;
};

export async function getMataPraktikumAktif(): Promise<MataPraktikum[]> {
  const ref = collection(firestore, "mataPraktikum");

  const q = query(ref, where("aktif", "==", true));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    nama: item.data().nama,
    aktif: item.data().aktif,
  }));
}
