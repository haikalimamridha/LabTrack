
import { useAuth } from "@/context/AuthContext";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      icon: "account-check" as const,
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
      onPress: () => router.push("/praktikan/maps"),
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
        bounces
        alwaysBounceVertical
        overScrollMode="always"
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#7928CA", "#512DA8", "#29215C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBanner}
        >
          <View style={styles.headerDecoration} />

          <View style={styles.headerRow}>
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

            <View style={styles.headerTextCol}>
              <Text style={styles.helloText}>Hello!</Text>

              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {nama}
              </Text>

              <Text style={styles.welcomeText}>
                Selamat datang di LabTrack
              </Text>
            </View>

            <TouchableOpacity
              style={styles.notifButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push("/praktikan/jadwal")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={23}
                color="#FFFFFF"
              />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>
          {/* RINGKASAN */}
          <LinearGradient
            colors={["#39325E", "#292542", "#25213C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardMutedTitle}>
                  Ringkasan Presensi
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push("/praktikan/jadwal")
                }
              >
                <Text style={styles.purpleLink}>
                  Jadwal Saya →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {totalSesi}
                </Text>
                <Text style={styles.statLabel}>
                  Total Sesi
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {sudahHadir}
                </Text>
                <Text style={styles.statLabel}>
                  Sudah Hadir
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {belumHadir}
                </Text>
                <Text style={styles.statLabel}>
                  Belum Hadir
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* MENU DASHBOARD */}
          <LinearGradient
            colors={["#39325E", "#292542"]}
            style={styles.menuCard}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.cardMutedTitle}>
                Menu Utama
              </Text>
            </View>

            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.menuBox}
                  onPress={item.onPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#7651C9", "#49358B"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuIconCircle}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={23}
                      color="#FFFFFF"
                    />
                  </LinearGradient>

                  <Text style={styles.menuLabel}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>

          {/* SESI TERDEKAT */}
          <LinearGradient
            colors={["#39325E", "#292542", "#25213C"]}
            style={styles.nearestCard}
          >
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardMutedTitle}>
                  Sesi Terdekat
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  router.push("/praktikan/jadwal")
                }
              >
                <Text style={styles.purpleLink}>
                  Lihat Semua →
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator color="#B58AFF" />
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
                <Ionicons
                  name="calendar-outline"
                  size={30}
                  color="#77718F"
                />
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

                    <View style={styles.statusBadge}>
                      <Text style={styles.sessionStatus}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.sessionName}
                    numberOfLines={1}
                  >
                    {item.mataPraktikum}
                  </Text>

                  <View style={styles.sessionMetaRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#AAA4C5"
                    />
                    <Text style={styles.sessionMeta}>
                      {item.hari},{" "}
                      {formatTanggal(item.tanggal)}
                    </Text>
                  </View>

                  <View style={styles.sessionMetaRow}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color="#AAA4C5"
                    />
                    <Text style={styles.sessionMeta}>
                      {item.waktu}
                    </Text>

                    <Ionicons
                      name="location-outline"
                      size={13}
                      color="#AAA4C5"
                      style={{ marginLeft: 8 }}
                    />
                    <Text style={styles.sessionMeta}>
                      {item.ruangan}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B35",
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 180,
  },

  // Header
  headerBanner: {
    paddingTop: 58,
    paddingBottom: 78,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "visible",
  },

  headerDecoration: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.06)",
    right: -55,
    top: -55,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
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
    top: 58,
    left: 0,
    backgroundColor: "#302B49",
    borderWidth: 1,
    borderColor: "#51496E",
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
    color: "#FF8494",
    fontSize: 13,
    fontWeight: "600",
  },

  headerTextCol: {
    flex: 1,
  },

  helloText: {
    color: "#E4D8FF",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 3,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  welcomeText: {
    color: "#D2C4F0",
    fontSize: 11,
    marginTop: 4,
  },

  notifButton: {
    position: "relative",
    padding: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 13,
  },

  notifDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF718D",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  // Body
  body: {
    paddingHorizontal: 20,
    marginTop: -42,
  },

  // Card header
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 19,
  },

  cardMutedTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  purpleLink: {
    color: "#C5A3FF",
    fontSize: 12,
    fontWeight: "600",
  },

  // Summary
  summaryCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    elevation: 5,
  },

  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 5,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },

  statLabel: {
    color: "#B8B1D0",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 37,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // Menu
  menuCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  sectionHeader: {
    marginBottom: 18,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    columnGap: 12,
    rowGap: 13,
  },

  menuBox: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  menuIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  menuLabel: {
    color: "#F0EDF9",
    fontSize: 12,
    fontWeight: "600",
  },

  // Nearest session
  nearestCard: {
    borderRadius: 22,
    padding: 20,
    minHeight: 190,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    elevation: 5,
  },

  sessionItem: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  sessionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  sessionCode: {
    color: "#C4A4FF",
    fontSize: 11,
    fontWeight: "700",
  },

  statusBadge: {
    backgroundColor: "rgba(181,138,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  sessionStatus: {
    color: "#D9C5FF",
    fontSize: 10,
    fontWeight: "600",
  },

  sessionName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 11,
  },

  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },

  sessionMeta: {
    color: "#AAA4C5",
    fontSize: 10,
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
    marginTop: 8,
    marginBottom: 5,
  },

  emptyText: {
    color: "#AAA4C5",
    fontSize: 12,
    textAlign: "center",
  },

  footerText: {
    color: "#716B8D",
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 25,
  },
});
