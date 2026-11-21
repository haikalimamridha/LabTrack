
import {
  collection,
  onSnapshot,
} from "@react-native-firebase/firestore";

import { firestore } from "@/config/firebase";

export type Laboratorium = {
  id: string;
  nama: string;
  kode: string;
  gedung: string;
  lantai: number;
  latitude: number;
  longitude: number;
  radiusPresensiMeter: number;
  deskripsi: string;
  aktif: boolean;
};

export function listenLaboratorium(
  callback: (data: Laboratorium[]) => void,
  onError?: (error: Error) => void
) {
  const labRef = collection(firestore, "laboratorium");

  return onSnapshot(
    labRef,
    (snapshot) => {
      const data: Laboratorium[] = snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }) as Laboratorium)
        .filter(
          (lab) =>
            lab.aktif &&
            Number.isFinite(lab.latitude) &&
            Number.isFinite(lab.longitude) &&
            (lab.latitude !== 0 || lab.longitude !== 0)
        );

      callback(data);
    },
    (error) => {
      onError?.(error);
    }
  );
}
