import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SessionStatus } from '@/types/session';

interface AttendanceEmptyStateProps {
  sessionStatus?: SessionStatus;
  onSimulatePresensi?: () => void;
  isSearching?: boolean;
  onResetSearch?: () => void;
}

export function AttendanceEmptyState({
  sessionStatus = 'Belum Dibuka',
  onSimulatePresensi,
  isSearching = false,
  onResetSearch,
}: AttendanceEmptyStateProps) {
  if (isSearching) {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconSymbol}>🔍</Text>
        </View>
        <Text style={styles.title}>Data Praktikan Tidak Ditemukan</Text>
        <Text style={styles.description}>
          Tidak ada hasil presensi yang sesuai dengan kata kunci pencarian atau filter yang dipilih.
        </Text>
        {onResetSearch && (
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            onPress={onResetSearch}>
            <Text style={styles.actionButtonText}>Reset Pencarian</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const getStatusMessage = () => {
    switch (sessionStatus) {
      case 'Belum Dibuka':
        return {
          title: 'Belum Ada Presensi Tercatat',
          desc: 'Sesi praktikum ini belum dibuka oleh asisten lab. Praktikan baru dapat melakukan presensi kehadiran setelah Anda membuka sesi praktikum.',
          badgeText: 'Status: Belum Dibuka',
          badgeBg: '#FFFBEB',
          badgeColor: '#B45309',
        };
      case 'Sedang Berlangsung':
        return {
          title: 'Menunggu Presensi Praktikan',
          desc: 'Sesi praktikum sedang berlangsung. Daftar mahasiswa dan waktu kehadiran akan muncul secara real-time di sini begitu praktikan melakukan presensi.',
          badgeText: 'Status: Sesi Aktif',
          badgeBg: '#ECFDF5',
          badgeColor: '#047857',
        };
      case 'Selesai':
      default:
        return {
          title: 'Tidak Ada Kehadiran',
          desc: 'Sesi praktikum telah ditutup dan tidak ada data kehadiran praktikan yang terekam pada sesi ini.',
          badgeText: 'Status: Selesai',
          badgeBg: '#F1F5F9',
          badgeColor: '#475569',
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <View style={styles.cardContainer}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconSymbol}>📋</Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusInfo.badgeBg },
        ]}>
        <Text style={[styles.statusBadgeText, { color: statusInfo.badgeColor }]}>
          {statusInfo.badgeText}
        </Text>
      </View>

      <Text style={styles.title}>{statusInfo.title}</Text>

      <Text style={styles.description}>{statusInfo.desc}</Text>

      {sessionStatus === 'Sedang Berlangsung' && onSimulatePresensi && (
        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={onSimulatePresensi}>
            <Text style={styles.primaryButtonText}>+ Uji Simulasi Presensi Praktikan</Text>
          </Pressable>
          <Text style={styles.hintText}>
            (Tekan tombol ini untuk mensimulasikan mahasiswa melakukan presensi langsung)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginVertical: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconSymbol: {
    fontSize: 28,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 440,
  },
  actionContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
