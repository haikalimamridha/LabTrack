import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { collection, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { firestore } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  ajukanIzinPraktikum,
  batalkanIzin,
  subscribeIzinPraktikan,
  type PengajuanIzin,
} from '@/services/izinService';
import { formatTanggal, type Sesi } from '@/services/sessionService';

export default function IzinPraktikanScreen() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [daftarIzin, setDaftarIzin] = useState<PengajuanIzin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalBuka, setModalBuka] = useState(false);

  // Daftar sesi langsung dari Firestore (semua status: draft/open/closed)
  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>([]);
  const [loadingSesi, setLoadingSesi] = useState(true);

  // Form State
  const [sesiDipilih, setSesiDipilih] = useState<Sesi | null>(null);
  const [alasan, setAlasan] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [batalLoading, setBatalLoading] = useState<string | null>(null);

  // Load semua sesi untuk kelas praktikan (semua status agar bisa pilih sesi apapun)
  useEffect(() => {
    if (!profile?.kelasId) {
      setDaftarSesi([]);
      setLoadingSesi(false);
      return;
    }
    setLoadingSesi(true);
    const q = query(
      collection(firestore, 'sessions'),
      where('kelasId', '==', profile.kelasId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Sesi[] = snap.docs.map((d) => {
          const data = d.data();
          const statusDb = (data.status as 'draft' | 'open' | 'closed') ?? 'draft';
          const statusLabel =
            statusDb === 'open'
              ? 'Sedang Berlangsung'
              : statusDb === 'closed'
              ? 'Selesai'
              : 'Belum Dibuka';
          return {
            id: d.id,
            kelasId: data.kelasId ?? '',
            mataPraktikumId: data.mataPraktikumId ?? '',
            mataPraktikum: data.mataPraktikum ?? '',
            kode: data.kode ?? '',
            kelas: data.kelas ?? '',
            scheduleId: data.scheduleId ?? null,
            tanggal: data.tanggal ?? '',
            hari: data.hari ?? '',
            waktu: data.waktu ?? '',
            ruangan: data.ruangan ?? '',
            status: statusLabel,
            statusDb,
            openedAt: data.openedAt?.toDate?.() ?? null,
            closedAt: data.closedAt?.toDate?.() ?? null,
          } as Sesi;
        });
        // Urutkan: terbaru dulu
        list.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        setDaftarSesi(list);
        setLoadingSesi(false);
      },
      (err) => {
        console.error('Error memuat sesi untuk izin:', err);
        setLoadingSesi(false);
      }
    );
    return () => unsub();
  }, [profile?.kelasId]);

  // Subscribe izin milik praktikan secara real-time
  useEffect(() => {
    if (!profile?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeIzinPraktikan(
      profile.uid,
      (data) => {
        setDaftarIzin(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error memuat izin:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid]);

  // Statistik Ringkas
  const totalIzin = daftarIzin.length;
  const totalPending = daftarIzin.filter((i) => i.status === 'pending').length;
  const totalDisetujui = daftarIzin.filter((i) => i.status === 'disetujui').length;
  const totalDitolak = daftarIzin.filter((i) => i.status === 'ditolak').length;

  const handleAjukan = async () => {
    if (!sesiDipilih) {
      Alert.alert('Perhatian', 'Silakan pilih sesi praktikum terlebih dahulu.');
      return;
    }

    if (!alasan.trim() || alasan.trim().length < 5) {
      Alert.alert(
        'Perhatian',
        'Alasan izin wajib diisi secara jelas (minimal 5 karakter).'
      );
      return;
    }

    if (!profile) {
      Alert.alert('Gagal', 'Sesi login tidak valid.');
      return;
    }

    setMengirim(true);
    const res = await ajukanIzinPraktikum({
      sesi: sesiDipilih,
      alasan: alasan.trim(),
      profile: {
        uid: profile.uid,
        nama: profile.nama,
        nim: profile.nim,
        kelasId: profile.kelasId,
      },
    });
    setMengirim(false);

    if (res.ok) {
      Alert.alert('Berhasil', res.pesan);
      setModalBuka(false);
      setAlasan('');
      setSesiDipilih(null);
    } else {
      Alert.alert('Peringatan', res.pesan);
    }
  };

  const handleBatal = (izin: PengajuanIzin) => {
    Alert.alert(
      'Batalkan Pengajuan',
      `Yakin ingin membatalkan izin untuk sesi ${izin.mataPraktikum}?`,
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            setBatalLoading(izin.id);
            const res = await batalkanIzin(izin.id);
            setBatalLoading(null);
            if (!res.ok) {
              Alert.alert('Gagal', res.pesan);
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: PengajuanIzin['status']) => {
    switch (status) {
      case 'disetujui':
        return {
          label: 'Disetujui',
          bg: '#193831',
          color: '#6EE7B7',
          icon: 'check-circle',
        };
      case 'ditolak':
        return {
          label: 'Ditolak',
          bg: '#441E28',
          color: '#FDA4AF',
          icon: 'x-circle',
        };
      default:
        return {
          label: 'Menunggu Review',
          bg: '#47351B',
          color: '#FCD34D',
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
        {/* Header Title */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>Pengajuan Izin</Text>
            <Text style={styles.subtitle}>
              Ajukan izin praktikum dan pantau status persetujuan
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Feather name="file-text" size={14} color="#D5C2FF" />
            <Text style={styles.headerBadgeText}>{totalIzin} Izin</Text>
          </View>
        </View>

        {/* Ringkasan Statistik */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{totalIzin}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {totalPending}
            </Text>
            <Text style={styles.summaryLabel}>Menunggu</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {totalDisetujui}
            </Text>
            <Text style={styles.summaryLabel}>Disetujui</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>
              {totalDitolak}
            </Text>
            <Text style={styles.summaryLabel}>Ditolak</Text>
          </View>
        </View>

        {/* Tombol Buat Pengajuan Baru */}
        <TouchableOpacity
          style={styles.btnAjukan}
          activeOpacity={0.85}
          onPress={() => setModalBuka(true)}
        >
          <Feather name="plus-circle" size={18} color="#FFFFFF" />
          <Text style={styles.btnAjukanText}>Ajukan Izin Baru</Text>
        </TouchableOpacity>

        {/* Section List Izin */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Pengajuan</Text>
          {!loading && (
            <Text style={styles.sectionCount}>{totalIzin} pengajuan</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#9623D6" />
            <Text style={styles.stateText}>Memuat data perizinan...</Text>
          </View>
        ) : daftarIzin.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialIcons name="assignment-late" size={28} color="#C4B5FD" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Pengajuan Izin</Text>
            <Text style={styles.emptyText}>
              Jika kamu berhalangan hadir pada salah satu sesi praktikum, tekan
              tombol &quot;Ajukan Izin Baru&quot; di atas.
            </Text>
          </View>
        ) : (
          <View style={isWide ? styles.grid : undefined}>
            {daftarIzin.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <View
                  key={item.id}
                  style={[styles.card, isWide && styles.cardWide]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.sessionBadge}>
                      <Text style={styles.sessionBadgeText}>
                        {item.kode ? `${item.kode} · ` : ''}Kelas {item.kelas || '-'}
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
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: badge.color }]}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.subjectText}>{item.mataPraktikum}</Text>

                  {/* Info Waktu */}
                  <View style={styles.metaList}>
                    <View style={styles.infoRow}>
                      <Feather name="calendar" size={14} color="#9C98B2" />
                      <Text style={styles.infoText}>
                        {formatTanggal(item.tanggalSesi)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather name="clock" size={14} color="#9C98B2" />
                      <Text style={styles.infoText}>{item.waktuSesi}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Alasan Praktikan */}
                  <View style={styles.reasonSection}>
                    <Text style={styles.reasonLabel}>Alasan Ketidakhadiran</Text>
                    <Text style={styles.reasonText}>&ldquo;{item.alasan}&rdquo;</Text>
                  </View>

                  {/* Hasil Klasifikasi AI */}
                  <View style={styles.aiBadgeContainer}>
                    <View style={styles.aiHeader}>
                      <FontAwesome5 name="robot" size={12} color="#D5C2FF" />
                      <Text style={styles.aiHeaderTitle}>Analisis Sentimen:</Text>
                      <View style={styles.aiPill}>
                        <Text style={styles.aiPillText}>
                          {item.sentimenAi ? item.sentimenAi.toUpperCase() : 'TIDAK TERSEDIA'}
                        </Text>
                      </View>
                    </View>
                    {item.penjelasanAi ? (
                      <Text style={styles.aiExplanation}>
                        {item.penjelasanAi}
                      </Text>
                    ) : null}
                  </View>

                  {/* Catatan Asisten (jika ada) */}
                  {item.catatanAsisten ? (
                    <View style={styles.noteSection}>
                      <Text style={styles.noteLabel}>
                        Catatan Asisten ({item.reviewedByName || 'Asisten'})
                      </Text>
                      <Text style={styles.noteText}>{item.catatanAsisten}</Text>
                    </View>
                  ) : null}

                  {/* Tombol Batalkan (jika masih pending) */}
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.btnBatal}
                      activeOpacity={0.8}
                      onPress={() => handleBatal(item)}
                      disabled={batalLoading === item.id}
                    >
                      {batalLoading === item.id ? (
                        <ActivityIndicator size="small" color="#FDA4AF" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={14} color="#FDA4AF" />
                          <Text style={styles.btnBatalText}>
                            Batalkan Pengajuan
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal Form Pengajuan Izin */}
      <Modal
        visible={modalBuka}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!mengirim) setModalBuka(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Form Pengajuan Izin</Text>
              <TouchableOpacity
                onPress={() => !mengirim && setModalBuka(false)}
                disabled={mengirim}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Pilih Sesi */}
              <Text style={styles.fieldLabel}>
                Pilih Sesi Praktikum <Text style={styles.required}>*</Text>
              </Text>
              {daftarSesi.length === 0 ? (
                <Text style={styles.emptySesiText}>
                  {loadingSesi
                    ? 'Memuat daftar sesi...'
                    : 'Belum ada sesi praktikum yang tersedia untuk kelasmu.'}
                </Text>
              ) : (
                <View style={styles.sessionSelectContainer}>
                  {daftarSesi.map((s) => {
                    const isSelected = sesiDipilih?.id === s.id;
                    const statusColor =
                      s.statusDb === 'open'
                        ? '#6EE7B7'
                        : s.statusDb === 'closed'
                        ? '#9C98B2'
                        : '#FCD34D';
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.sessionOption,
                          isSelected && styles.sessionOptionSelected,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => setSesiDipilih(s)}
                      >
                        <View style={styles.sessionOptionHeader}>
                          <Text
                            style={[
                              styles.sessionOptionTitle,
                              isSelected && styles.textSelected,
                            ]}
                          >
                            {s.mataPraktikum}
                          </Text>
                          <View style={styles.sessionStatusRight}>
                            <Text style={[styles.sessionStatusMini, { color: statusColor }]}>
                              {s.status}
                            </Text>
                            {isSelected && (
                              <Feather name="check" size={16} color="#B56DF0" />
                            )}
                          </View>
                        </View>
                        <Text style={styles.sessionOptionSub}>
                          {s.hari}, {formatTanggal(s.tanggal)} · {s.waktu}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Input Alasan */}
              <Text style={styles.fieldLabel}>
                Alasan Ketidakhadiran <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Contoh: Mengalami demam dan disarankan dokter istirahat..."
                placeholderTextColor="#8E8AA3"
                multiline
                numberOfLines={4}
                value={alasan}
                onChangeText={setAlasan}
                editable={!mengirim}
              />
              <Text style={styles.charCount}>
                Minimal 5 karakter ({alasan.trim().length} karakter)
              </Text>

              {/* Informasi analisis AI otomatis */}
              <View style={styles.aiNoticeBox}>
                <FontAwesome5 name="robot" size={14} color="#D5C2FF" />
                <Text style={styles.aiNoticeText}>
                  Alasanmu dianalisis otomatis oleh model sentimen sebagai
                  informasi pendukung bagi asisten praktikum, bukan penentu
                  persetujuan izin.
                </Text>
              </View>

              {/* Tombol Aksi Modal */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnModalBatal}
                  activeOpacity={0.85}
                  onPress={() => setModalBuka(false)}
                  disabled={mengirim}
                >
                  <Text style={styles.btnModalBatalText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btnModalKirim,
                    (!sesiDipilih || alasan.trim().length < 5 || mengirim) &&
                      styles.btnDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleAjukan}
                  disabled={
                    !sesiDipilih || alasan.trim().length < 5 || mengirim
                  }
                >
                  {mengirim ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnModalKirimText}>Kirim Pengajuan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B3A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 115,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9C98B2',
    marginTop: 3,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2F2C44',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#D5C2FF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#2F2C44',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9C98B2',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#423D5E',
  },

  /* Action Button */
  btnAjukan: {
    backgroundColor: '#9623D6',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 22,
    gap: 8,
  },
  btnAjukanText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C98B2',
  },

  /* States */
  stateCard: {
    backgroundColor: '#2F2C44',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#3A3654',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#9C98B2',
    textAlign: 'center',
    lineHeight: 18,
  },
  stateText: {
    color: '#9C98B2',
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },

  /* Grid & Card */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    backgroundColor: '#2F2C44',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardWide: {
    width: '48.6%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sessionBadge: {
    backgroundColor: '#3A3654',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
  },
  sessionBadgeText: {
    fontSize: 11,
    color: '#D5C2FF',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaList: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#D8D5E6',
  },
  divider: {
    height: 1,
    backgroundColor: '#3F3A5C',
    marginVertical: 13,
  },
  reasonSection: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 11,
    color: '#9C98B2',
    fontWeight: '600',
    marginBottom: 3,
  },
  reasonText: {
    fontSize: 13,
    color: '#F5F3FF',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  aiBadgeContainer: {
    backgroundColor: '#3A3654',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiHeaderTitle: {
    fontSize: 11,
    color: '#D8D5E6',
    fontWeight: '600',
  },
  aiPill: {
    backgroundColor: '#9623D6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiPillText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiExplanation: {
    fontSize: 11,
    color: '#B8B4C8',
    marginTop: 6,
    lineHeight: 16,
  },
  noteSection: {
    backgroundColor: '#26233B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#9623D6',
  },
  noteLabel: {
    fontSize: 11,
    color: '#9C98B2',
    fontWeight: '600',
  },
  noteText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 3,
    lineHeight: 17,
  },
  btnBatal: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A2330',
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  btnBatalText: {
    fontSize: 12,
    color: '#FDA4AF',
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2545',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2DFEE',
    marginBottom: 8,
    marginTop: 8,
  },
  required: {
    color: '#FF5A6E',
  },
  emptySesiText: {
    fontSize: 12,
    color: '#9C98B2',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  sessionSelectContainer: {
    gap: 8,
    marginBottom: 12,
  },
  sessionOption: {
    backgroundColor: '#3A3654',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sessionOptionSelected: {
    borderColor: '#9623D6',
    backgroundColor: '#342B59',
  },
  sessionOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sessionOptionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textSelected: {
    color: '#E9D5FF',
  },
  sessionStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionStatusMini: {
    fontSize: 10,
    fontWeight: '700',
  },
  sessionOptionSub: {
    fontSize: 12,
    color: '#B8B4C8',
    marginTop: 3,
  },
  textArea: {
    backgroundColor: '#3A3654',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 96,
  },
  charCount: {
    fontSize: 11,
    color: '#8E8AA3',
    marginTop: 5,
    marginBottom: 12,
    textAlign: 'right',
  },
  aiNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#3A3654',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  aiNoticeText: {
    fontSize: 11,
    color: '#D8D5E6',
    flex: 1,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  btnModalBatal: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3A3654',
  },
  btnModalBatalText: {
    color: '#D8D5E6',
    fontSize: 13,
    fontWeight: '600',
  },
  btnModalKirim: {
    flex: 2,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#9623D6',
  },
  btnModalKirimText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.45,
  },
});