
import { useJadwal } from "@/hooks/useJadwal";

import AppCard from "@/components/ui/appCard";
import AppSectionTitle from "@/components/ui/appSectionTitle";

import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterMode = "Semua" | "Hari Ini" | "Kelas";

export default function JadwalScreen() {
  const router = useRouter();

  const {
    jadwal: jadwalTampil,
    loading,
    error,
    tanpaKelas,
  } = useJadwal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState<FilterMode>("Semua");

  const [sortByHari, setSortByHari] = useState(false);

  const hariNamaHariIni = useMemo(() => {
    const namaHari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    return namaHari[new Date().getDay()];
  }, []);

  const filteredJadwal = useMemo(() => {
    let list = [...jadwalTampil];

    if (selectedFilter === "Hari Ini") {
      list = list.filter(
        (item) =>
          item.hari?.toLowerCase().trim() ===
          hariNamaHariIni.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      list = list.filter(
        (item) =>
          item.mataPraktikum?.toLowerCase().includes(q) ||
          item.asisten?.toLowerCase().includes(q) ||
          item.ruangan?.toLowerCase().includes(q) ||
          item.kode?.toLowerCase().includes(q) ||
          item.kelas?.toLowerCase().includes(q)
      );
    }

    if (sortByHari) {
      const urutanHari: Record<string, number> = {
        senin: 1,
        selasa: 2,
        rabu: 3,
        kamis: 4,
        jumat: 5,
        "jum'at": 5,
        sabtu: 6,
        minggu: 7,
      };

      list.sort(
        (a, b) =>
          (urutanHari[a.hari?.toLowerCase().trim() ?? ""] ?? 99) -
          (urutanHari[b.hari?.toLowerCase().trim() ?? ""] ?? 99)
      );
    }

    return list;
  }, [
    jadwalTampil,
    searchQuery,
    selectedFilter,
    sortByHari,
    hariNamaHariIni,
  ]);

  const filterChips: {
    label: string;
    value: FilterMode;
  }[] = [
    { label: "Semua", value: "Semua" },
    {
      label: `Hari Ini (${hariNamaHariIni})`,
      value: "Hari Ini",
    },
    { label: "Kelas Saya", value: "Kelas" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
        alwaysBounceVertical
        overScrollMode="always"
        decelerationRate="normal"
      >
        {/* BACK BUTTON */}
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/praktikan");
            }
          }}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>
              Jadwal
            </Text>

            {!loading && !error && (
              <Text style={styles.headerSubtitle}>
                {jadwalTampil.length} jadwal praktikum tersedia
              </Text>
            )}
          </View>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {jadwalTampil.length}
            </Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Feather
            name="search"
            size={18}
            color="#9C98B2"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Cari mata praktikum, asisten, ruang..."
            placeholderTextColor="#8E8AA3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Feather
                name="x"
                size={16}
                color="#9C98B2"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER SECTION */}
        <AppSectionTitle title="Jadwal Praktikum" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {filterChips.map((chip) => {
            const active =
              selectedFilter === chip.value;

            return (
              <TouchableOpacity
                key={chip.value}
                style={[
                  styles.chip,
                  active && styles.chipActive,
                ]}
                onPress={() =>
                  setSelectedFilter(chip.value)
                }
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CONTENT STATES */}
        {loading ? (
          <AppCard style={styles.stateCard}>
            <ActivityIndicator
              color="#B58AFF"
              size="large"
            />

            <Text style={styles.stateText}>
              Memuat jadwal praktikum...
            </Text>
          </AppCard>
        ) : error ? (
          <AppCard style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={28}
                color="#FF6B7E"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Gagal memuat jadwal
            </Text>

            <Text style={styles.stateText}>
              {error}
            </Text>
          </AppCard>
        ) : filteredJadwal.length === 0 ? (
          <AppCard style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={28}
                color="#B56DF0"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Tidak ada jadwal
            </Text>

            <Text style={styles.stateText}>
              {tanpaKelas
                ? "Akunmu belum terdaftar di kelas mana pun."
                : searchQuery.trim() ||
                    selectedFilter !== "Semua"
                ? "Tidak ada jadwal yang cocok dengan filter atau pencarian."
                : "Belum ada jadwal untuk kelasmu."}
            </Text>
          </AppCard>
        ) : (
          /* SCHEDULE LIST */
          <View style={styles.listContainer}>
            {filteredJadwal.map((item, index) => (
              <AppCard
                key={item.id}
                style={styles.scheduleCard}
              >
                {/* LEFT TILE */}
                <View style={styles.cardThumb}>
                  <Text style={styles.thumbLabel}>
                    KELAS
                  </Text>

                  <Text
                    style={styles.thumbCode}
                    numberOfLines={1}
                  >
                    {item.kelas || "-"}
                  </Text>

                  <Text style={styles.thumbIndex}>
                    #{String(index + 1).padStart(2, "0")}
                  </Text>
                </View>

                {/* RIGHT INFO */}
                <View style={styles.cardBody}>
                  <Text
                    style={styles.subject}
                    numberOfLines={2}
                  >
                    {item.mataPraktikum}
                  </Text>

                  <View style={styles.assistantRow}>
                    <Feather
                      name="user"
                      size={12}
                      color="#9C98B2"
                    />

                    <Text
                      style={styles.assistantText}
                      numberOfLines={1}
                    >
                      {item.asisten}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaPrimary}>
                      {item.hari} · {item.waktu}
                    </Text>

                    <Text
                      style={styles.metaSecondary}
                      numberOfLines={1}
                    >
                      {item.ruangan}
                    </Text>
                  </View>
                </View>
              </AppCard>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 115,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    color: "#9C98B2",
    fontSize: 12,
    marginTop: 2,
  },

  countPill: {
    backgroundColor: "#2F2B4A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  countPillText: {
    color: "#D5C2FF",
    fontSize: 13,
    fontWeight: "700",
  },

  // Search
  searchBox: {
    height: 48,
    backgroundColor: "#2F2C44",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },

  // Filter
  chipsScroll: {
    marginHorizontal: -20,
    marginBottom: 18,
  },

  chipsRow: {
    paddingHorizontal: 20,
    gap: 10,
  },

  chip: {
    backgroundColor: "#4A4665",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },

  chipActive: {
    backgroundColor: "#625FF0",
  },

  chipText: {
    color: "#E2DFEE",
    fontSize: 12,
    fontWeight: "600",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  // Schedule list
  listContainer: {
    gap: 12,
  },

  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: 16,
  },

  cardThumb: {
    width: 72,
    height: 76,
    borderRadius: 12,
    backgroundColor: "#3D3859",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  thumbLabel: {
    color: "#A6A2BA",
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 5,
    letterSpacing: 0.5,
  },

  thumbCode: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  thumbIndex: {
    color: "#A6A2BA",
    fontSize: 10,
    fontWeight: "600",
  },

  cardBody: {
    flex: 1,
  },

  subject: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  assistantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },

  assistantText: {
    flex: 1,
    color: "#A6A2BA",
    fontSize: 12,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  metaPrimary: {
    color: "#E5E3EC",
    fontSize: 12,
    fontWeight: "600",
  },

  metaSecondary: {
    flex: 1,
    color: "#A6A2BA",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "right",
  },

  // Loading / Error / Empty
  stateCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    padding: 28,
  },

  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#3A3654",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },

  stateText: {
    color: "#9C98B2",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },

  // Back button
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
});
