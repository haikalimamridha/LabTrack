import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePresensi } from "../../context/PresensiContext";
import { formatJam } from "../../data/sesi";
import { formatTanggal } from "../../services/sessionService";

export default function RiwayatScreen() {
  const { riwayat, daftarSesi, loading, error } = usePresensi();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Gabungkan catatan presensi dengan detail sesi, terbaru di atas
  const data = [...riwayat]
    .sort((a, b) => b.waktuHadir.localeCompare(a.waktuHadir))
    .map((r) => ({
      ...r,
      sesi: daftarSesi.find((s) => s.id === r.sesiId)!,
    }))
    .filter((r) => r.sesi);

  return (
    <View style={styles.container}>
      <FlatList
        key={isWide ? "wide" : "narrow"}
        data={data}
        keyExtractor={(item) => String(item.sesiId)}
        numColumns={isWide ? 2 : 1}
        columnWrapperStyle={isWide ? styles.row : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <View style={styles.headerTextCol}>
                <Text style={styles.headerTitle}>Riwayat</Text>
                <Text style={styles.headerSubtitle}>
                  Catatan kehadiran praktikum yang sudah tercatat
                </Text>
              </View>

              <View style={styles.headerBadge}>
                <MaterialCommunityIcons
                  name="history"
                  size={15}
                  color="#D5C2FF"
                />
                <Text style={styles.headerBadgeText}>
                  {data.length} Hadir
                </Text>
              </View>
            </View>

            <Text style={styles.totalText}>
              {data.length} kehadiran tercatat
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color="#9623D6" size="large" />
              <Text style={styles.stateText}>Memuat riwayat kehadiran...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <View style={styles.stateIcon}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={28}
                  color="#D5C2FF"
                />
              </View>
              <Text style={styles.emptyTitle}>Gagal memuat riwayat</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.stateCard}>
              <View style={styles.stateIcon}>
                <MaterialCommunityIcons
                  name="clipboard-text-clock-outline"
                  size={28}
                  color="#D5C2FF"
                />
              </View>
              <Text style={styles.emptyTitle}>Belum ada riwayat kehadiran</Text>
              <Text style={styles.emptyText}>
                Lakukan presensi pada sesi yang sedang berlangsung, lalu
                catatannya akan muncul di sini.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.card, isWide && styles.cardWide]}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>
                  {item.sesi.kode ? `${item.sesi.kode} · ` : ""}Kelas{" "}
                  {item.sesi.kelas}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <MaterialCommunityIcons
                  name="check"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.statusText}>Hadir</Text>
              </View>
            </View>

            <Text style={styles.subject} numberOfLines={2}>
              {item.sesi.mataPraktikum}
            </Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal</Text>
              <Text style={styles.infoValue}>
                {item.sesi.hari}, {formatTanggal(item.sesi.tanggal)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jadwal sesi</Text>
              <Text style={styles.infoValue}>{item.sesi.waktu}</Text>
            </View>

            <View style={[styles.infoRow, { marginBottom: 0 }]}>
              <Text style={styles.infoLabel}>Waktu hadir</Text>
              <Text style={styles.infoValueAccent}>
                {formatJam(item.waktuHadir)}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B3A",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 115,
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },

  /* Header */
  headerBlock: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
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
    marginTop: 3,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2F2C44",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: "#D5C2FF",
    fontSize: 12,
    fontWeight: "700",
  },
  totalText: {
    color: "#9C98B2",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Card */
  card: {
    width: "100%",
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardWide: {
    width: "48.6%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: "#3A3654",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
  },
  codeText: {
    color: "#D5C2FF",
    fontSize: 11,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#9623D6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  subject: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#3F3A5C",
    marginVertical: 13,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
    gap: 12,
  },
  infoLabel: {
    color: "#9C98B2",
    fontSize: 12,
    flex: 1,
  },
  infoValue: {
    color: "#F5F3FF",
    fontSize: 12,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  infoValueAccent: {
    color: "#D5C2FF",
    fontSize: 12,
    fontWeight: "700",
    flex: 2,
    textAlign: "right",
  },

  /* States */
  stateCard: {
    backgroundColor: "#2F2C44",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 190,
    marginTop: 8,
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
  emptyText: {
    color: "#9C98B2",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 18,
    marginTop: 4,
  },
  stateText: {
    color: "#9C98B2",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
});