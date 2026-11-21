
import { useAuth } from "@/context/AuthContext";
import { usePresensi } from "@/context/PresensiContext";

import AppBadge from "@/components/ui/appBadge";
import AppCard from "@/components/ui/appCard";
import AppSectionTitle from "@/components/ui/appSectionTitle";

import { useEffect, useState } from "react";

import { listenLaboratorium, type Laboratorium } from "@/services/laboratoriumService";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

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

export default function Index() {
  const router = useRouter();
  const { profile } = useAuth();

  const {
    daftarSesi,
    loading,
    error,
    sudahPresensi,
  } = usePresensi();

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
  const nama = profile?.nama ?? "Praktikan";

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
      onPress: () => router.push("/maps"),
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
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => router.push("/profile")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="person"
                size={25}
                color="#FFFFFF"
              />
            </TouchableOpacity>

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
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>

          {/* RINGKASAN PRESENSI */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
              "#25213C",
            ]}
            style={styles.summaryCard}
          >
            <AppSectionTitle
              title="Ringkasan Presensi"
              actionLabel="Jadwal Saya"
              onActionPress={() =>
                router.push("/praktikan/jadwal")
              }
            />

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
          </AppCard>

          {/* MENU UTAMA */}
          <AppCard
            gradientColors={[
              "#39325E",
              "#292542",
            ]}
            style={styles.menuCard}
          >
            <AppSectionTitle
              title="Menu Utama"
            />

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
                router.push("/praktikan/jadwal")
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
                  Belum Ada Jadwal
                </Text>

                <Text style={styles.emptyText}>
                  Kamu belum memiliki jadwal praktikum
                  mendatang.
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
                        {daftarLab.find((lab) => lab.id === item.labId)?.nama}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
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

  notifButton: {
    padding: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 13,
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
  },

  // Nearest session
  nearestCard: {
    borderRadius: 22,
    padding: 20,
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
  },

  sessionCode: {
    color: "#C4A4FF",
    fontSize: 11,
    fontWeight: "700",
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
  },
});
