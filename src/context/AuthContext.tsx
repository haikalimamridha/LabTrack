
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { User } from '@react-native-firebase/auth';

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';

import { auth, firestore } from '@/config/firebase';

export type UserRole = 'praktikan' | 'asprak';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
  role: UserRole;
  kelasId: string | null;
}

export interface RegisterData {
  nama: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
  kelasId: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (data: RegisterData, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!mounted) return;

      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const loadProfile = async () => {
        try {
          const userRef = doc(firestore, 'users', firebaseUser.uid);
          const snapshot = await getDoc(userRef);

          if (!mounted) return;

          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Gagal mengambil profil:', error);

          if (mounted) setProfile(null);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      void loadProfile();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const register = async (data: RegisterData, password: string) => {
    const email = data.email.trim().toLowerCase();
    const kelasId = data.kelasId.trim();

    if (!kelasId) {
      throw new Error('Silakan pilih kelas terlebih dahulu.');
    }

    // Pastikan kelas masih tersedia dan aktif.
    const kelasRef = doc(firestore, 'kelas', kelasId);
    const kelasSnapshot = await getDoc(kelasRef);

    if (!kelasSnapshot.exists() || kelasSnapshot.data().aktif !== true) {
      throw new Error('Kelas tidak tersedia atau sudah tidak aktif.');
    }

    // Membuat akun Firebase Authentication.
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = credential.user.uid;

    const newProfile: UserProfile = {
      uid,
      nama: data.nama.trim(),
      email,
      nim: data.nim.trim(),
      angkatan: data.angkatan.trim(),
      jurusan: data.jurusan.trim(),
      role: 'praktikan',
      kelasId,
    };

    // Menyimpan profil praktikan ke Firestore.
    const userRef = doc(firestore, 'users', uid);

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
    });

    setUser(credential.user);
    setProfile(newProfile);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
}
