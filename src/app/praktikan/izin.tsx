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
import { collection, onSnapshot, query, where } from '@react-native-firebase/firestore';

import { useAuth } from '@/context/AuthContext';
import { firestore } from '@/config/firebase';
import {
  ajukanIzinPraktikum,
  batalkanIzin,
  subscribeIzinPraktikan,
  type PengajuanIzin,
} from '@/services/izinService';
import {
  getAiApiUrl,
  klasifikasiAlasanIzin,
  setAiApiUrl,
  type HasilKlasifikasiAi,
} from '@/services/aiService';
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

  // State untuk Live Test AI (FR-08)
  const [previewAi, setPreviewAi] = useState<HasilKlasifikasiAi | null>(null);
  const [cekAiLoading, setCekAiLoading] = useState(false);
  const [modalAiUrl, setModalAiUrl] = useState(false);
  const [inputUrl, setInputUrl] = useState(getAiApiUrl());

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
      setPreviewAi(null);
    } else {
      Alert.alert('Peringatan', res.pesan);
    }
  };

  const handleCekAi = async () => {
    if (!alasan.trim() || alasan.trim().length < 5) {
      Alert.alert(
        'Perhatian',
        'Tuliskan alasan minimal 5 karakter terlebih dahulu untuk dianalisis oleh AI.'
      );
      return;
    }

    setCekAiLoading(true);
    try {
      const hasil = await klasifikasiAlasanIzin(alasan.trim());
      setPreviewAi(hasil);
    } catch (e) {
      console.error('Error cek AI:', e);
    } finally {
      setCekAiLoading(false);
    }
  };

  const handleSimpanUrl = () => {
    setAiApiUrl(inputUrl);
    setModalAiUrl(false);
    Alert.alert(
      'Konfigurasi Disimpan',
      inputUrl.trim()
        ? `URL API AI berhasil disetel ke:\n${inputUrl}`
        : 'Kembali menggunakan model AI bawaan project.'
    );
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
        {/* Header Title */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Pengajuan Izin</Text>
              <Text style={styles.subtitle}>
                Ajukan izin praktikum dan pantau status persetujuan secara real-time.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnSettingAi}
              activeOpacity={0.8}
              onPress={() => setModalAiUrl(true)}
            >
              <FontAwesome5 name="robot" size={13} color="#A5A2FF" />
              <Text style={styles.btnSettingAiText}>API AI</Text>
            </TouchableOpacity>
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
            <Text style={[styles.summaryNumber, { color: '#ECC94B' }]}>
              {totalPending}
            </Text>
            <Text style={styles.summaryLabel}>Menunggu</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#48BB78' }]}>
              {totalDisetujui}
            </Text>
            <Text style={styles.summaryLabel}>Disetujui</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#F56565' }]}>
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
          <Feather name="plus-circle" size={18} color="#ffffff" />
          <Text style={styles.btnAjukanText}>Ajukan Izin Baru</Text>
        </TouchableOpacity>

        {/* Section List Izin */}
        <Text style={styles.sectionTitle}>Riwayat Pengajuan Izin</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#625ff0" />
            <Text style={styles.loadingText}>Memuat data perizinan...</Text>
          </View>
        ) : daftarIzin.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment-late" size={48} color="#6b7280" />
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
                        style={{ marginRight: 4 }}
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
                  <View style={styles.infoRow}>
                    <Feather name="calendar" size={13} color="#a0a0a5" />
                    <Text style={styles.infoText}>
                      {formatTanggal(item.tanggalSesi)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="clock" size={13} color="#a0a0a5" />
                    <Text style={styles.infoText}>{item.waktuSesi}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Alasan Praktikan */}
                  <View style={styles.reasonSection}>
                    <Text style={styles.reasonLabel}>Alasan Ketidakhadiran:</Text>
                    <Text style={styles.reasonText}>&ldquo;{item.alasan}&rdquo;</Text>
                  </View>

                  {/* Hasil Klasifikasi AI (FR-08) */}
                  <View style={styles.aiBadgeContainer}>
                    <View style={styles.aiHeader}>
                      <FontAwesome5 name="robot" size={12} color="#A5A2FF" />
                      <Text style={styles.aiHeaderTitle}>
                        Prediksi Kategori AI:
                      </Text>
                      <View style={styles.aiPill}>
                        <Text style={styles.aiPillText}>{item.kategoriAi}</Text>
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
                        Catatan Asisten ({item.reviewedByName || 'Asisten'}):
                      </Text>
                      <Text style={styles.noteText}>{item.catatanAsisten}</Text>
                    </View>
                  ) : null}

                  {/* Tombol Batalkan (jika masih pending) */}
                  {item.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.btnBatal}
                      onPress={() => handleBatal(item)}
                      disabled={batalLoading === item.id}
                    >
                      {batalLoading === item.id ? (
                        <ActivityIndicator size="small" color="#EF6464" />
                      ) : (
                        <>
                          <Feather name="trash-2" size={13} color="#EF6464" />
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
        onRequestClose={() => { if (!mengirim) setModalBuka(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Form Pengajuan Izin</Text>
              <TouchableOpacity
                onPress={() => !mengirim && setModalBuka(false)}
                disabled={mengirim}
              >
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                        ? '#48BB78'
                        : s.statusDb === 'closed'
                        ? '#a0a0a5'
                        : '#ECC94B';
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.sessionOption,
                          isSelected && styles.sessionOptionSelected,
                        ]}
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 10, color: statusColor, fontWeight: '600' }}>
                              {s.status}
                            </Text>
                            {isSelected && (
                              <Feather name="check" size={16} color="#625ff0" />
                            )}
                          </View>
                        </View>
                        <Text style={styles.sessionOptionSub}>
                          {s.hari}, {formatTanggal(s.tanggal)} ({s.waktu})
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
                placeholder="Contoh: Mengalami demam dan disarankan dokter istirahat selama 2 hari..."
                placeholderTextColor="#71717a"
                multiline
                numberOfLines={4}
                value={alasan}
                onChangeText={setAlasan}
                editable={!mengirim}
              />
              <Text style={styles.charCount}>
                Minimal 5 karakter ({alasan.trim().length} karakter)
              </Text>

              {/* Tombol Uji Coba Prediksi AI Langsung (FR-08) */}
              <TouchableOpacity
                style={[
                  styles.btnCekAi,
                  alasan.trim().length < 5 && styles.btnDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleCekAi}
                disabled={cekAiLoading || alasan.trim().length < 5}
              >
                {cekAiLoading ? (
                  <ActivityIndicator size="small" color="#A5A2FF" />
                ) : (
                  <>
                    <FontAwesome5 name="robot" size={13} color="#A5A2FF" />
                    <Text style={styles.btnCekAiText}>
                      Uji Prediksi AI Sekarang
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Box Preview Hasil AI */}
              {previewAi && (
                <View style={styles.previewAiBox}>
                  <View style={styles.previewAiHeader}>
                    <Feather name="check-circle" size={14} color="#48BB78" />
                    <Text style={styles.previewAiTitle}>Hasil Prediksi AI:</Text>
                    <View style={styles.previewAiPill}>
                      <Text style={styles.previewAiPillText}>
                        {previewAi.kategori}
                      </Text>
                    </View>
                  </View>
                  {previewAi.penjelasan ? (
                    <Text style={styles.previewAiDesc}>
                      {previewAi.penjelasan}
                    </Text>
                  ) : null}
                  <Text style={styles.previewAiSource}>
                    Akurasi:{' '}
                    {Math.round((previewAi.confidence || 0.9) * 100)}% · Sumber:{' '}
                    {previewAi.sumber === 'api' ? 'API Dosen' : 'Model AI LabTrack'}
                  </Text>
                </View>
              )}

              {/* AI Disclaimer Box */}
              <View style={styles.aiNoticeBox}>
                <FontAwesome5 name="robot" size={14} color="#A5A2FF" />
                <Text style={styles.aiNoticeText}>
                  Alasanmu akan dianalisis secara otomatis oleh model AI untuk
                  mengelompokkan kategori izin sebagai informasi pendukung bagi
                  asisten praktikum.
                </Text>
              </View>

              {/* Tombol Aksi Modal */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.btnModalBatal}
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
                  onPress={handleAjukan}
                  disabled={
                    !sesiDipilih || alasan.trim().length < 5 || mengirim
                  }
                >
                  {mengirim ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.btnModalKirimText}>Kirim Pengajuan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Pengaturan URL API AI Dosen (FR-08) */}
      <Modal
        visible={modalAiUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAiUrl(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Konfigurasi API AI Dosen</Text>
              <TouchableOpacity onPress={() => setModalAiUrl(false)}>
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>URL Endpoint API AI:</Text>
            <TextInput
              style={styles.inputUrl}
              placeholder="Contoh: https://api-ai.kampus.id/predict"
              placeholderTextColor="#71717a"
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.urlHint}>
              {inputUrl.trim()
                ? 'Model AI akan mengirim alasan ke URL di atas.'
                : 'Kosongkan untuk menggunakan Engine AI cerdas bawaan aplikasi (tanpa perlu server luar).'}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnModalBatal}
                onPress={() => setModalAiUrl(false)}
              >
                <Text style={styles.btnModalBatalText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnModalKirim}
                onPress={handleSimpanUrl}
              >
                <Text style={styles.btnModalKirimText}>Simpan URL</Text>
              </TouchableOpacity>
            </View>
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#333740',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  summaryLabel: { fontSize: 11, color: '#a0a0a5', marginTop: 4 },
  summaryDivider: { width: 1, height: 28, backgroundColor: '#333740' },

  btnAjukan: {
    backgroundColor: '#625ff0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 24,
    gap: 8,
  },
  btnAjukanText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },

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
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionBadge: {
    backgroundColor: '#2a2e36',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionBadgeText: { fontSize: 11, color: '#A5A2FF', fontWeight: '600' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  subjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: { fontSize: 12, color: '#a0a0a5' },

  divider: { height: 1, backgroundColor: '#333740', marginVertical: 10 },

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
    marginBottom: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiHeaderTitle: {
    fontSize: 11,
    color: '#c7d2fe',
    fontWeight: '600',
  },
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

  noteSection: {
    backgroundColor: '#262930',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#625ff0',
  },
  noteLabel: { fontSize: 11, color: '#a0a0a5', fontWeight: '600' },
  noteText: { fontSize: 12, color: '#ffffff', marginTop: 2 },

  btnBatal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginTop: 4,
  },
  btnBatalText: { fontSize: 12, color: '#EF6464', fontWeight: '600' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2124',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e4e4e7',
    marginBottom: 8,
    marginTop: 8,
  },
  required: { color: '#EF6464' },

  emptySesiText: {
    fontSize: 12,
    color: '#a0a0a5',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  sessionSelectContainer: { gap: 8, marginBottom: 14 },
  sessionOption: {
    backgroundColor: '#2a2e36',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  sessionOptionSelected: {
    borderColor: '#625ff0',
    backgroundColor: '#2e2c56',
  },
  sessionOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionOptionTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  textSelected: { color: '#A5A2FF' },
  sessionOptionSub: { fontSize: 12, color: '#a0a0a5', marginTop: 2 },

  textArea: {
    backgroundColor: '#2a2e36',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#3f3f46',
    textAlignVertical: 'top',
    minHeight: 90,
  },
  charCount: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'right',
  },

  aiNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#282745',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  aiNoticeText: {
    fontSize: 11,
    color: '#c7d2fe',
    flex: 1,
    lineHeight: 16,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  btnModalBatal: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2a2e36',
  },
  btnModalBatalText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  btnModalKirim: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#625ff0',
  },
  btnModalKirimText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },

  // Live Test AI & Setting AI Styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnSettingAi: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282745',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  btnSettingAiText: {
    fontSize: 12,
    color: '#A5A2FF',
    fontWeight: '700',
  },

  btnCekAi: {
    backgroundColor: '#282745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 12,
  },
  btnCekAiText: {
    color: '#A5A2FF',
    fontSize: 13,
    fontWeight: '700',
  },

  previewAiBox: {
    backgroundColor: '#1b2820',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
    marginBottom: 12,
  },
  previewAiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  previewAiTitle: {
    fontSize: 12,
    color: '#81c784',
    fontWeight: '600',
  },
  previewAiPill: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewAiPillText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  previewAiDesc: {
    fontSize: 12,
    color: '#c8e6c9',
    marginTop: 2,
    lineHeight: 16,
  },
  previewAiSource: {
    fontSize: 10,
    color: '#81c784',
    marginTop: 4,
    fontStyle: 'italic',
  },

  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1e2124',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333740',
  },
  inputUrl: {
    backgroundColor: '#2a2e36',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginBottom: 8,
  },
  urlHint: {
    fontSize: 11,
    color: '#a0a0a5',
    lineHeight: 15,
    marginBottom: 16,
  },
});
