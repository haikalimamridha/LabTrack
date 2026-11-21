import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '@/context/AuthContext';
import {
  putuskanIzin,
  subscribeSemuaIzin,
  type PengajuanIzin,
  type StatusIzin,
} from '@/services/izinService';
import { formatTanggal } from '@/services/sessionService';

type FilterTab = 'semua' | 'pending' | 'disetujui' | 'ditolak';

export default function IzinAsprakScreen() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [daftarIzin, setDaftarIzin] = useState<PengajuanIzin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('pending');

  // Modal Review State
  const [selectedIzin, setSelectedIzin] = useState<PengajuanIzin | null>(null);
  const [tindakan, setTindakan] = useState<'disetujui' | 'ditolak' | null>(null);
  const [catatanAsisten, setCatatanAsisten] = useState('');
  const [memproses, setMemproses] = useState(false);

  // Subscribe seluruh permohonan izin praktikan secara real-time (FR-09)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeSemuaIzin(
      (data) => {
        setDaftarIzin(data);
        setLoading(false);
      },
      (err) => {
        console.error('Gagal memuat daftar izin asprak:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Statistik
  const totalSemua = daftarIzin.length;
  const totalPending = daftarIzin.filter((i) => i.status === 'pending').length;
  const totalDisetujui = daftarIzin.filter((i) => i.status === 'disetujui').length;
  const totalDitolak = daftarIzin.filter((i) => i.status === 'ditolak').length;

  // Filter List
  const dataFiltered = daftarIzin.filter((item) => {
    if (filter === 'semua') return true;
    return item.status === filter;
  });

  const bukaModalReview = (
    izin: PengajuanIzin,
    aksi: 'disetujui' | 'ditolak'
  ) => {
    setSelectedIzin(izin);
    setTindakan(aksi);
    setCatatanAsisten(
      aksi === 'disetujui'
        ? 'Izin disetujui oleh asisten praktikum.'
        : 'Alasan tidak memenuhi ketentuan perizinan.'
    );
  };

  const handleSimpanKeputusan = async () => {
    if (!selectedIzin || !tindakan) return;

    setMemproses(true);
    const res = await putuskanIzin(
      selectedIzin,
      tindakan,
      catatanAsisten,
      profile ? { uid: profile.uid, nama: profile.nama } : undefined
    );
    setMemproses(false);

    if (res.ok) {
      Alert.alert('Berhasil', res.pesan);
      setSelectedIzin(null);
      setTindakan(null);
      setCatatanAsisten('');
    } else {
      Alert.alert('Gagal', res.pesan);
    }
  };

  const getStatusBadge = (status: StatusIzin) => {
    switch (status) {
      case 'disetujui':
        return {
          label: 'Disetujui',
          bg: '#1C3829',
          color: '#48BB78',
          icon: 'check-circle',
        };
      case 'ditolak':
        return {
          label: 'Ditolak',
          bg: '#3D1B1B',
          color: '#F56565',
          icon: 'x-circle',
        };
      default:
        return {
          label: 'Menunggu Review',
          bg: '#3D3314',
          color: '#ECC94B',
          icon: 'clock',
        };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pemeriksaan Izin</Text>
          <Text style={styles.subtitle}>
            Verifikasi permohonan izin ketidakhadiran praktikan dengan bantuan AI.
          </Text>
        </View>

        {/* Ringkasan Status */}
        <View style={styles.summaryCard}>
          <TouchableOpacity
            style={[
              styles.summaryItem,
              filter === 'pending' && styles.summaryActive,
            ]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.summaryNumber, { color: '#ECC94B' }]}>
              {totalPending}
            </Text>
            <Text style={styles.summaryLabel}>Menunggu</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={[
              styles.summaryItem,
              filter === 'disetujui' && styles.summaryActive,
            ]}
            onPress={() => setFilter('disetujui')}
          >
            <Text style={[styles.summaryNumber, { color: '#48BB78' }]}>
              {totalDisetujui}
            </Text>
            <Text style={styles.summaryLabel}>Disetujui</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={[
              styles.summaryItem,
              filter === 'ditolak' && styles.summaryActive,
            ]}
            onPress={() => setFilter('ditolak')}
          >
            <Text style={[styles.summaryNumber, { color: '#F56565' }]}>
              {totalDitolak}
            </Text>
            <Text style={styles.summaryLabel}>Ditolak</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <TouchableOpacity
            style={[
              styles.summaryItem,
              filter === 'semua' && styles.summaryActive,
            ]}
            onPress={() => setFilter('semua')}
          >
            <Text style={styles.summaryNumber}>{totalSemua}</Text>
            <Text style={styles.summaryLabel}>Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs Filter */}
        <View style={styles.tabContainer}>
          {(
            [
              { id: 'pending', label: 'Menunggu Review' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
              { id: 'semua', label: 'Semua Izin' },
            ] as const
          ).map((tab) => {
            const aktif = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, aktif && styles.tabButtonActive]}
                onPress={() => setFilter(tab.id)}
              >
                <Text
                  style={[styles.tabButtonText, aktif && styles.tabButtonTextActive]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List Izin */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#625ff0" />
            <Text style={styles.loadingText}>Memuat permohonan izin...</Text>
          </View>
        ) : dataFiltered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="done-all" size={48} color="#6b7280" />
            <Text style={styles.emptyTitle}>Tidak Ada Pengajuan</Text>
            <Text style={styles.emptyText}>
              {filter === 'pending'
                ? 'Semua pengajuan izin praktikan telah selesai diperiksa.'
                : 'Tidak ada data izin pada kategori ini.'}
            </Text>
          </View>
        ) : (
          <View style={isWide ? styles.grid : undefined}>
            {dataFiltered.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <View
                  key={item.id}
                  style={[styles.card, isWide && styles.cardWide]}
                >
                  {/* Header Card: Mahasiswa & Status */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.namaPraktikan}>{item.nama}</Text>
                      <Text style={styles.nimPraktikan}>
                        NIM: {item.nim} · Kelas {item.kelas || '-'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Feather
                        name={badge.icon as any}
                        size={12}
                        color={badge.color}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: badge.color }]}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Sesi Praktikum yang Dimohonkan */}
                  <View style={styles.sessionBox}>
                    <Text style={styles.sessionTitle}>
                      {item.mataPraktikum}
                    </Text>
                    <View style={styles.infoRow}>
                      <Feather name="calendar" size={12} color="#a0a0a5" />
                      <Text style={styles.infoText}>
                        {formatTanggal(item.tanggalSesi)} ({item.waktuSesi})
                      </Text>
                    </View>
                  </View>

                  {/* Alasan Praktikan */}
                  <View style={styles.reasonSection}>
                    <Text style={styles.reasonLabel}>
                      Alasan Ketidakhadiran:
                    </Text>
                    <Text style={styles.reasonText}>
                      &ldquo;{item.alasan}&rdquo;
                    </Text>
                  </View>

                  {/* Informasi Pendukung AI (FR-08, FR-09) */}
                  <View style={styles.aiBadgeContainer}>
                    <View style={styles.aiHeader}>
                      <FontAwesome5 name="robot" size={12} color="#A5A2FF" />
                      <Text style={styles.aiHeaderTitle}>
                        Hasil Analisis Sentimen EDOM:
                      </Text>
                      <View style={styles.aiPill}>
                        <Text style={styles.aiPillText}> {item.sentimenAi ? item.sentimenAi.toUpperCase() : 'Tidak tersedia'}</Text>
                      </View>
                    </View>
                    {item.penjelasanAi ? (
                      <Text style={styles.aiExplanation}>
                        {item.penjelasanAi}
                      </Text>
                    ) : null}
                    <Text style={styles.aiDisclaimer}>
                      *Informasi pendukung — keputusan akhir tetap oleh asisten.
                    </Text>
                  </View>

                  {/* Catatan Asisten yang sudah ada */}
                  {item.catatanAsisten ? (
                    <View style={styles.noteSection}>
                      <Text style={styles.noteLabel}>
                        Catatan ({item.reviewedByName || 'Asisten'}):
                      </Text>
                      <Text style={styles.noteText}>{item.catatanAsisten}</Text>
                    </View>
                  ) : null}

                  {/* Tombol Aksi Pemeriksaan (FR-09) */}
                  {item.status === 'pending' ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.btnTolak}
                        activeOpacity={0.8}
                        onPress={() => bukaModalReview(item, 'ditolak')}
                      >
                        <Feather name="x" size={15} color="#ffffff" />
                        <Text style={styles.btnTolakText}>Tolak</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnTerima}
                        activeOpacity={0.8}
                        onPress={() => bukaModalReview(item, 'disetujui')}
                      >
                        <Feather name="check" size={15} color="#ffffff" />
                        <Text style={styles.btnTerimaText}>Terima Izin</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.btnUbah}
                      onPress={() =>
                        bukaModalReview(
                          item,
                          item.status === 'disetujui' ? 'ditolak' : 'disetujui'
                        )
                      }
                    >
                      <Feather name="edit-2" size={13} color="#a0a0a5" />
                      <Text style={styles.btnUbahText}>Ubah Keputusan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Konfirmasi Keputusan */}
      <Modal
        visible={!!selectedIzin && !!tindakan}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!memproses) setSelectedIzin(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {tindakan === 'disetujui' ? 'Terima Izin' : 'Tolak Izin'}
              </Text>
              <TouchableOpacity
                onPress={() => !memproses && setSelectedIzin(null)}
                disabled={memproses}
              >
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {selectedIzin && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSub}>
                  Praktikan:{' '}
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                    {selectedIzin.nama} ({selectedIzin.nim})
                  </Text>
                </Text>
                <Text style={styles.modalSub}>
                  Sesi: {selectedIzin.mataPraktikum} (
                  {formatTanggal(selectedIzin.tanggalSesi)})
                </Text>

                <View style={styles.modalAlasanBox}>
                  <Text style={styles.modalAlasanLabel}>Alasan:</Text>
                  <Text style={styles.modalAlasanText}>
                    &ldquo;{selectedIzin.alasan}&rdquo;
                  </Text>
                  <Text style={styles.modalAiText}>
                    Sentimen EDOM:{' '}
                    <Text style={{ fontWeight: '700', color: '#A5A2FF' }}>
                      {selectedIzin.sentimenAi}
                    </Text>
                  </Text>
                </View>

                {/* Input Catatan Asisten */}
                <Text style={styles.fieldLabel}>Catatan / Umpan Balik:</Text>
                <TextInput
                  style={styles.modalTextArea}
                  placeholder="Tambahkan catatan untuk praktikan..."
                  placeholderTextColor="#71717a"
                  multiline
                  numberOfLines={3}
                  value={catatanAsisten}
                  onChangeText={setCatatanAsisten}
                  editable={!memproses}
                />

                {tindakan === 'disetujui' ? (
                  <Text style={styles.infoSyncText}>
                    *Persetujuan izin ini akan otomatis mencatat status &quot;izin&quot;
                    pada rekap presensi praktikan untuk sesi ini.
                  </Text>
                ) : null}

                {/* Tombol Aksi */}
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.btnModalBatal}
                    onPress={() => setSelectedIzin(null)}
                    disabled={memproses}
                  >
                    <Text style={styles.btnModalBatalText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btnModalKonfirmasi,
                      tindakan === 'disetujui'
                        ? styles.bgTerima
                        : styles.bgTolak,
                    ]}
                    onPress={handleSimpanKeputusan}
                    disabled={memproses}
                  >
                    {memproses ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.btnModalKonfirmasiText}>
                        {tindakan === 'disetujui'
                          ? 'Konfirmasi Terima'
                          : 'Konfirmasi Tolak'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 18 },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#a0a0a5', marginTop: 4 },

  summaryCard: {
    backgroundColor: '#1e2124',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333740',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  summaryActive: { backgroundColor: '#2a2e36' },
  summaryNumber: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  summaryLabel: { fontSize: 11, color: '#a0a0a5', marginTop: 4 },
  summaryDivider: { width: 1, height: 26, backgroundColor: '#333740' },

  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e2124',
    borderWidth: 1,
    borderColor: '#333740',
  },
  tabButtonActive: {
    backgroundColor: '#625ff0',
    borderColor: '#625ff0',
  },
  tabButtonText: { fontSize: 12, color: '#a0a0a5', fontWeight: '600' },
  tabButtonTextActive: { color: '#ffffff' },

  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { color: '#a0a0a5', marginTop: 12, fontSize: 13 },

  emptyContainer: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: '#1e2124',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333740',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#a0a0a5',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#1e2124',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#333740',
  },
  cardWide: { width: '48%' },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  namaPraktikan: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  nimPraktikan: { fontSize: 12, color: '#a0a0a5', marginTop: 2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#333740', marginVertical: 10 },

  sessionBox: {
    backgroundColor: '#262930',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: '#a0a0a5' },

  reasonSection: { marginBottom: 10 },
  reasonLabel: { fontSize: 11, color: '#a0a0a5', fontWeight: '600' },
  reasonText: {
    fontSize: 13,
    color: '#e4e4e7',
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 18,
  },

  aiBadgeContainer: {
    backgroundColor: '#282745',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 12,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiHeaderTitle: { fontSize: 11, color: '#c7d2fe', fontWeight: '600' },
  aiPill: {
    backgroundColor: '#4338ca',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiPillText: { fontSize: 11, color: '#ffffff', fontWeight: '700' },
  aiExplanation: {
    fontSize: 11,
    color: '#a5b4fc',
    marginTop: 4,
    lineHeight: 15,
  },
  aiDisclaimer: {
    fontSize: 10,
    color: '#818cf8',
    marginTop: 4,
    fontStyle: 'italic',
  },

  noteSection: {
    backgroundColor: '#262930',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#625ff0',
  },
  noteLabel: { fontSize: 11, color: '#a0a0a5', fontWeight: '600' },
  noteText: { fontSize: 12, color: '#ffffff', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btnTolak: {
    flex: 1,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  btnTolakText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  btnTerima: {
    flex: 1.3,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  btnTerimaText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },

  btnUbah: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  btnUbahText: { fontSize: 12, color: '#a0a0a5' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e2124',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333740',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  modalSub: { fontSize: 12, color: '#a0a0a5', marginBottom: 4 },

  modalAlasanBox: {
    backgroundColor: '#262930',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  modalAlasanLabel: { fontSize: 11, color: '#a0a0a5' },
  modalAlasanText: {
    fontSize: 12,
    color: '#e4e4e7',
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalAiText: { fontSize: 11, color: '#c7d2fe', marginTop: 4 },

  fieldLabel: {
    fontSize: 12,
    color: '#e4e4e7',
    fontWeight: '600',
    marginBottom: 6,
  },
  modalTextArea: {
    backgroundColor: '#2a2e36',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#3f3f46',
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 10,
  },
  infoSyncText: {
    fontSize: 11,
    color: '#4ade80',
    marginBottom: 12,
    lineHeight: 15,
  },

  modalActionButtons: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btnModalBatal: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2a2e36',
  },
  btnModalBatalText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  btnModalKonfirmasi: {
    flex: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  btnModalKonfirmasiText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  bgTerima: { backgroundColor: '#16a34a' },
  bgTolak: { backgroundColor: '#dc2626' },
});
