/**
 * Layanan Integrasi AI untuk Klasifikasi Alasan Izin (FR-08)
 *
 * Menggunakan model LinearSVC lokal (model-edom.json) via sentiment.js
 * yang berjalan 100% on-device tanpa koneksi internet.
 *
 * Jika URL API pengajar disetel dan merespons, gunakan hasil API sebagai prioritas utama.
 * Fallback: model lokal EDOM → keyword matching cerdas.
 */

// @ts-ignore – Pure JS module tanpa typings
const { createSentimentClassifier } = require('./sentiment');
// @ts-ignore – JSON model weights
const modelEdom = require('./model-edom.json');

export interface HasilKlasifikasiAi {
  kategori: string;
  penjelasan?: string;
  confidence?: number;
  sumber: 'api' | 'model-edom' | 'fallback';
}

declare const process: {
  env: {
    EXPO_PUBLIC_AI_API_URL?: string;
    [key: string]: string | undefined;
  };
};

// Inisialisasi classifier (sekali, saat module di-load)
let _classifier: ((text: string) => { label: string | null; status: string; scores: number[] | null }) | null = null;

function getClassifier() {
  if (!_classifier) {
    try {
      _classifier = createSentimentClassifier(modelEdom);
      console.log('[AI Service] Model EDOM lokal berhasil dimuat.');
    } catch (err) {
      console.error('[AI Service] Gagal memuat model EDOM:', err);
      _classifier = null;
    }
  }
  return _classifier;
}

// URL API pengajar (opsional, dari env atau runtime)
let customApiUrl: string | null = null;

/** Mengubah URL API AI secara dinamis saat runtime */
export function setAiApiUrl(url: string) {
  customApiUrl = url.trim() || null;
}

export function getAiApiUrl(): string {
  return customApiUrl || process.env.EXPO_PUBLIC_AI_API_URL || '';
}

// ─────────────────────────────────────────────
// Peta sentimen EDOM → kategori izin praktikum
// ─────────────────────────────────────────────
function sentimentToKategori(label: string | null): string {
  switch (label) {
    case 'positif': return 'Alasan Dapat Diterima';
    case 'netral':  return 'Alasan Perlu Verifikasi';
    case 'negatif': return 'Alasan Perlu Perhatian Khusus';
    default:        return 'Kepentingan Lainnya';
  }
}

function sentimentToPenjelasan(label: string | null): string {
  switch (label) {
    case 'positif': return 'Model AI menilai alasan ini tergolong wajar dan dapat diterima.';
    case 'netral':  return 'Model AI menilai alasan ini netral; perlu verifikasi lebih lanjut oleh asisten.';
    case 'negatif': return 'Model AI mendeteksi nada negatif pada alasan ini; pertimbangkan verifikasi tambahan.';
    default:        return 'Kosakata tidak dikenali model; analisis manual disarankan.';
  }
}

function sentimentToConfidence(scores: number[] | null, label: string | null): number {
  if (!scores || scores.length === 0 || label === null) return 0.5;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const range = max - min || 1;
  return Math.min(0.99, Math.max(0.5, 0.65 + (max / range) * 0.3));
}

