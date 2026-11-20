import { useAuth } from "@/context/AuthContext";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePresensi } from "../../context/PresensiContext";
import {
  formatTanggal,
  waktuMulaiSesi,
} from "../../services/sessionService";

export default function Index() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  const {
    daftarSesi,
    loading,
    error,
    sudahPresensi,
  } = usePresensi();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Logout
  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Gagal logout:", err);
      Alert.alert("Gagal", "Tidak dapat melakukan logout.");
    }
  };

  // Data profil
  const nama = profile?.nama ?? "Praktikan";

  const inisial = nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();

  // Ringkasan presensi
  const totalSesi = daftarSesi.length;

  const sudahHadir = daftarSesi.filter((item) =>
    sudahPresensi(item.id)
  ).length;

  const belumHadir = totalSesi - sudahHadir;

  // Sesi terdekat
  const sesiTerdekat = daftarSesi
    .filter((item) => item.status !== "Selesai")
    .sort(
      (a, b) => waktuMulaiSesi(a) - waktuMulaiSesi(b)
    )
    .slice(0, 2);

  // Menu dashboard
  const menuItems = [
    {
      label: "Jadwal",
      icon: "calendar-month" as const,
      onPress: () => router.push("/praktikan/jadwal"),
    },
    {
      label: "Presensi",
      icon: "qrcode-scan" as const,
      onPress: () => router.push("/praktikan/presensi"),
    },
    {
      label: "Izin",
      icon: "file-document-outline" as const,
      onPress: () => router.push("/praktikan/izin"),
    },
    {
      label: "Maps",
      icon: "map-marker-radius-outline" as const,
      onPress: () =>
        Alert.alert(
          "Maps",
          "Fitur peta lokasi lab segera hadir."
        ),
    },
    {
      label: "Riwayat",
      icon: "history" as const,
      onPress: () => router.push("/praktikan/riwayat"),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        decelerationRate="normal"
      >
        {/* HEADER */}
        <View style={styles.headerBanner}>
          <View style={styles.headerRow}>
            {/* Avatar dan menu logout */}
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.avatarText}>
                  {inisial || "P"}
                </Text>
              </TouchableOpacity>

              {showProfileMenu && (
                <View style={styles.profileMenu}>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name="log-out"
                      size={16}
                      color="#FF6B7E"
                    />
                    <Text style={styles.logoutText}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Informasi pengguna */}
            <View style={styles.headerTextCol}>
              <Text style={styles.helloText}>
                Hello!
              </Text>

              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {nama}
              </Text>
            </View>

            {/* Notifikasi */}
            <TouchableOpacity
              style={styles.notifButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/praktikan/jadwal")
              }
            >
              <Ionicons
                name="notifications"
                size={24}
                color="#FFFFFF"
              />

              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          {/* RINGKASAN */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardMutedTitle}>
                Ringkasan
              </Text>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push("/praktikan/jadwal")
                }
              >
                <Text style={styles.purpleLink}>
                  Jadwal Saya
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Sesi
              </Text>

              <Text style={styles.summaryValue}>
                {totalSesi}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Sudah Hadir
              </Text>

              <Text style={styles.summaryValue}>
                {sudahHadir}
              </Text>
            </View>

            <View
              style={[
                styles.summaryRow,
                { marginBottom: 0 },
              ]}
            >
              <Text style={styles.summaryLabel}>
                Belum Hadir
              </Text>

              <Text style={styles.summaryValue}>
                {belumHadir}
              </Text>
            </View>
          </View>

          {/* MENU DASHBOARD */}
          <View style={styles.menuCard}>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuBox}
                  onPress={item.onPress}
                  activeOpacity={0.85}
                >
                  <View style={styles.menuWhiteCircle}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={21}
                      color="#4A4665"
                    />
                  </View>

                  <Text style={styles.menuLabel}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SESI TERDEKAT */}
          <View style={styles.nearestCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardMutedTitle}>
                Sesi Terdekat
              </Text>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push("/praktikan/jadwal")
                }
              >
                <Text style={styles.purpleLink}>
                  Lihat Semua
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator color="#9623D6" />
              </View>
            ) : error ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  Gagal memuat sesi
                </Text>

                <Text style={styles.emptyText}>
                  {error}
                </Text>
              </View>
            ) : sesiTerdekat.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>
                  Belum Ada Jadwal
                </Text>

                <Text style={styles.emptyText}>
                  Kamu belum memiliki jadwal praktikum
                  mendatang.
                </Text>
              </View>
            ) : (
              sesiTerdekat.map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.sessionItem,
                    idx === sesiTerdekat.length - 1 && {
                      marginBottom: 0,
                    },
                  ]}
                >
                  <View style={styles.sessionTopRow}>
                    <Text style={styles.sessionCode}>
                      {item.kode || `Kelas ${item.kelas}`}
                    </Text>

                    <Text style={styles.sessionStatus}>
                      {item.status}
                    </Text>
                  </View>

                  <Text
                    style={styles.sessionName}
                    numberOfLines={1}
                  >
                    {item.mataPraktikum}
                  </Text>

                  <Text style={styles.sessionMeta}>
                    {item.hari},{" "}
                    {formatTanggal(item.tanggal)} ·{" "}
                    {item.waktu} · {item.ruangan}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B3A",
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 140,
  },

  // Header
  headerBanner: {
    backgroundColor: "#9623D6",
    paddingTop: 52,
    paddingBottom: 62,
    paddingHorizontal: 22,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    position: "relative",
    zIndex: 100,
    marginRight: 14,
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#25A9C9",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  profileMenu: {
    position: "absolute",
    top: 56,
    left: 0,
    backgroundColor: "#2F2B44",
    borderWidth: 1,
    borderColor: "#4A4566",
    borderRadius: 12,
    padding: 6,
    minWidth: 130,
    elevation: 8,
    zIndex: 200,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  logoutText: {
    color: "#FF6B7E",
    fontSize: 13,
    fontWeight: "600",
  },

  headerTextCol: {
    flex: 1,
  },

  helloText: {
    color: "#F3E5FF",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  notifButton: {
    position: "relative",
    padding: 6,
  },

  notifDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },

  // Body
  body: {
    paddingHorizontal: 20,
  },

  // Summary
  summaryCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 20,
    marginTop: -40,
    marginBottom: 18,
    elevation: 4,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  cardMutedTitle: {
    color: "#8E8AA3",
    fontSize: 13,
    fontWeight: "500",
  },

  purpleLink: {
    color: "#9623D6",
    fontSize: 13,
    fontWeight: "600",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Menu
  menuCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 12,
    rowGap: 14,
  },

  menuBox: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#4A4665",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  menuWhiteCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  menuLabel: {
    color: "#E2DFEE",
    fontSize: 12,
    fontWeight: "500",
  },

  // Nearest session
  nearestCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 20,
    minHeight: 190,
  },

  sessionItem: {
    backgroundColor: "#3A3654",
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
  },

  sessionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  sessionCode: {
    color: "#B56DF0",
    fontSize: 11,
    fontWeight: "700",
  },

  sessionStatus: {
    color: "#D5C2FF",
    fontSize: 11,
    fontWeight: "600",
  },

  sessionName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  sessionMeta: {
    color: "#B8B4C8",
    fontSize: 11,
  },

  emptyBox: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  emptyText: {
    color: "#8E8AA3",
    fontSize: 12,
    textAlign: "center",
  },
});