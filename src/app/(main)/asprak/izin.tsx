import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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

import BackButton from '@/components/ui/backButton';
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
        {/* HEADER */}
        <LinearGradient
          colors={["#7928CA", "#512DA8", "#29215C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <BackButton />
          <Text style={styles.title}>Pemeriksaan Izin</Text>
        </LinearGradient>

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

        {/* TABS FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
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
                activeOpacity={0.8}
                style={[styles.tabButton, aktif && styles.tabButtonActive]}
                onPress={() => setFilter(tab.id)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    aktif && styles.tabButtonTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                    <View style={{ flex: 1, marginRight: 10 }}>
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
                        <Text style={styles.aiPillText}>
                          {item.sentimenAi
                            ? item.sentimenAi.toUpperCase()
                            : 'TIDAK TERSEDIA'}
                        </Text>
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
              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
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
  container: {
    flex: 1,
    backgroundColor: '#1E1B35',
  },

  scrollContent: {
    paddingBottom: 35,
  },

  // HEADER

  header: {
    paddingTop: 35,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#302A4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#49415F',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 13,
    color: '#A9A2C7',
    marginTop: 6,
    lineHeight: 20,
  },

  // SUMMARY
  summaryCard: {
    backgroundColor: '#302A4D',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#453B64',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
  },

  summaryActive: {
    backgroundColor: '#453B64',
  },

  summaryNumber: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#A9A2C7',
    marginTop: 5,
    textAlign: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#49415F',
  },

  // FILTER TABS
  tabContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 9,
  },

  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#302A4D',
    borderWidth: 1,
    borderColor: '#453B64',
  },

  tabButtonActive: {
    backgroundColor: '#49358B',
    borderColor: '#7651C9',
  },

  tabButtonText: {
    fontSize: 12,
    color: '#A9A2C7',
    fontWeight: '600',
  },

  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  // LOADING
  loadingContainer: {
    padding: 45,
    alignItems: 'center',
  },

  loadingText: {
    color: '#A9A2C7',
    marginTop: 12,
    fontSize: 13,
  },

  // EMPTY STATE
  emptyContainer: {
    padding: 35,
    alignItems: 'center',
    backgroundColor: '#302A4D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#453B64',
    marginHorizontal: 18,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 14,
  },

  emptyText: {
    fontSize: 13,
    color: '#A9A2C7',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },

  // GRID
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 18,
  },

  // CARD
  card: {
    backgroundColor: '#302A4D',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#453B64',
  },

  cardWide: {
    width: '48%',
    marginHorizontal: 0,
    marginBottom: 0,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  namaPraktikan: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  nimPraktikan: {
    fontSize: 11,
    color: '#A9A2C7',
    marginTop: 5,
  },

  // STATUS
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#49415F',
    marginVertical: 14,
  },

  // SESSION
  sessionBox: {
    backgroundColor: '#25213D',
    padding: 12,
    borderRadius: 11,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#453B64',
  },

  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  infoText: {
    fontSize: 12,
    color: '#A9A2C7',
  },

  // REASON
  reasonSection: {
    marginBottom: 14,
  },

  reasonLabel: {
    fontSize: 11,
    color: '#B99AFF',
    fontWeight: '700',
    marginBottom: 5,
  },

  reasonText: {
    fontSize: 13,
    color: '#E5E0F5',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // AI ANALYSIS
  aiBadgeContainer: {
    backgroundColor: '#282445',
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#59468B',
    marginBottom: 13,
  },

  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  aiHeaderTitle: {
    fontSize: 11,
    color: '#D2C4FF',
    fontWeight: '700',
    flexShrink: 1,
  },

  aiPill: {
    backgroundColor: '#49358B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  aiPillText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  aiExplanation: {
    fontSize: 12,
    color: '#BDB2E8',
    marginTop: 9,
    lineHeight: 18,
  },

  aiDisclaimer: {
    fontSize: 10,
    color: '#9385C5',
    marginTop: 9,
    fontStyle: 'italic',
    lineHeight: 15,
  },

  // ASSISTANT NOTE
  noteSection: {
    backgroundColor: '#25213D',
    padding: 12,
    borderRadius: 10,
    marginBottom: 13,
    borderLeftWidth: 3,
    borderLeftColor: '#7651C9',
  },

  noteLabel: {
    fontSize: 11,
    color: '#B99AFF',
    fontWeight: '700',
  },

  noteText: {
    fontSize: 12,
    color: '#E5E0F5',
    marginTop: 6,
    lineHeight: 18,
  },

  // ACTION BUTTONS
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  btnTolak: {
    flex: 1,
    backgroundColor: '#9F343F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 7,
  },

  btnTolakText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  btnTerima: {
    flex: 1.3,
    backgroundColor: '#287A58',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 7,
  },

  btnTerimaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  btnUbah: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 7,
    borderRadius: 9,
    backgroundColor: '#25213D',
    borderWidth: 1,
    borderColor: '#49415F',
  },

  btnUbahText: {
    fontSize: 12,
    color: '#BDB2E8',
    fontWeight: '600',
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 8, 25, 0.82)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#25213D',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#49415F',
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  modalSub: {
    fontSize: 12,
    color: '#A9A2C7',
    marginBottom: 7,
    lineHeight: 18,
  },

  modalAlasanBox: {
    backgroundColor: '#302A4D',
    padding: 13,
    borderRadius: 11,
    marginVertical: 13,
    borderWidth: 1,
    borderColor: '#453B64',
  },

  modalAlasanLabel: {
    fontSize: 11,
    color: '#B99AFF',
    fontWeight: '700',
  },

  modalAlasanText: {
    fontSize: 13,
    color: '#E5E0F5',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 19,
  },

  modalAiText: {
    fontSize: 11,
    color: '#A9A2C7',
    marginTop: 10,
  },

  fieldLabel: {
    fontSize: 12,
    color: '#E5E0F5',
    fontWeight: '700',
    marginBottom: 8,
  },

  modalTextArea: {
    backgroundColor: '#302A4D',
    borderRadius: 11,
    padding: 13,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#49415F',
    textAlignVertical: 'top',
    minHeight: 90,
    marginBottom: 12,
  },

  infoSyncText: {
    fontSize: 11,
    color: '#69D9A3',
    marginBottom: 13,
    lineHeight: 17,
  },

  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 5,
  },

  btnModalBatal: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#393250',
    borderWidth: 1,
    borderColor: '#49415F',
  },

  btnModalBatalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  btnModalKonfirmasi: {
    flex: 1.5,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
  },

  btnModalKonfirmasiText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  bgTerima: {
    backgroundColor: '#287A58',
  },

  bgTolak: {
    backgroundColor: '#9F343F',
  },
});
