import { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePresensi } from '../../context/PresensiContext';
import { Sesi, StatusSesi } from '../../data/sesi';

const filters: (string | StatusSesi)[] = [
  'Semua',
  'Belum Dibuka',
  'Sedang Berlangsung',
  'Selesai',
];

type ModalState = {
  visible: boolean;
  type: 'buka' | 'tutup';
  sesi: Sesi | null;
};

type Toast = { pesan: string; ok: boolean } | null;

export default function SesiScreen() {
  const router = useRouter();
  const { daftarSesi, bukaSesi, tutupSesi, getRekapSesi, simulasiPresensi } =
    usePresensi();

  const [filterAktif, setFilterAktif] = useState<string>('Semua');
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: 'buka',
    sesi: null,
  });

  const [toast, setToast] = useState<Toast>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const tampilkanToast = (pesan: string, ok: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ pesan, ok });
    timerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (type: 'buka' | 'tutup', sesi: Sesi) => {
    setModal({
      visible: true,
      type,
      sesi,
    });
  };

  const handleConfirmModal = () => {
    if (!modal.sesi) return;

    if (modal.type === 'buka') {
      const res = bukaSesi(modal.sesi.id);
      tampilkanToast(res.pesan, res.ok);
    } else {
      const res = tutupSesi(modal.sesi.id);
      tampilkanToast(res.pesan, res.ok);
    }

    setModal({ visible: false, type: 'buka', sesi: null });
  };

  const handleSimulasi = (sesiId: number) => {
    const res = simulasiPresensi(sesiId);
    tampilkanToast(res.pesan, res.ok);
  };

  const daftarSesiFiltered = daftarSesi.filter(
    (item) => filterAktif === 'Semua' || item.status === filterAktif
  );

  const getStatusBadgeStyle = (status: StatusSesi) => {
    switch (status) {
      case 'Sedang Berlangsung':
        return styles.statusBerlangsung;
      case 'Belum Dibuka':
        return styles.statusBelumDibuka;
      case 'Selesai':
      default:
        return styles.statusSelesai;
    }
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <View
          style={[
            styles.toast,
            toast.ok ? styles.toastSukses : styles.toastGagal,
          ]}
        >
          <Text style={styles.toastText}>{toast.pesan}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>LABTRACK</Text>
            <Text style={styles.title}>Kelola Kontrol Sesi</Text>
            <Text style={styles.subtitle}>
              Buka sesi untuk mengaktifkan presensi praktikan, atau tutup sesi setelah kegiatan laboratorium selesai.
            </Text>
          </View>

          {/* Filter Status */}
          <Text style={styles.sectionTitle}>Filter Status Sesi</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filters.map((filter) => {
              const aktif = filterAktif === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.7}
                  style={[
                    styles.filterButton,
                    aktif && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterAktif(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      aktif && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Daftar Sesi */}
          {daftarSesiFiltered.length > 0 ? (
            daftarSesiFiltered.map((item) => {
              const rekap = getRekapSesi(item.id);
              const totalHadir = rekap.length;

              return (
                <View key={item.id} style={styles.sessionCard}>
                  {/* Top card: Kode & Status Badge (FR-16) */}
                  <View style={styles.cardTop}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{item.kode}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusBadgeStyle(item.status),
                      ]}
                    >
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.sessionName}>{item.mataPraktikum}</Text>
                  <Text style={styles.classText}>
                    Kelas {item.kelas} {item.modul ? `• ${item.modul}` : ''}
                  </Text>

                  <View style={styles.divider} />

                  {/* Detail jadwal & sesi (FR-12) */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tanggal</Text>
                    <Text style={styles.detailValue}>
                      {item.hari}, {item.tanggal}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Waktu Praktikum</Text>
                    <Text style={styles.detailValue}>{item.waktu} WIB</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ruangan</Text>
                    <Text style={styles.detailValue}>{item.ruangan}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Waktu Sesi Dibuka</Text>
                    <Text style={styles.detailValue}>
                      {item.waktuBuka ? `${item.waktuBuka}` : 'Belum dibuka'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Waktu Sesi Ditutup</Text>
                    <Text style={styles.detailValue}>
                      {item.waktuTutup ? `${item.waktuTutup}` : 'Belum ditutup'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kehadiran Mahasiswa</Text>
                    <Text style={[styles.detailValue, { color: '#86EFAC', fontWeight: 'bold' }]}>
                      {totalHadir} / {item.totalPraktikan} praktikan hadir
                    </Text>
                  </View>

                  <View style={styles.actionDivider} />

                  {/* Kontrol Tombol Buka & Tutup Sesi (FR-13 & FR-15) */}
                  <View style={styles.controlButtonsContainer}>
                    {/* Tombol Buka Sesi (FR-13) */}
                    {item.status === 'Belum Dibuka' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnBuka]}
                        activeOpacity={0.8}
                        onPress={() => handleOpenModal('buka', item)}
                      >
                        <Text style={styles.btnActionText}>▶ Buka Sesi Praktikum</Text>
                      </TouchableOpacity>
                    )}

                    {/* Tombol Tutup Sesi (FR-15) */}
                    {item.status === 'Sedang Berlangsung' && (
                      <>
                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnTutup]}
                          activeOpacity={0.8}
                          onPress={() => handleOpenModal('tutup', item)}
                        >
                          <Text style={styles.btnActionText}>⏹ Tutup Sesi Praktikum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnSimulasi]}
                          activeOpacity={0.8}
                          onPress={() => handleSimulasi(item.id)}
                        >
                          <Text style={styles.btnSimulasiText}>+ Simulasi Presensi</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Selesai status notice */}
                    {item.status === 'Selesai' && (
                      <View style={styles.completedNotice}>
                        <Text style={styles.completedNoticeText}>
                          ✓ Sesi telah selesai ditutup pada {item.waktuTutup ?? '-'}.
                        </Text>
                      </View>
                    )}

                    {/* Tombol Menuju Rekap Presensi */}
                    <TouchableOpacity
                      style={styles.btnLihatRekap}
                      activeOpacity={0.8}
                      onPress={() =>
                        router.push({
                          pathname: '/asprak/riwayat',
                          params: { sesiId: item.id },
                        })
                      }
                    >
                      <Text style={styles.btnLihatRekapText}>
                        Lihat Rekap Presensi ({totalHadir}) →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Tidak ada sesi</Text>
              <Text style={styles.emptyDescription}>
                Belum ada sesi praktikum dengan status {filterAktif.toLowerCase()}.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal Konfirmasi Buka / Tutup Sesi */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModal({ visible: false, type: 'buka', sesi: null })
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {modal.type === 'buka'
                ? 'Konfirmasi Pembukaan Sesi'
                : 'Konfirmasi Penutupan Sesi'}
            </Text>

            <Text style={styles.modalText}>
              {modal.type === 'buka'
                ? 'Apakah Anda yakin ingin membuka sesi praktikum ini? Praktikan akan dapat melakukan presensi kehadiran.'
                : 'Apakah Anda yakin ingin menutup sesi praktikum ini? Mahasiswa tidak dapat lagi melakukan presensi setelah sesi ditutup.'}
            </Text>

            {modal.sesi && (
              <View style={styles.modalSesiBox}>
                <Text style={styles.modalSubject}>
                  {modal.sesi.mataPraktikum}
                </Text>
                <Text style={styles.modalSesiMeta}>
                  {modal.sesi.kode} • Kelas {modal.sesi.kelas} • {modal.sesi.ruangan}
                </Text>
                <Text style={styles.modalSesiMeta}>
                  Jadwal: {modal.sesi.waktu} WIB ({modal.sesi.hari})
                </Text>
              </View>
            )}

            <Text style={styles.modalHint}>
              Status sesi akan segera diperbarui di seluruh antarmuka aplikasi.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() =>
                  setModal({ visible: false, type: 'buka', sesi: null })
                }
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  modal.type === 'buka'
                    ? styles.modalConfirmBuka
                    : styles.modalConfirmTutup,
                ]}
                onPress={handleConfirmModal}
              >
                <Text style={styles.modalConfirmText}>
                  {modal.type === 'buka' ? 'Ya, Buka Sesi' : 'Ya, Tutup Sesi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  content: {
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
    marginBottom: 24,
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
    lineHeight: 19,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterContainer: {
    gap: 8,
    paddingBottom: 18,
  },
  filterButton: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterButtonActive: {
    backgroundColor: '#625FF0',
    borderColor: '#625FF0',
  },
  filterText: {
    color: '#B8BCC4',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sessionCard: {
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#45416F',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  codeText: {
    color: '#C7C5FF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBelumDibuka: {
    backgroundColor: '#854D0E',
  },
  statusBerlangsung: {
    backgroundColor: '#164E63',
  },
  statusSelesai: {
    backgroundColor: '#4B5563',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sessionName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 23,
    marginBottom: 4,
  },
  classText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  detailLabel: {
    color: '#B8BCC4',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flexShrink: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#454B55',
    marginVertical: 14,
  },
  controlButtonsContainer: {
    gap: 10,
  },
  btnAction: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBuka: {
    backgroundColor: '#166534',
  },
  btnTutup: {
    backgroundColor: '#991B1B',
  },
  btnActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  btnSimulasi: {
    backgroundColor: '#2A303C',
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  btnSimulasiText: {
    color: '#A5A2FF',
    fontSize: 12,
    fontWeight: '600',
  },
  btnLihatRekap: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#34354A',
    borderWidth: 1,
    borderColor: '#45416F',
  },
  btnLihatRekapText: {
    color: '#D8D6FF',
    fontSize: 12,
    fontWeight: '600',
  },
  completedNotice: {
    backgroundColor: '#2A2E35',
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 12,
    borderRadius: 10,
  },
  completedNoticeText: {
    color: '#A6ABB5',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#343941',
    borderWidth: 1,
    borderColor: '#454B55',
    borderRadius: 16,
    padding: 28,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#B8BCC4',
    fontSize: 12,
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    maxWidth: 500,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 99,
    elevation: 10,
  },
  toastSukses: {
    backgroundColor: '#166534',
  },
  toastGagal: {
    backgroundColor: '#991B1B',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#343941',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#454B55',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  modalSesiBox: {
    backgroundColor: '#25292E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#454B55',
    padding: 12,
    marginBottom: 12,
  },
  modalSubject: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSesiMeta: {
    color: '#A5A2FF',
    fontSize: 12,
    marginTop: 2,
  },
  modalHint: {
    color: '#8E95A2',
    fontSize: 11,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: '#555B65',
  },
  modalCancelText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 13,
  },
  modalConfirmBuka: {
    backgroundColor: '#166534',
  },
  modalConfirmTutup: {
    backgroundColor: '#991B1B',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
