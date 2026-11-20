import { useJadwal } from "@/hooks/useJadwal";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterMode = "Semua" | "Hari Ini" | "Kelas";

export default function JadwalScreen() {
  const {
    jadwal: jadwalTampil,
    loading,
    error,
    tanpaKelas,
  } = useJadwal();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterMode>("Semua");
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
          item.hari?.toLowerCase().trim() === hariNamaHariIni.toLowerCase()
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
  }, [jadwalTampil, searchQuery, selectedFilter, sortByHari, hariNamaHariIni]);

  const filterChips: { label: string; value: FilterMode }[] = [
    { label: "Semua", value: "Semua" },
    { label: `Hari Ini (${hariNamaHariIni})`, value: "Hari Ini" },
    { label: "Kelas Saya", value: "Kelas" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        decelerationRate="normal"
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Jadwal</Text>
            {!loading && !error && (
              <Text style={styles.headerSubtitle}>
                {jadwalTampil.length} jadwal praktikum tersedia
              </Text>
            )}
          </View>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{jadwalTampil.length}</Text>
          </View>
        </View>

        {/* SEARCH BAR + FILTER BUTTON */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color="#9C98B2" />
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={16} color="#9C98B2" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SECTION & FILTER CHIPS */}
        <Text style={styles.sectionTitle}>Jadwal Praktikum</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {filterChips.map((chip) => {
            const active = selectedFilter === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedFilter(chip.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CONTENT STATES */}
        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#9623D6" size="large" />
            <Text style={styles.stateText}>Memuat jadwal praktikum...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={28}
                color="#FF6B7E"
              />
            </View>
            <Text style={styles.emptyTitle}>Gagal memuat jadwal</Text>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : filteredJadwal.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.stateIcon}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={28}
                color="#B56DF0"
              />
            </View>
            <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
            <Text style={styles.stateText}>
              {tanpaKelas
                ? "Akunmu belum terdaftar di kelas mana pun."
                : searchQuery.trim() || selectedFilter !== "Semua"
                ? "Tidak ada jadwal yang cocok dengan filter atau pencarian."
                : "Belum ada jadwal untuk kelasmu."}
            </Text>
          </View>
        ) : (
          /* COMPACT HORIZONTAL SCHEDULE CARDS */
          <View style={styles.listContainer}>
            {filteredJadwal.map((item, index) => (
              <View key={item.id} style={styles.card}>
                {/* Left Visual Tile */}
                <View style={styles.cardThumb}>
                  <Text style={styles.thumbLabel}>KELAS</Text>
                  <Text style={styles.thumbCode} numberOfLines={1}>
                    {item.kelas || "-"}
                  </Text>
                  <Text style={styles.thumbIndex}>
                    #{String(index + 1).padStart(2, "0")}
                  </Text>
                </View>

                {/* Right Info */}
                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.subject} numberOfLines={2}>
                      {item.mataPraktikum}
                    </Text>
                  </View>

                  <View style={styles.assistantRow}>
                    <Feather name="user" size={12} color="#9C98B2" />
                    <Text style={styles.assistantText} numberOfLines={1}>
                      {item.asisten}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaPrimary}>
                      {item.hari} · {item.waktu}
                    </Text>
                    <Text style={styles.metaSecondary} numberOfLines={1}>
                      {item.ruangan}
                    </Text>
                  </View>
                </View>
              </View>
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
    backgroundColor: "#1E1B3A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 115,
  },

  /* Header */
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

  /* Search + Filter */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: "#2F2C44",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  filterIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2F2C44",
    alignItems: "center",
    justifyContent: "center",
  },
  filterIconBtnActive: {
    backgroundColor: "#9623D6",
  },

  /* Section & Chips */
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
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
    backgroundColor: "#4F46E5",
  },
  chipText: {
    color: "#E2DFEE",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },

  /* List & Compact Card */
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#2F2C44",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  subject: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  classTag: {
    color: "#D1D0DA",
    fontSize: 11,
    fontWeight: "600",
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

  /* Loading / Error / Empty */
  stateCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
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
});