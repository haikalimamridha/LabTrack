import { useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePresensi } from '../../context/PresensiContext';
import { Sesi } from '../../data/sesi';

export default function AsprakRekapPresensiScreen() {
  const { daftarSesi, getRekapSesi, simulasiPresensi, kosongkanPresensi } =
    usePresensi();
  const params = useLocalSearchParams<{ sesiId?: string }>();

  const initialId = params.sesiId ? Number(params.sesiId) : daftarSesi[0]?.id ?? 1;
  const [selectedSesiId, setSelectedSesiId] = useState<number>(initialId);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKehadiran, setFilterKehadiran] = useState<
    'Semua' | 'Tepat Waktu' | 'Terlambat'
  >('Semua');

  const selectedSesi: Sesi =
    daftarSesi.find((s) => s.id === selectedSesiId) || daftarSesi[0];

  const rekapSemua = getRekapSesi(selectedSesi.id);

  // Filter & Search
  const rekapFiltered = useMemo(() => {
    return rekapSemua.filter((item) => {
      const matchQuery =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mejaLab.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        filterKehadiran === 'Semua' || item.statusKehadiran === filterKehadiran;

      return matchQuery && matchStatus;
    });
  }, [rekapSemua, searchQuery, filterKehadiran]);

  const totalHadir = rekapSemua.length;
  const totalKapasitas = selectedSesi.totalPraktikan;
  const tepatWaktuCount = rekapSemua.filter(
    (p) => p.statusKehadiran === 'Tepat Waktu'
  ).length;
  const terlambatCount = rekapSemua.filter(
    (p) => p.statusKehadiran === 'Terlambat'
  ).length;
  const belumHadirCount = Math.max(0, totalKapasitas - totalHadir);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>LABTRACK</Text>
            <Text style={styles.title}>Rekap Presensi Praktikan</Text>
            <Text style={styles.subtitle}>
              Pantau daftar praktikan yang telah melakukan presensi beserta catatan waktu kehadirannya (FR-14 & FR-17).
            </Text>
          </View>

          {/* Sesi Selector Horizontal Tabs */}
          <Text style={styles.sectionTitle}>Pilih Sesi Praktikum</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sesiSelectorContainer}
          >
            {daftarSesi.map((sesi) => {
              const aktif = sesi.id === selectedSesi.id;
              const rekapCount = getRekapSesi(sesi.id).length;

              return (
                <TouchableOpacity
                  key={sesi.id}
                  activeOpacity={0.7}
                  style={[
                    styles.sesiPill,
                    aktif && styles.sesiPillActive,
                  ]}
                  onPress={() => {
                    setSelectedSesiId(sesi.id);
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.sesiPillTop}>
                    <Text style={styles.sesiPillCode}>{sesi.kode}</Text>
                    <Text style={styles.sesiPillClass}>Kelas {sesi.kelas}</Text>
                  </View>
                  <Text style={styles.sesiPillTitle} numberOfLines={1}>
                    {sesi.mataPraktikum}
                  </Text>
                  <View style={styles.sesiPillBottom}>
                    <Text style={styles.sesiPillStatus}>{sesi.status}</Text>
                    <Text style={styles.sesiPillCount}>
                      {rekapCount}/{sesi.totalPraktikan} hadir
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sesi Detail Overview Banner */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{selectedSesi.kode}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  selectedSesi.status === 'Sedang Berlangsung'
                    ? styles.statusBerlangsung
                    : selectedSesi.status === 'Selesai'
                    ? styles.statusSelesai
                    : styles.statusBelumDibuka,
                ]}
              >
                <Text style={styles.statusText}>{selectedSesi.status}</Text>
              </View>
            </View>

            <Text style={styles.overviewTitle}>
              {selectedSesi.mataPraktikum}
            </Text>
            <Text style={styles.overviewSub}>
              Kelas {selectedSesi.kelas} • {selectedSesi.ruangan} • {selectedSesi.waktu} WIB
            </Text>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Waktu Dibuka:</Text>
              <Text style={styles.metaVal}>
                {selectedSesi.waktuBuka ?? 'Belum dibuka'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Waktu Ditutup:</Text>
              <Text style={styles.metaVal}>
                {selectedSesi.waktuTutup ?? 'Belum ditutup'}
              </Text>
            </View>
          </View>

          {/* Metric Stats Cards */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricVal}>{totalHadir}</Text>
              <Text style={styles.metricLabel}>Total Hadir (FR-14)</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricVal, { color: '#86EFAC' }]}>
                {tepatWaktuCount}
              </Text>
              <Text style={styles.metricLabel}>Tepat Waktu</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricVal, { color: '#FDE047' }]}>
                {terlambatCount}
              </Text>
              <Text style={styles.metricLabel}>Terlambat</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricVal}>{belumHadirCount}</Text>
              <Text style={styles.metricLabel}>Belum Presensi</Text>
            </View>
          </View>

          {/* Quick Simulation & Clear Actions */}
          <View style={styles.actionToolsRow}>
            <TouchableOpacity
              style={styles.toolBtnSimulate}
              activeOpacity={0.7}
              onPress={() => simulasiPresensi(selectedSesi.id)}
            >
              <Text style={styles.toolBtnSimulateText}>
                + Simulasi Mahasiswa Masuk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolBtnClear}
              activeOpacity={0.7}
              onPress={() => kosongkanPresensi(selectedSesi.id)}
            >
              <Text style={styles.toolBtnClearText}>
                Kosongkan Presensi (Uji FR-17)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filter Bar */}
          <View style={styles.searchFilterBox}>
            <View style={styles.searchRow}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari NIM, nama mahasiswa, atau meja PC..."
                placeholderTextColor="#7D8590"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterPillsRow}>
              {(['Semua', 'Tepat Waktu', 'Terlambat'] as const).map(
                (filter) => (
                  <TouchableOpacity
                    key={filter}
                    activeOpacity={0.7}
                    style={[
                      styles.filterPill,
                      filterKehadiran === filter && styles.filterPillActive,
                    ]}
                    onPress={() => setFilterKehadiran(filter)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        filterKehadiran === filter &&
                          styles.filterPillTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* FR-17: Tampilan Kosong Jika Belum Ada Presensi */}
          {totalHadir === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>
                Belum Ada Praktikan yang Melakukan Presensi
              </Text>
              <Text style={styles.emptyText}>
                {selectedSesi.status === 'Belum Dibuka'
                  ? 'Sesi praktikum ini belum dibuka oleh asisten lab. Silakan buka sesi terlebih dahulu pada tab "Sesi" agar mahasiswa dapat melakukan presensi kehadiran.'
                  : 'Sesi praktikum saat ini sedang berlangsung. Daftar mahasiswa dan waktu kehadiran akan muncul secara otomatis di sini begitu praktikan melakukan presensi.'}
              </Text>

              {selectedSesi.status === 'Sedang Berlangsung' && (
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  activeOpacity={0.8}
                  onPress={() => simulasiPresensi(selectedSesi.id)}
                >
                  <Text style={styles.emptyActionBtnText}>
                    + Uji Simulasi Presensi Pertama
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : rekapFiltered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
              <Text style={styles.emptyText}>
                Tidak ada data presensi yang cocok dengan kata kunci pencarian.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => {
                  setSearchQuery('');
                  setFilterKehadiran('Semua');
                }}
              >
                <Text style={styles.emptyActionBtnText}>Reset Filter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* FR-14: Daftar Praktikan yang Telah Hadir Beserta Waktu Kehadirannya */
            <View style={styles.attendanceList}>
              <Text style={styles.listSectionTitle}>
                DAFTAR KEHADIRAN & WAKTU PRESENSI ({rekapFiltered.length})
              </Text>

              {rekapFiltered.map((p, idx) => {
                const isLate = p.statusKehadiran === 'Terlambat';
                return (
                  <View key={p.id} style={styles.attendanceCard}>
                    <View style={styles.attCardTop}>
                      <View style={styles.attIndexBadge}>
                        <Text style={styles.attIndexText}>#{idx + 1}</Text>
                      </View>

                      <View style={styles.attNimCol}>
                        <Text style={styles.attName}>{p.nama}</Text>
                        <Text style={styles.attNim}>NIM: {p.nim}</Text>
                      </View>

                      <View
                        style={[
                          styles.attStatusPill,
                          isLate ? styles.pillLate : styles.pillOnTime,
                        ]}
                      >
                        <Text
                          style={[
                            styles.attStatusText,
                            isLate ? styles.textLate : styles.textOnTime,
                          ]}
                        >
                          {p.statusKehadiran}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.attDivider} />

                    <View style={styles.attBottomRow}>
                      <View style={styles.attTimeCol}>
                        <Text style={styles.attTimeLabel}>
                          WAKTU KEHADIRAN (FR-14)
                        </Text>
                        <Text style={styles.attTimeVal}>
                          ⏱ {p.waktuHadir}
                        </Text>
                      </View>

                      <View style={styles.pcBadge}>
                        <Text style={styles.pcBadgeText}>{p.mejaLab}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 680,
  },
  header: {
    marginBottom: 20,
  },
  brand: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#B8BCC4',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sesiSelectorContainer: {
    gap: 10,
    paddingBottom: 16,
  },
  sesiPill: {
    backgroundColor: '#343941',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 12,
    width: 200,
  },
  sesiPillActive: {
    borderColor: '#625FF0',
    backgroundColor: '#34354A',
  },
  sesiPillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sesiPillCode: {
    color: '#A5A2FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sesiPillClass: {
    color: '#B8BCC4',
    fontSize: 11,
  },
  sesiPillTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sesiPillBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sesiPillStatus: {
    color: '#86EFAC',
    fontSize: 10,
    fontWeight: '600',
  },
  sesiPillCount: {
    color: '#B8BCC4',
    fontSize: 10,
  },
  overviewCard: {
    backgroundColor: '#343941',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 16,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: '#45416F',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  codeText: {
    color: '#C7C5FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusBelumDibuka: {
    backgroundColor: '#854D0E',
  },
  statusBerlangsung: {
    backgroundColor: '#164E63',
  },
  statusSelesai: {
    backgroundColor: '#166534',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  overviewTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overviewSub: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#A6ABB5',
    fontSize: 12,
  },
  metaVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#343941',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 10,
    alignItems: 'center',
  },
  metricVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metricLabel: {
    color: '#A6ABB5',
    fontSize: 10,
    textAlign: 'center',
  },
  actionToolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toolBtnSimulate: {
    flex: 1,
    backgroundColor: '#34354A',
    borderWidth: 1,
    borderColor: '#625FF0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toolBtnSimulateText: {
    color: '#D8D6FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolBtnClear: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#555B65',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  toolBtnClearText: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  searchFilterBox: {
    backgroundColor: '#343941',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25292E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  searchIcon: {
    marginRight: 6,
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  clearSearchText: {
    color: '#7D8590',
    fontSize: 12,
    paddingHorizontal: 4,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#25292E',
    borderWidth: 1,
    borderColor: '#454B55',
  },
  filterPillActive: {
    backgroundColor: '#625FF0',
    borderColor: '#625FF0',
  },
  filterPillText: {
    color: '#B8BCC4',
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#343941',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 32,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#B8BCC4',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 440,
  },
  emptyActionBtn: {
    backgroundColor: '#625FF0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  attendanceList: {
    gap: 10,
  },
  listSectionTitle: {
    color: '#A5A2FF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  attendanceCard: {
    backgroundColor: '#343941',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 14,
  },
  attCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#45416F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attIndexText: {
    color: '#C7C5FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  attNimCol: {
    flex: 1,
  },
  attName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  attNim: {
    color: '#B8BCC4',
    fontSize: 11,
  },
  attStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillOnTime: {
    backgroundColor: '#166534',
  },
  pillLate: {
    backgroundColor: '#854D0E',
  },
  attStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textOnTime: {
    color: '#FFFFFF',
  },
  textLate: {
    color: '#FFFFFF',
  },
  attDivider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 10,
  },
  attBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attTimeCol: {
    gap: 2,
  },
  attTimeLabel: {
    color: '#8E95A2',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  attTimeVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pcBadge: {
    backgroundColor: '#25292E',
    borderWidth: 1,
    borderColor: '#625FF0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pcBadgeText: {
    color: '#D8D6FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
