import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { usePresensi } from "../../context/PresensiContext";
import { formatJam } from "../../data/sesi";

export default function RiwayatScreen() {
  const { riwayat, daftarSesi } = usePresensi();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Gabungkan catatan presensi dengan detail sesi, terbaru di atas
  const data = [...riwayat]
    .reverse()
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
          <Text style={styles.totalText}>{data.length} kehadiran tercatat</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗒️</Text>
            <Text style={styles.emptyTitle}>Belum ada riwayat kehadiran</Text>
            <Text style={styles.emptyText}>
              Lakukan presensi pada sesi yang sedang berlangsung, lalu
              catatannya akan muncul di sini.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, isWide && styles.cardWide]}>
            <View style={styles.cardHeader}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>
                  {item.sesi.kode} · Kelas {item.sesi.kelas}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Hadir</Text>
              </View>
            </View>

            <Text style={styles.subject}>{item.sesi.mataPraktikum}</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal</Text>
              <Text style={styles.infoValue}>
                {item.sesi.hari}, {item.sesi.tanggal}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jadwal sesi</Text>
              <Text style={styles.infoValue}>{item.sesi.waktu}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waktu hadir</Text>
              <Text style={styles.infoValue}>{formatJam(item.waktuHadir)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#25292e" },
  listContent: {
    padding: 20,
    paddingBottom: 30,
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
    flexGrow: 1,
  },
  row: { justifyContent: "space-between" },
  totalText: { color: "#B8BCC4", fontSize: 13, marginBottom: 12 },
  card: {
    width: "100%",
    backgroundColor: "#343941",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#454B55",
  },
  cardWide: { width: "48.5%" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: "#45416F",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeText: { color: "#C7C5FF", fontSize: 12, fontWeight: "bold" },
  statusBadge: {
    backgroundColor: "#166534",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  subject: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 24,
  },
  divider: { height: 1, backgroundColor: "#505661", marginVertical: 14 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  infoLabel: { color: "#AEB4BE", fontSize: 13, flex: 1 },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 60,
  },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#B8BCC4",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 20,
  },
});
