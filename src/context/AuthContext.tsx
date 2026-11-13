
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

// Tipe role pengguna
export type UserRole = 'praktikan' | 'asprak';

// Struktur profil pengguna
export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
  role: UserRole;
}

// Data yang dibutuhkan saat registrasi
export interface RegisterData {
  nama: string;
  email: string;
  nim: string;
  angkatan: string;
  jurusan: string;
}

// Struktur Auth Context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (
    data: RegisterData,
    password: string
  ) => Promise<void>;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

// Membuat context
const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Auth Provider
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  // Memantau status autentikasi Firebase
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
          const userRef = doc(
            firestore,
            'users',
            firebaseUser.uid
          );

          const snapshot = await getDoc(userRef);

          if (!mounted) return;

          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Gagal mengambil profil:', error);

          if (mounted) {
            setProfile(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      void loadProfile();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Registrasi pengguna
  const register = async (
    data: RegisterData,
    password: string
  ) => {
    const email = data.email.trim().toLowerCase();

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
    };

    const userRef = doc(firestore, 'users', uid);

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
    });

    setUser(credential.user);
    setProfile(newProfile);
  };

  // Login pengguna
  const login = async (
    email: string,
    password: string
  ) => {
    await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );
  };

  // Logout pengguna
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

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth harus digunakan di dalam AuthProvider'
    );
  }

  return context;
}
