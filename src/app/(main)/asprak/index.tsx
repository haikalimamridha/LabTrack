
import { useAuth } from "@/context/AuthContext";
import { useSesi } from "@/context/SesiContext";

import AppBadge from "@/components/ui/appBadge";
import AppCard from "@/components/ui/appCard";
import AppSectionTitle from "@/components/ui/appSectionTitle";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  formatTanggal,
  waktuMulaiSesi,
} from "@/services/sessionService";

import { listenLaboratorium, type Laboratorium } from "@/services/laboratoriumService";

export default function AsistenDashboard() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  const {
    daftarSesi,
    loading,
    error,
  } = useSesi();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [daftarLab, setDaftarLab] = useState<Laboratorium[]>([]);
  
  useEffect(() => {
    const unsubscribe = listenLaboratorium(
      (data) => {
        setDaftarLab(data);
      },
      (error) => {
        console.error("Gagal memuat laboratorium:", error);
      }
    );

    return unsubscribe;
  }, []);
  

  // Data profil
  const namaAsisten = profile?.nama ?? "Asisten";
  const nimAsisten = profile?.nim ?? "-";
  const angkatanAsisten = profile?.angkatan ?? "-";
  const jurusanAsisten = profile?.jurusan ?? "-";

  const inisial = namaAsisten
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  // Ringkasan sesi
  const totalSesi = daftarSesi.length;

  const totalSesiMendatang = daftarSesi.filter(
    (item) => item.status === "Belum Dibuka"
  ).length;

  // Sesi terdekat
  const sekarang = Date.now();

  const sesiTerdekat = daftarSesi
    .filter(
      (item) =>
        item.statusDb === "open" ||
        (item.statusDb === "draft" &&
          waktuMulaiSesi(item) >= sekarang)
    )
    .sort(
      (a, b) =>
        waktuMulaiSesi(a) - waktuMulaiSesi(b)
    )
    .slice(0, 2);

  // Menu dashboard
  const menuItems = [
    {
      label: "Jadwal",
      icon: "calendar-month" as const,
      onPress: () => router.push("/asprak/jadwal"),
    },
    {
      label: "Sesi",
      icon: "clipboard-list-outline" as const,
      onPress: () => router.push("/asprak/sesi"),
    },
    {
      label: "Rekap",
      icon: "chart-box-outline" as const,
      onPress: () => router.push("/asprak/rekap"),
    },
    {
      label: "Izin",
      icon: "file-document-outline" as const,
      onPress: () => router.push("/asprak/izin"),
    },
    {
      label: "Maps",
      icon: "map-marker-radius-outline" as const,
      onPress: () => router.push("/maps"),
    },
    {
      label: "Kelola Lab",
      icon: "flask-outline" as const,
      onPress: () => router.push("/asprak/lab"),
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
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() =>
                router.push("/profile")
              }
              activeOpacity={0.85}
            >
              <Text style={styles.avatarText}>
                {inisial || "A"}
              </Text>
            </TouchableOpacity>

            <View style={styles.headerTextCol}>
              <Text style={styles.helloText}>
                Hello, Asisten!
              </Text>

              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {namaAsisten}
              </Text>
            </View>

            <View style={styles.profileMenuContainer}>
              <TouchableOpacity
                style={styles.notifButton}
                onPress={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {showProfileMenu && (
                <View style={styles.profileMenu}>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={17}
                      color="#EF6464"
                    />
                    <Text style={styles.logoutText}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>

          {/* RINGKASAN SESI */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
              "#25213C",
            ]}
            style={styles.summaryCard}
          >
            <AppSectionTitle title="Ringkasan Sesi" />

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
                  {totalSesiMendatang}
                </Text>

                <Text style={styles.statLabel}>
                  Sesi Mendatang
                </Text>
              </View>
            </View>
          </AppCard>

          {/* MENU UTAMA */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
            ]}
            style={styles.menuCard}
          >
            <AppSectionTitle title="Menu Utama" />

            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
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
          </AppCard>

          {/* SESI TERDEKAT */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
              "#25213C",
            ]}
            style={styles.nearestCard}
          >
            <AppSectionTitle
              title="Sesi Terdekat"
              actionLabel="Lihat Semua"
              onActionPress={() =>
                router.push("/asprak/sesi")
              }
            />

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
                  Belum Ada Sesi
                </Text>

                <Text style={styles.emptyText}>
                  Tidak ada sesi mendatang atau sesi
                  yang sedang berlangsung.
                </Text>
              </View>
            ) : (
              sesiTerdekat.map((item, idx) => {
                const statusVariant =
                  item.status === "Sedang Berlangsung"
                    ? "warning"
                    : "primary";

                return (
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

                      <AppBadge
                        label={item.status}
                        variant={statusVariant}
                      />
                    </View>

                    <Text
                      style={styles.sessionName}
                      numberOfLines={1}
                    >
                      {item.mataPraktikum}
                    </Text>

                    <View style={styles.sessionMetaRow}>
                      <Ionicons
                        name="people-outline"
                        size={14}
                        color="#AAA4C5"
                      />

                      <Text style={styles.sessionMeta}>
                        Kelas {item.kelas}
                      </Text>
                    </View>

                    <View style={styles.sessionMetaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
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
                        size={14}
                        color="#AAA4C5"
                      />

                      <Text style={styles.sessionMeta}>
                        {item.waktu}
                      </Text>

                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#AAA4C5"
                        style={{ marginLeft: 8 }}
                      />

                      <Text style={styles.sessionMeta}>
                        {daftarLab.find((lab) => lab.id === item.labId)?.nama}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </AppCard>

          {/* INFORMASI LAB */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
            ]}
            style={styles.labCard}
          >

            <TouchableOpacity
              style={styles.labButton}
              onPress={() =>
                router.push("/asprak/lab")
              }
              activeOpacity={0.8}
            >
              <Text style={styles.labButtonText}>
                Buka Kelola Lab
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </AppCard>
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
    paddingBottom: 36,
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

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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

  profileMenuContainer: {
    position: "relative",
    zIndex: 10,
  },

  notifButton: {
    padding: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 13,
  },

  profileMenu: {
    position: "absolute",
    top: 48,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 6,
    minWidth: 125,
    elevation: 8,
    zIndex: 100,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 7,
  },

  logoutText: {
    color: "#EF6464",
    fontSize: 13,
    fontWeight: "600",
  },

  // Body
  body: {
    paddingHorizontal: 20,
    marginTop: -42,
  },

  // Summary
  summaryCard: {
    marginBottom: 18,
    borderRadius: 22,
    padding: 20,
  },

  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
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
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  statDivider: {
    width: 1,
    height: 65,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // Menu
  menuCard: {
    marginBottom: 18,
    borderRadius: 22,
    padding: 20,
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
    textAlign: "center",
  },

  // Nearest session
  nearestCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    minHeight: 190,
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
    gap: 8,
  },

  sessionCode: {
    color: "#C4A4FF",
    fontSize: 11,
    fontWeight: "700",
  },

  sessionName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
  },

  sessionMeta: {
    color: "#AAA4C5",
    fontSize: 11,
  },

  // Empty state
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
    lineHeight: 18,
  },

  // Lab
  labCard: {
    borderRadius: 22,
    padding: 20,
  },

  labContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },

  labIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  labInfo: {
    flex: 1,
  },

  labTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },

  labDescription: {
    color: "#AAA4C5",
    fontSize: 11,
    lineHeight: 17,
  },

  labButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#6544B5",
    paddingVertical: 12,
    borderRadius: 13,
  },

  labButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
