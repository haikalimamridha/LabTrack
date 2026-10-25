
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
};

const SesiContext = createContext<SesiContextType | undefined>(
  undefined,
);

export function SesiProvider({ children }: { children: ReactNode }) {
  const [daftarSesi, setDaftarSesi] = useState<Sesi[]>(sesiDummy);

  const bukaSesi = (id: Sesi['id']) => {
    setDaftarSesi((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'Belum Dibuka'
          ? { ...item, status: 'Sedang Berlangsung' }
          : item,
      ),
    );
  };

  return (
    <SesiContext.Provider value={{ daftarSesi, bukaSesi }}>
      {children}
    </SesiContext.Provider>
  );
}

export function useSesi() {
  const context = useContext(SesiContext);

  if (!context) {
    throw new Error('useSesi harus digunakan di dalam SesiProvider');
  }

  return context;
}
