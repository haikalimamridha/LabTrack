import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { PraktikanPresensi, SessionStatus } from '@/types/session';
import { AttendanceEmptyState } from './attendance-empty-state';

interface AttendanceTableProps {
  daftarPresensi: PraktikanPresensi[];
  sessionStatus: SessionStatus;
  onSimulatePresensi?: () => void;
  onClearPresensi?: () => void;
}

export function AttendanceTable({
  daftarPresensi,
  sessionStatus,
  onSimulatePresensi,
  onClearPresensi,
}: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tepat Waktu' | 'Terlambat'>('Semua');

  // Filter & Search
  const filteredData = useMemo(() => {
    return daftarPresensi.filter((item) => {
      const matchQuery =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mejaLab.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'Semua' || item.statusKehadiran === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [daftarPresensi, searchQuery, statusFilter]);

  const totalHadir = daftarPresensi.length;
  const tepatWaktuCount = daftarPresensi.filter((p) => p.statusKehadiran === 'Tepat Waktu').length;
  const terlambatCount = daftarPresensi.filter((p) => p.statusKehadiran === 'Terlambat').length;

  if (totalHadir === 0) {
    return (
      <AttendanceEmptyState
        sessionStatus={sessionStatus}
        onSimulatePresensi={onSimulatePresensi}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Filter and Controls Bar */}
      <View style={styles.controlsBar}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, NIM, atau nomor PC..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsContainer}>
          {(['Semua', 'Tepat Waktu', 'Terlambat'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            const count =
              filter === 'Semua'
                ? totalHadir
                : filter === 'Tepat Waktu'
                ? tepatWaktuCount
                : terlambatCount;

            return (
              <Pressable
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextSelected,
                  ]}>
                  {filter} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Action Tools: Quick Simulation & Clear button */}
      <View style={styles.quickActionsBar}>
        <Text style={styles.recordsCountText}>
          Menampilkan <Text style={styles.boldText}>{filteredData.length}</Text> dari{' '}
          <Text style={styles.boldText}>{totalHadir}</Text> data presensi
        </Text>

        <View style={styles.actionButtonsRow}>
          {sessionStatus === 'Sedang Berlangsung' && onSimulatePresensi && (
            <Pressable
              style={({ pressed }) => [
                styles.smallActionButton,
                styles.simulateButton,
                pressed && styles.pressed,
              ]}
              onPress={onSimulatePresensi}>
              <Text style={styles.simulateButtonText}>+ Simulasi Presensi</Text>
            </Pressable>
          )}

          {onClearPresensi && (
            <Pressable
              style={({ pressed }) => [
                styles.smallActionButton,
                styles.clearButton,
                pressed && styles.pressed,
              ]}
              onPress={onClearPresensi}>
              <Text style={styles.clearButtonText}>Uji Empty State (FR-17)</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* If search resulted in 0 items */}
      {filteredData.length === 0 ? (
        <AttendanceEmptyState
          isSearching={true}
          onResetSearch={() => {
            setSearchQuery('');
            setStatusFilter('Semua');
          }}
        />
      ) : (
        /* Table / Card List */
        <View style={styles.tableCardWrapper}>
          {/* Table Header (visible on wider screens / web) */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCol, styles.colNo]}>NO</Text>
            <Text style={[styles.headerCol, styles.colNIM]}>NIM</Text>
            <Text style={[styles.headerCol, styles.colNama]}>NAMA PRAKTIKAN</Text>
            <Text style={[styles.headerCol, styles.colWaktu]}>WAKTU KEHADIRAN (FR-14)</Text>
            <Text style={[styles.headerCol, styles.colStatus]}>STATUS</Text>
            <Text style={[styles.headerCol, styles.colMeja]}>MEJA / PC</Text>
          </View>

          {/* Table Rows */}
          {filteredData.map((item, index) => {
            const isLate = item.statusKehadiran === 'Terlambat';
            return (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}>
                {/* No */}
                <View style={[styles.rowCol, styles.colNo]}>
                  <Text style={styles.cellNo}>{index + 1}</Text>
                </View>

                {/* NIM */}
                <View style={[styles.rowCol, styles.colNIM]}>
                  <Text style={styles.cellNIM}>{item.nim}</Text>
                </View>

                {/* Nama */}
                <View style={[styles.rowCol, styles.colNama]}>
                  <Text style={styles.cellNama}>{item.nama}</Text>
                </View>

                {/* Waktu Kehadiran (FR-14 Focus) */}
                <View style={[styles.rowCol, styles.colWaktu]}>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeIcon}>⏱</Text>
                    <Text style={styles.cellWaktu}>{item.waktuKehadiran}</Text>
                  </View>
                </View>

                {/* Status Kehadiran */}
                <View style={[styles.rowCol, styles.colStatus]}>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isLate ? '#FEF3C7' : '#DCFCE7',
                        borderColor: isLate ? '#F59E0B' : '#22C55E',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isLate ? '#92400E' : '#15803D' },
                      ]}>
                      {item.statusKehadiran}
                    </Text>
                  </View>
                </View>

                {/* Meja Lab */}
                <View style={[styles.rowCol, styles.colMeja]}>
                  <View style={styles.pcBadge}>
                    <Text style={styles.pcBadgeText}>{item.mejaLab}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  controlsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 8 : 4,
    flex: 1,
    minWidth: 260,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextSelected: {
    color: '#FFFFFF',
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  recordsCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulateButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  simulateButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  clearButton: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E11D48',
  },
  tableCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  headerCol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  rowCol: {
    justifyContent: 'center',
  },
  colNo: {
    width: 44,
  },
  colNIM: {
    width: 110,
  },
  colNama: {
    flex: 2,
    minWidth: 150,
  },
  colWaktu: {
    flex: 1.5,
    minWidth: 140,
  },
  colStatus: {
    width: 120,
    alignItems: 'flex-start',
  },
  colMeja: {
    width: 90,
    alignItems: 'center',
  },
  cellNo: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cellNIM: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  cellNama: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  timeIcon: {
    fontSize: 11,
  },
  cellWaktu: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pcBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pcBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  pressed: {
    opacity: 0.8,
  },
});
