import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
    HARI,
    pesanError,
    subscribeJadwal,
    type Jadwal,
} from "@/services/sessionService";

const urutkan = (a: Jadwal, b: Jadwal) =>
  HARI.indexOf(a.hari) - HARI.indexOf(b.hari) || a.waktu.localeCompare(b.waktu);

/**
 * Jadwal real-time.
 * - praktikan: hanya jadwal kelasnya sendiri
 * - asprak: semua jadwal
 */
export function useJadwal() {
  const { profile } = useAuth();
  const uid = profile?.uid ?? null;
  const role = profile?.role ?? null;
  const kelasId = profile?.kelasId ?? null;

  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Praktikan yang belum punya kelas (akun lama) tidak punya jadwal apa pun.
  const tanpaKelas = role === "praktikan" && !kelasId;

  useEffect(() => {
    setError(null);

    if (!uid || !role || tanpaKelas) {
      setJadwal([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const stop = subscribeJadwal(
      role === "asprak" ? null : kelasId,
      (data) => {
        setJadwal([...data].sort(urutkan));
        setLoading(false);
      },
      (e) => {
        console.error("Listener jadwal gagal:", e);
        setError(pesanError(e, "Kamu tidak punya akses ke data jadwal."));
        setLoading(false);
      },
    );

    return stop;
  }, [uid, role, kelasId, tanpaKelas]);

  return { jadwal, loading, error, tanpaKelas };
}
