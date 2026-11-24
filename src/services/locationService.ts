import * as Location from "expo-location";

export type ValidasiLokasi = {
  status: "valid" | "retry_accuracy" | "retry_borderline" | "outside";
  jarakMeter: number;
  accuracyMeter: number;
  pesan: string;
};

export type HasilCekLokasi = {
  berhasil: boolean;
  hasil?: ValidasiLokasi;
  error?: string;
};

// Konfigurasi geofence FSM
const LATITUDE_KAMPUS = -7.048724528393118;
const LONGITUDE_KAMPUS = 110.44139395824047;
const RADIUS_KAMPUS = 250;

const ACCURACY_MAKSIMAL = 30;
const TOLERANSI_RADIUS = 5;

// Menghitung jarak antara dua titik koordinat menggunakan Haversine
export function hitungJarakMeter(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number {
  const R = 6371000;

  const toRad = (derajat: number) => (derajat * Math.PI) / 180;

  const dLat = toRad(latitude2 - latitude1);
  const dLon = toRad(longitude2 - longitude1);

  const lat1 = toRad(latitude1);
  const lat2 = toRad(latitude2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Validasi posisi terhadap area kampus FSM
export function validasiLokasiKampus(
  latitudePraktikan: number,
  longitudePraktikan: number,
  accuracyMeter: number
): ValidasiLokasi {
  const jarakMeter = hitungJarakMeter(
    latitudePraktikan,
    longitudePraktikan,
    LATITUDE_KAMPUS,
    LONGITUDE_KAMPUS
  );

  if (accuracyMeter > ACCURACY_MAKSIMAL) {
    return {
      status: "retry_accuracy",
      jarakMeter,
      accuracyMeter,
      pesan: "Akurasi GPS kurang baik. Silakan coba mengambil lokasi kembali.",
    };
  }

  if (jarakMeter <= RADIUS_KAMPUS) {
    return {
      status: "valid",
      jarakMeter,
      accuracyMeter,
      pesan: "Lokasi Anda berada dalam area FSM.",
    };
  }

  if (jarakMeter <= RADIUS_KAMPUS + TOLERANSI_RADIUS) {
    return {
      status: "retry_borderline",
      jarakMeter,
      accuracyMeter,
      pesan: "Anda berada dekat batas area FSM. Silakan coba mengambil lokasi kembali.",
    };
  }

  return {
    status: "outside",
    jarakMeter,
    accuracyMeter,
    pesan: "Anda berada di luar area FSM.",
  };
}

// Mengambil lokasi perangkat dan mengevaluasi geofence
export async function cekLokasiKampus(): Promise<HasilCekLokasi> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      return {
        berhasil: false,
        error: "Izin lokasi diperlukan untuk melakukan presensi.",
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude, accuracy } = location.coords;

    if (accuracy === null) {
      return {
        berhasil: false,
        error: "Akurasi GPS tidak dapat diketahui. Silakan coba kembali.",
      };
    }

    const hasil = validasiLokasiKampus(
      latitude,
      longitude,
      accuracy
    );

    return {
      berhasil: true,
      hasil,
    };
  } catch (error) {
    return {
      berhasil: false,
      error: "Gagal mendapatkan lokasi. Pastikan GPS Anda aktif dan coba kembali.",
    };
  }
}

// Konfigurasi yang dapat digunakan UI untuk menampilkan batas
export const konfigurasiGeofence = {
  latitude: LATITUDE_KAMPUS,
  longitude: LONGITUDE_KAMPUS,
  radiusMeter: RADIUS_KAMPUS,
  accuracyMaksimal: ACCURACY_MAKSIMAL,
  toleransiMeter: TOLERANSI_RADIUS,
};