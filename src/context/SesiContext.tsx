import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from 'react';

import { sesiDummy } from '../data/sesi';

type Sesi = (typeof sesiDummy)[number];

type SesiContextType = {
  daftarSesi: Sesi[];
  bukaSesi: (id: Sesi['id']) => void;
  tutupSesi: (id: Sesi['id']) => void;
};

const SesiContext = createContext<SesiContextType | undefined>(
  undefined,
);

export function SesiProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>(sesiDummy);

  // Membuka sesi praktikum
  const bukaSesi = (id: Sesi['id']) => {
    setDaftarSesi((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'Belum Dibuka'
          ? { ...item, status: 'Sedang Berlangsung' }
          : item,
      ),
    );
  };

  // Menutup sesi praktikum
  const tutupSesi = (id: Sesi['id']) => {
    setDaftarSesi((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'Sedang Berlangsung'
          ? { ...item, status: 'Selesai' }
          : item,
      ),
    );
  };

  return (
    <SesiContext.Provider
      value={{
        daftarSesi,
        bukaSesi,
        tutupSesi,
      }}
    >
      {children}
    </SesiContext.Provider>
  );
}

export function useSesi() {
  const context = useContext(SesiContext);

  if (!context) {
    throw new Error(
      'useSesi harus digunakan di dalam SesiProvider',
    );
  }

  return context;
}
