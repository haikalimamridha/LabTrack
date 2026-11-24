import React from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PESAN_IZIN } from '@/hooks/usePermissions';

export type TipeKondisi =
  | 'izin_lokasi_ditolak'
  | 'gps_mati'
  | 'lokasi_tidak_tersedia'
  | 'izin_notifikasi_ditolak'
  | 'koneksi_terganggu'
  | 'notifikasi_tidak_didukung';

interface PeringatanKondisiProps {
  tipe: TipeKondisi;
  pesanKustom?: string;
  onCobaLagi?: () => void;
  style?: object;
}

export default function PeringatanKondisi({
  tipe,
  pesanKustom,
  onCobaLagi,
  style,
}: PeringatanKondisiProps) {
  const bukaPengaturan = () => {
    if (Platform.OS === 'ios') {
      void Linking.openURL('app-settings:');
    } else {
      void Linking.openSettings();
    }
  };

  const getDetail = () => {
    switch (tipe) {
      case 'izin_lokasi_ditolak':
        return {
          icon: 'map-marker-off' as const,
          judul: 'Izin Lokasi Ditolak',
          pesan: pesanKustom || PESAN_IZIN.lokasi_ditolak,
          aksiTeks: 'Buka Pengaturan',
          aksi: bukaPengaturan,
          warna: '#EF4444',
        };
      case 'gps_mati':
        return {
          icon: 'crosshairs-gps' as const,
          judul: 'Layanan GPS Tidak Aktif',
          pesan: pesanKustom || PESAN_IZIN.gps_mati,
          aksiTeks: 'Aktifkan GPS',
          aksi: bukaPengaturan,
          warna: '#F59E0B',
        };
      case 'lokasi_tidak_tersedia':
        return {
          icon: 'map-marker-question' as const,
          judul: 'Lokasi Belum Tersedia',
          pesan:
            pesanKustom ||
            'Sedang mencari sinyal lokasi Anda. Pastikan Anda berada di area terbuka dan coba lagi.',
          aksiTeks: onCobaLagi ? 'Muat Ulang Lokasi' : undefined,
          aksi: onCobaLagi,
          warna: '#F59E0B',
        };
      case 'izin_notifikasi_ditolak':
        return {
          icon: 'bell-off-outline' as const,
          judul: 'Notifikasi Dinonaktifkan',
          pesan: pesanKustom || PESAN_IZIN.notifikasi_ditolak,
          aksiTeks: 'Buka Pengaturan',
          aksi: bukaPengaturan,
          warna: '#6366F1',
        };
      case 'koneksi_terganggu':
        return {
          icon: 'wifi-off' as const,
          judul: 'Koneksi Terganggu',
          pesan: pesanKustom || PESAN_IZIN.koneksi_terganggu,
          aksiTeks: onCobaLagi ? 'Coba Hubungkan Lagi' : undefined,
          aksi: onCobaLagi,
          warna: '#EF4444',
        };
      case 'notifikasi_tidak_didukung':
        return {
          icon: 'alert-circle-outline' as const,
          judul: 'Notifikasi Terbatas',
          pesan: pesanKustom || PESAN_IZIN.notifikasi_tidak_bisa,
          aksiTeks: undefined,
          aksi: undefined,
          warna: '#9CA3AF',
        };
    }
  };

  const detail = getDetail();

  return (
    <View style={[styles.container, { borderLeftColor: detail.warna }, style]}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons
          name={detail.icon}
          size={24}
          color={detail.warna}
          style={styles.icon}
        />
        <Text style={styles.judul}>{detail.judul}</Text>
      </View>
      <Text style={styles.pesan}>{detail.pesan}</Text>

      <View style={styles.actionRow}>
        {detail.aksiTeks && detail.aksi && (
          <TouchableOpacity
            style={[styles.tombolAksi, { backgroundColor: detail.warna }]}
            activeOpacity={0.8}
            onPress={detail.aksi}
          >
            <Text style={styles.tombolAksiTeks}>{detail.aksiTeks}</Text>
          </TouchableOpacity>
        )}
        {onCobaLagi && detail.aksi !== onCobaLagi && (
          <TouchableOpacity
            style={styles.tombolSekunder}
            activeOpacity={0.8}
            onPress={onCobaLagi}
          >
            <Text style={styles.tombolSekunderTeks}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#343941',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  judul: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pesan: {
    fontSize: 13,
    color: '#B8BCC4',
    lineHeight: 19,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  tombolAksi: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tombolAksiTeks: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tombolSekunder: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555B65',
    alignItems: 'center',
  },
  tombolSekunderTeks: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
});