// ─────────────────────────────────────────────
// Keyword fallback (jika model tidak mengenali)
// ─────────────────────────────────────────────
export function klasifikasiFallback(alasan: string): HasilKlasifikasiAi {
  const teks = (alasan || '').toLowerCase();

  const kataSakit = [
    'sakit', 'demam', 'pusing', 'flu', 'batuk', 'opname', 'rawat',
    'rs', 'rumah sakit', 'klinik', 'puskesmas', 'dokter', 'obat',
    'mual', 'muntah', 'tifus', 'tipes', 'diare', 'lambung', 'maag',
    'cedera', 'kecelakaan', 'patah', 'infeksi', 'isoman', 'covid',
    'bedrest', 'tidak enak badan', 'meriang', 'terkilir', 'asma',
  ];
  if (kataSakit.some((k) => teks.includes(k))) {
    return { kategori: 'Sakit', penjelasan: 'Kondisi kesehatan/medis.', confidence: 0.95, sumber: 'fallback' };
  }

  const kataAkademik = [
    'lomba', 'kompetisi', 'olimpiade', 'seminar', 'konferensi',
    'delegasi', 'sidang', 'skripsi', 'bimbingan', 'workshop',
    'magang', 'ujian', 'sertifikasi', 'tugas kampus', 'organisasi',
    'studi banding', 'kkn', 'kemahasiswaan', 'kuliah tamu', 'pelatihan',
  ];
  if (kataAkademik.some((k) => teks.includes(k))) {
    return { kategori: 'Akademik & Prestasi', penjelasan: 'Kegiatan resmi kampus.', confidence: 0.9, sumber: 'fallback' };
  }

  const kataKeluarga = [
    'keluarga', 'orang tua', 'ayah', 'ibu', 'kakek', 'nenek',
    'adik', 'kakak', 'saudara', 'meninggal', 'wafat', 'duka',
    'melahirkan', 'pernikahan', 'nikah', 'hajatan',
  ];
  if (kataKeluarga.some((k) => teks.includes(k))) {
    return { kategori: 'Keperluan Keluarga / Duka', penjelasan: 'Keperluan keluarga penting.', confidence: 0.88, sumber: 'fallback' };
  }

  const kataMendesak = [
    'banjir', 'macet parah', 'mogok', 'motor rusak', 'bencana',
    'musibah', 'mati lampu', 'kendaraan', 'darurat', 'ban bocor',
    'kecopetan', 'kemalingan',
  ];
  if (kataMendesak.some((k) => teks.includes(k))) {
    return { kategori: 'Keadaan Mendesak / Musibah', penjelasan: 'Kendala di luar kendali.', confidence: 0.85, sumber: 'fallback' };
  }

  return { kategori: 'Kepentingan Lainnya', penjelasan: 'Alasan umum; perlu verifikasi manual.', confidence: 0.75, sumber: 'fallback' };
}

// ─────────────────────────────────────────────
// Klasifikasi model EDOM lokal
// ─────────────────────────────────────────────
export function klasifikasiDenganModelEdom(alasan: string): HasilKlasifikasiAi {
  const classifier = getClassifier();
  if (!classifier) {
    console.warn('[AI Service] Classifier tidak tersedia, beralih ke fallback.');
    return klasifikasiFallback(alasan);
  }

  try {
    const result = classifier(alasan);
    console.log('[AI Service] Hasil model EDOM:', result);

    if (result.status === 'predicted' && result.label) {
      return {
        kategori: sentimentToKategori(result.label),
        penjelasan: `Sentimen: ${result.label.toUpperCase()} · ${sentimentToPenjelasan(result.label)}`,
        confidence: sentimentToConfidence(result.scores, result.label),
        sumber: 'model-edom',
      };
    }

    // Vocabulary tidak dikenali → fallback keyword
    console.log('[AI Service] Kosakata tidak dikenali model EDOM, beralih ke keyword matching.');
    const fb = klasifikasiFallback(alasan);
    return { ...fb, penjelasan: `[Model: ${result.status}] ${fb.penjelasan}` };
  } catch (err) {
    console.error('[AI Service] Error saat inferensi:', err);
    return klasifikasiFallback(alasan);
  }
}

// ─────────────────────────────────────────────
// Fungsi utama: klasifikasi alasan izin (FR-08)
// ─────────────────────────────────────────────
export async function klasifikasiAlasanIzin(alasan: string): Promise<HasilKlasifikasiAi> {
  const teksBersih = (alasan || '').trim();
  if (!teksBersih) {
    return { kategori: 'Tidak Diketahui', penjelasan: 'Alasan izin kosong.', confidence: 0, sumber: 'fallback' };
  }

  const apiUrl = getAiApiUrl();

  // 1. Jika URL API pengajar disetel → coba API (prioritas)
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      console.log(`[AI Service] Mencoba API pengajar: ${apiUrl}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ alasan: teksBersih, text: teksBersih }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const kategori = data.kategori || data.category || data.label || data.prediction || data.result;
        if (kategori && typeof kategori === 'string') {
          return {
            kategori,
            penjelasan: data.penjelasan || data.explanation || 'Hasil dari API pengajar.',
            confidence: typeof data.confidence === 'number' ? data.confidence : 0.92,
            sumber: 'api',
          };
        }
      }
    } catch (error) {
      console.warn('[AI Service] API pengajar tidak merespons, beralih ke model lokal:', error);
    }
  }

  // 2. Gunakan model EDOM lokal (on-device, tanpa internet)
  console.log('[AI Service] Menggunakan model EDOM lokal.');
  return klasifikasiDenganModelEdom(teksBersih);
}
