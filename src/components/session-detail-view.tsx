import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SesiPraktikum } from '@/types/session';
import { SessionStatusBadge } from './session-status-badge';
import { ConfirmationModal } from './confirmation-modal';
import { useSessionContext } from '@/context/session-context';

interface SessionDetailViewProps {
  session: SesiPraktikum;
}

export function SessionDetailView({ session }: SessionDetailViewProps) {
  const router = useRouter();
  const { bukaSesi, tutupSesi, simulasiPresensi } = useSessionContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'buka' | 'tutup'>('buka');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenBukaModal = () => {
    setModalType('buka');
    setModalVisible(true);
  };

  const handleOpenTutupModal = () => {
    setModalType('tutup');
    setModalVisible(true);
  };

  const handleConfirmAction = () => {
    setModalVisible(false);
    if (modalType === 'buka') {
      const res = bukaSesi(session.id);
      showToast(res.message);
    } else {
      const res = tutupSesi(session.id);
      showToast(res.message);
    }
  };

  const handleSimulate = () => {
    const res = simulasiPresensi(session.id);
    showToast(res.message);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const totalHadir = session.daftarPresensi.length;
  const persentaseHadir = Math.round(
    (totalHadir / session.totalPraktikanTerdaftar) * 100
  );
  const tepatWaktuCount = session.daftarPresensi.filter(
    (p) => p.statusKehadiran === 'Tepat Waktu'
  ).length;
  const terlambatCount = session.daftarPresensi.filter(
    (p) => p.statusKehadiran === 'Terlambat'
  ).length;

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastIcon}>🔔</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Card */}
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.codeRow}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeBadgeText}>{session.kodeMK}</Text>
              </View>
              <Text style={styles.classText}>
                {session.kelas} • {session.kelompok}
              </Text>
            </View>
            <Text style={styles.courseTitle}>{session.namaMK}</Text>
            <Text style={styles.moduleTitle}>{session.modul}</Text>
          </View>

          {/* FR-16: Latest session status indicator */}
          <View style={styles.headerRight}>
            <Text style={styles.statusLabel}>STATUS SESI TERBARU</Text>
            <SessionStatusBadge status={session.status} size="lg" />
          </View>
        </View>

        {/* Action Controls Card (FR-13 & FR-15) */}
        <View style={styles.controlBox}>
          <View style={styles.controlBoxHeader}>
            <Text style={styles.controlBoxTitle}>KONTROL SESI PRAKTIKUM</Text>
            <Text style={styles.controlBoxSubtitle}>
              {session.status === 'Belum Dibuka'
                ? 'Sesi belum aktif. Buka sesi untuk mengizinkan praktikan melakukan presensi.'
                : session.status === 'Sedang Berlangsung'
                ? 'Sesi sedang berjalan aktif. Tutup sesi jika seluruh praktikum telah selesai.'
                : 'Sesi praktikum telah ditutup.'}
            </Text>
          </View>

          <View style={styles.controlButtonsRow}>
            {/* Tombol Buka Sesi (FR-13) */}
            {session.status === 'Belum Dibuka' && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.openButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleOpenBukaModal}>
                <Text style={styles.buttonIcon}>▶</Text>
                <Text style={styles.openButtonText}>Buka Sesi Praktikum</Text>
              </Pressable>
            )}

            {/* Tombol Tutup Sesi (FR-15) */}
            {session.status === 'Sedang Berlangsung' && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.closeButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleOpenTutupModal}>
                  <Text style={styles.buttonIcon}>⏹</Text>
                  <Text style={styles.closeButtonText}>Tutup Sesi Praktikum</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.simulateBtn,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleSimulate}>
                  <Text style={styles.buttonIcon}>+👤</Text>
                  <Text style={styles.simulateBtnText}>Simulasi Presensi</Text>
                </Pressable>
              </>
            )}

            {/* Status Selesai - Tombol Disabled */}
            {session.status === 'Selesai' && (
              <View style={styles.completedNotice}>
                <Text style={styles.completedNoticeIcon}>✓</Text>
                <Text style={styles.completedNoticeText}>
                  Sesi praktikum telah ditutup pada{' '}
                  <Text style={styles.boldText}>{session.waktuTutup ?? '-'}</Text>. Kegiatan
                  telah selesai.
                </Text>
              </View>
            )}

            {/* Link ke Rekap Presensi */}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rekapButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/asprak/riwayat' as any)}>
              <Text style={styles.buttonIcon}>📋</Text>
              <Text style={styles.rekapButtonText}>
                Lihat Rekap Presensi ({totalHadir})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* FR-12: Detail & Jadwal Lengkap Sesi */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionHeader}>DETAIL JADWAL & PELAKSANAAN (FR-12)</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📅 Tanggal Pelaksanaan</Text>
              <Text style={styles.detailValue}>{session.tanggal}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>⏰ Jam Praktikum</Text>
              <Text style={styles.detailValue}>
                {session.waktuMulai} - {session.waktuSelesai} WIB
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>📍 Ruang Laboratorium</Text>
              <Text style={styles.detailValue}>{session.ruangLab}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>👨‍🏫 Dosen Pengampu</Text>
              <Text style={styles.detailValue}>{session.dosenPengampu}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>⏱ Waktu Buka Sesi</Text>
              <Text style={styles.detailValue}>
                {session.waktuBuka ? `${session.waktuBuka}` : 'Belum dibuka'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>⏹ Waktu Tutup Sesi</Text>
              <Text style={styles.detailValue}>
                {session.waktuTutup ? `${session.waktuTutup}` : 'Belum ditutup'}
              </Text>
            </View>
          </View>

          {/* Asisten yang Bertugas */}
          <View style={styles.asistenBox}>
            <Text style={styles.asistenBoxLabel}>ASISTEN PENANGGUNG JAWAB:</Text>
            <View style={styles.asistenList}>
              {session.asistenBertugas.map((ast, idx) => (
                <View key={idx} style={styles.asistenBadge}>
                  <Text style={styles.asistenBadgeText}>🧑‍💻 {ast}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Deskripsi Materi Modul */}
          <View style={styles.moduleDescBox}>
            <Text style={styles.moduleDescLabel}>Deskripsi Praktikum:</Text>
            <Text style={styles.moduleDescText}>{session.deskripsiModul}</Text>
          </View>
        </View>

        {/* Quick Attendance Stats Card */}
        <View style={styles.statsSection}>
          <View style={styles.statsHeaderRow}>
            <Text style={styles.statsTitle}>RINGKASAN KEHADIRAN PRAKTIKAN</Text>
            <Text style={styles.statsPercentage}>{persentaseHadir}% Kehadiran</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(persentaseHadir, 100)}%` },
              ]}
            />
          </View>

          {/* Stats Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{totalHadir}</Text>
              <Text style={styles.metricLabel}>Total Hadir</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: '#16A34A' }]}>
                {tepatWaktuCount}
              </Text>
              <Text style={styles.metricLabel}>Tepat Waktu</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: '#D97706' }]}>
                {terlambatCount}
              </Text>
              <Text style={styles.metricLabel}>Terlambat</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricNumber, { color: '#64748B' }]}>
                {session.totalPraktikanTerdaftar - totalHadir}
              </Text>
              <Text style={styles.metricLabel}>Belum Presensi</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Confirmation Modal Component */}
      <ConfirmationModal
        visible={modalVisible}
        type={modalType}
        session={session}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  toastIcon: {
    fontSize: 16,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    flex: 1,
    minWidth: 260,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  classText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  moduleTitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-start',
    gap: 6,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  controlBox: {
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  controlBoxHeader: {
    marginBottom: 12,
  },
  controlBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.6,
  },
  controlBoxSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 14,
  },
  openButton: {
    backgroundColor: '#16A34A',
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#DC2626',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  simulateBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  simulateBtnText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '600',
  },
  rekapButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  rekapButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
    flex: 1,
    minWidth: 260,
  },
  completedNoticeIcon: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 16,
  },
  completedNoticeText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    width: '47%',
    minWidth: 220,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  asistenBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  asistenBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  asistenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  asistenBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  asistenBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  moduleDescBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  moduleDescLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  moduleDescText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  statsSection: {
    padding: 20,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  statsPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
