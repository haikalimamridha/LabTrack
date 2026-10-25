import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { SesiPraktikum } from '@/types/session';

interface ConfirmationModalProps {
  visible: boolean;
  type: 'buka' | 'tutup';
  session: SesiPraktikum | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  visible,
  type,
  session,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!visible || !session) return null;

  const isBuka = type === 'buka';

  const modalTitle = isBuka
    ? 'Konfirmasi Pembukaan Sesi'
    : 'Konfirmasi Penutupan Sesi';

  const actionText = isBuka ? 'Buka Sesi' : 'Tutup Sesi';

  const actionDescription = isBuka
    ? 'Apakah Anda yakin ingin membuka sesi praktikum ini sekarang? Setelah sesi dibuka, praktikan dapat melakukan presensi kehadiran dan status sesi akan berubah menjadi "Sedang Berlangsung".'
    : 'Apakah Anda yakin ingin menutup sesi praktikum ini? Setelah sesi ditutup, praktikan tidak dapat lagi melakukan presensi dan status sesi akan berubah menjadi "Selesai". Tindakan ini menandai praktikum telah berakhir.';

  const accentColor = isBuka ? '#16A34A' : '#DC2626';
  const headerBgColor = isBuka ? '#F0FDF4' : '#FEF2F2';
  const badgeBorderColor = isBuka ? '#86EFAC' : '#FECACA';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.dialogContainer}>
          {/* Header Banner */}
          <View
            style={[
              styles.headerBanner,
              { backgroundColor: headerBgColor, borderColor: badgeBorderColor },
            ]}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: accentColor },
              ]}>
              <Text style={styles.iconText}>{isBuka ? '▶' : '⏹'}</Text>
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.title, { color: isBuka ? '#14532D' : '#991B1B' }]}>
                {modalTitle}
              </Text>
              <Text style={styles.subtitle}>
                Tindakan Sesi Praktikum Laboratorium
              </Text>
            </View>
          </View>

          {/* Session Detail Box */}
          <View style={styles.bodyContent}>
            <View style={styles.sessionBox}>
              <Text style={styles.boxLabel}>INFORMASI SESI</Text>
              <Text style={styles.boxCourseName}>{session.namaMK}</Text>
              <Text style={styles.boxModule}>{session.modul}</Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Kode & Kelas:</Text>
                <Text style={styles.infoValue}>
                  {session.kodeMK} • {session.kelas} ({session.kelompok})
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jadwal:</Text>
                <Text style={styles.infoValue}>
                  {session.tanggal} | {session.waktuMulai} - {session.waktuSelesai} WIB
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ruangan:</Text>
                <Text style={styles.infoValue}>{session.ruangLab}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Praktikan Terdaftar:</Text>
                <Text style={styles.infoValue}>
                  {session.daftarPresensi.length} dari {session.totalPraktikanTerdaftar} praktikan hadir
                </Text>
              </View>
            </View>

            {/* Note / Warning */}
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: isBuka ? '#EFF6FF' : '#FFFBEB',
                  borderColor: isBuka ? '#BFDBFE' : '#FDE68A',
                },
              ]}>
              <Text
                style={[
                  styles.warningIcon,
                  { color: isBuka ? '#1D4ED8' : '#B45309' },
                ]}>
                ℹ
              </Text>
              <Text
                style={[
                  styles.warningText,
                  { color: isBuka ? '#1E40AF' : '#92400E' },
                ]}>
                {actionDescription}
              </Text>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footerContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: accentColor },
                pressed && styles.buttonPressed,
              ]}
              onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>
                {isBuka ? '✓ Ya, Buka Sesi' : '✓ Ya, Tutup Sesi'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    gap: 14,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  bodyContent: {
    padding: 20,
    gap: 16,
  },
  sessionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  boxCourseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  boxModule: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
    flexWrap: 'wrap',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
