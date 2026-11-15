
/**
 * Layanan Integrasi AI untuk Klasifikasi Alasan Izin (FR-08)
 *
 * Menggunakan model EDOM lokal (LinearSVC) melalui sentiment.js.
 * Model berjalan secara lokal tanpa memerlukan koneksi internet.
 *
 * Hasil analisis sentimen hanya menjadi informasi pendukung
 * bagi Asprak, bukan penentu persetujuan izin.
 */

// @ts-ignore - Pure JS module tanpa typings
const { createSentimentClassifier } = require('../../ai/sentiment.js');

// @ts-ignore - JSON model weights
const modelEdom = require('../../ai/model-edom.json');

export interface HasilKlasifikasiAi {
  kategori: string;
  penjelasan?: string;
  confidence?: number;
  sentimen?: 'positif' | 'netral' | 'negatif' | null;
  sumber: 'model-edom' | 'fallback';
}

// Inisialisasi classifier satu kali
let _classifier:
  | ((text: string) => {
      label: string | null;
      status: string;
      scores: number[] | null;
    })
  | null = null;

function getClassifier() {
  if (!_classifier) {
    try {
      _classifier = createSentimentClassifier(modelEdom);
      console.log('[AI Service] Model EDOM berhasil dimuat.');
    } catch (err) {
      console.error('[AI Service] Gagal memuat model EDOM:', err);
      _classifier = null;
    }
  }

  return _classifier;
}

// Keyword fallback
export function klasifikasiFallback(alasan: string): HasilKlasifikasiAi {
  const teks = (alasan || '').toLowerCase();

  const kataSakit = [
    'sakit', 'demam', 'pusing', 'flu', 'batuk', 'opname',
    'rawat', 'rs', 'rumah sakit', 'klinik', 'puskesmas',
    'dokter', 'obat', 'mual', 'muntah', 'tifus', 'tipes',
    'diare', 'lambung', 'maag', 'cedera', 'kecelakaan',
    'infeksi', 'covid', 'bedrest', 'meriang', 'asma'
  ];

  if (kataSakit.some((k) => teks.includes(k))) {
    return {
      kategori: 'Sakit',
      penjelasan: 'Alasan berkaitan dengan kondisi kesehatan.',
      sumber: 'fallback'
    };
  }

  const kataAkademik = [
    'lomba', 'kompetisi', 'olimpiade', 'seminar',
    'konferensi', 'delegasi', 'sidang', 'skripsi',
    'bimbingan', 'workshop', 'magang', 'ujian',
    'sertifikasi', 'organisasi', 'kkn', 'kemahasiswaan'
  ];

  if (kataAkademik.some((k) => teks.includes(k))) {
    return {
      kategori: 'Akademik & Prestasi',
      penjelasan: 'Alasan berkaitan dengan kegiatan akademik atau kampus.',
      sumber: 'fallback'
    };
  }

  const kataKeluarga = [
    'keluarga', 'orang tua', 'ayah', 'ibu', 'kakek',
    'nenek', 'adik', 'kakak', 'saudara', 'meninggal',
    'wafat', 'duka', 'melahirkan', 'pernikahan', 'nikah'
  ];

  if (kataKeluarga.some((k) => teks.includes(k))) {
    return {
      kategori: 'Keperluan Keluarga / Duka',
      penjelasan: 'Alasan berkaitan dengan keperluan keluarga.',
      sumber: 'fallback'
    };
  }

  const kataMendesak = [
    'banjir', 'macet parah', 'mogok', 'motor rusak',
    'bencana', 'musibah', 'mati lampu', 'kendaraan',
    'darurat', 'ban bocor', 'kecopetan', 'kemalingan'
  ];

  if (kataMendesak.some((k) => teks.includes(k))) {
    return {
      kategori: 'Keadaan Mendesak / Musibah',
      penjelasan: 'Alasan berkaitan dengan keadaan mendesak.',
      sumber: 'fallback'
    };
  }

  return {
    kategori: 'Kepentingan Lainnya',
    penjelasan: 'Kategori tidak dikenali secara otomatis. Perlu verifikasi manual.',
    sumber: 'fallback'
  };
}

// Klasifikasi menggunakan model EDOM lokal
export function klasifikasiDenganModelEdom(
  alasan: string
): HasilKlasifikasiAi {
  const classifier = getClassifier();

  if (!classifier) {
    return klasifikasiFallback(alasan);
  }

  try {
    const result = classifier(alasan);

    console.log('[AI Service] Hasil model EDOM:', result);

    if (result.status === 'predicted' && result.label) {
      return {
        kategori: 'Hasil Analisis Sentimen',
        sentimen: result.label as 'positif' | 'netral' | 'negatif',
        penjelasan: `Model EDOM mendeteksi sentimen ${result.label}. Hasil ini hanya informasi pendukung dan bukan penilaian kelayakan izin.`,
        sumber: 'model-edom'
      };
    }

    // Jika kosakata tidak dikenali, gunakan keyword fallback.
    const fallback = klasifikasiFallback(alasan);

    return {
      ...fallback,
      penjelasan: `Model EDOM tidak dapat memprediksi teks (${result.status}). ${fallback.penjelasan}`
    };

  } catch (err) {
    console.error('[AI Service] Error inferensi EDOM:', err);
    return klasifikasiFallback(alasan);
  }
}

// Fungsi utama klasifikasi alasan izin (FR-08)
export async function klasifikasiAlasanIzin(
  alasan: string
): Promise<HasilKlasifikasiAi> {
  const teksBersih = (alasan || '').trim();

  if (!teksBersih) {
    return {
      kategori: 'Tidak Diketahui',
      penjelasan: 'Alasan izin kosong.',
      sumber: 'fallback'
    };
  }

  console.log('[AI Service] Menggunakan model EDOM lokal.');

  return klasifikasiDenganModelEdom(teksBersih);
}
