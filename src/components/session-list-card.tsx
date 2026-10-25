import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SesiPraktikum } from '@/types/session';
import { SessionStatusBadge } from './session-status-badge';

interface SessionListCardProps {
  session: SesiPraktikum;
  isSelected: boolean;
  onSelect: () => void;
}

export function SessionListCard({
  session,
  isSelected,
  onSelect,
}: SessionListCardProps) {
  const totalHadir = session.daftarPresensi.length;
  const persentase = Math.round((totalHadir / session.totalPraktikanTerdaftar) * 100);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={onSelect}>
      {/* Top Row: MK & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{session.kodeMK}</Text>
          </View>
          <Text style={styles.kelasText}>{session.kelas}</Text>
        </View>

        <SessionStatusBadge status={session.status} size="sm" />
      </View>

      {/* Course Title & Module */}
      <Text style={styles.courseName} numberOfLines={1}>
        {session.namaMK}
      </Text>
      <Text style={styles.moduleName} numberOfLines={1}>
        {session.modul}
      </Text>

      {/* Schedule & Location */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          📅 {session.waktuMulai} - {session.waktuSelesai} WIB
        </Text>
        <Text style={styles.infoText} numberOfLines={1}>
          📍 {session.ruangLab.split('(')[0].trim()}
        </Text>
      </View>

      {/* Attendance summary pill */}
      <View style={styles.footerRow}>
        <View style={styles.attendancePill}>
          <Text style={styles.attendanceText}>
            Presensi: <Text style={styles.bold}>{totalHadir}</Text>/{session.totalPraktikanTerdaftar}{' '}
            praktikan ({persentase}%)
          </Text>
        </View>

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>Sedang Dikelola</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFF',
    borderWidth: 2,
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  codeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  kelasText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  moduleName: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 11,
    color: '#64748B',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendancePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attendanceText: {
    fontSize: 11,
    color: '#475569',
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
  pressed: {
    opacity: 0.85,
  },
});
