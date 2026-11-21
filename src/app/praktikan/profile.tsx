
import { useAuth } from "@/context/AuthContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, logout, loading } = useAuth();

  const nama = profile?.nama ?? "Pengguna";
  const inisial = nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();

  const role =
    profile?.role === "asprak"
      ? "Asisten Praktikum"
      : "Praktikan";

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah kamu yakin ingin keluar dari akun?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace("/login");
            } catch (error) {
              console.error("Gagal logout:", error);
              Alert.alert(
                "Gagal",
                "Tidak dapat melakukan logout."
              );
            }
          },
        },
      ]
    );
  };

  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    value?: string | null;
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Feather
          name={icon}
          size={19}
          color="#C5A3FF"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>
          {value || "-"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#B58AFF" size="large" />
        <Text style={styles.loadingText}>
          Memuat profil...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#7928CA", "#512DA8", "#29215C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>

            <Text style={styles.headerTitle}>
              Profil Saya
            </Text>
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={["#A78BFA", "#7651C9"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {inisial || "P"}
                </Text>
              </LinearGradient>

              <View style={styles.onlineIndicator} />
            </View>

            <Text style={styles.profileName}>
              {nama}
            </Text>

            <View style={styles.roleBadge}>
              <MaterialCommunityIcons
                name="account-check-outline"
                size={15}
                color="#E5D7FF"
              />
              <Text style={styles.roleText}>
                {role}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>
          {/* INFORMASI PRIBADI */}
          <LinearGradient
            colors={["#39325E", "#292542", "#25213C"]}
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather
                  name="user"
                  size={18}
                  color="#C5A3FF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Informasi Pribadi
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Data identitas akun kamu
                </Text>
              </View>
            </View>

            <View style={styles.infoList}>
              <InfoItem
                icon="user"
                label="Nama Lengkap"
                value={profile?.nama}
              />

              <View style={styles.infoDivider} />

              <InfoItem
                icon="credit-card"
                label="NIM"
                value={profile?.nim}
              />

              <View style={styles.infoDivider} />

              <InfoItem
                icon="mail"
                label="Email"
                value={profile?.email}
              />
            </View>
          </LinearGradient>

          {/* INFORMASI AKADEMIK */}
          <LinearGradient
            colors={["#39325E", "#292542", "#25213C"]}
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather
                  name="book-open"
                  size={18}
                  color="#C5A3FF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Informasi Akademik
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Informasi perkuliahan kamu
                </Text>
              </View>
            </View>

            <View style={styles.infoList}>
              <InfoItem
                icon="book"
                label="Program Studi"
                value={profile?.jurusan}
              />

              <View style={styles.infoDivider} />

              <InfoItem
                icon="calendar"
                label="Angkatan"
                value={profile?.angkatan}
              />
            </View>
          </LinearGradient>

          {/* INFORMASI AKUN */}
          <LinearGradient
            colors={["#39325E", "#292542"]}
            style={styles.card}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather
                  name="shield"
                  size={18}
                  color="#C5A3FF"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>
                  Informasi Akun
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Status akun LabTrack
                </Text>
              </View>
            </View>

            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>
                Tipe Akun
              </Text>
              <Text style={styles.accountValue}>
                {role}
              </Text>
            </View>

            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>
                Status
              </Text>

              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>
                  Aktif
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* LOGOUT */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather
              name="log-out"
              size={19}
              color="#FF8494"
            />
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>
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

  loadingContainer: {
    flex: 1,
    backgroundColor: "#1E1B35",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#AAA4C5",
    marginTop: 12,
    fontSize: 13,
  },

  scrollContent: {
    paddingBottom: 180,
  },

  // Header
  header: {
    paddingTop: 55,
    paddingBottom: 65,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  profileHeader: {
    alignItems: "center",
    marginTop: 30,
  },

  avatarOuter: {
    position: "relative",
    padding: 5,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
  },

  onlineIndicator: {
    position: "absolute",
    right: 5,
    bottom: 6,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#55D6A0",
    borderWidth: 3,
    borderColor: "#512DA8",
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginTop: 15,
    textAlign: "center",
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.13)",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 10,
  },

  roleText: {
    color: "#E5D7FF",
    fontSize: 11,
    fontWeight: "600",
  },

  // Body
  body: {
    paddingHorizontal: 20,
    marginTop: -30,
  },

  // Card
  card: {
    borderRadius: 21,
    padding: 19,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "rgba(181,138,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionSubtitle: {
    color: "#AAA4C5",
    fontSize: 10,
    marginTop: 4,
  },

  // Info
  infoList: {
    gap: 14,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: "#AAA4C5",
    fontSize: 11,
    marginBottom: 4,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  // Account
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  accountLabel: {
    color: "#AAA4C5",
    fontSize: 12,
  },

  accountValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(85,214,160,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#55D6A0",
  },

  activeText: {
    color: "#B8EBD5",
    fontSize: 11,
    fontWeight: "600",
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,107,126,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,126,0.2)",
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 4,
  },

  logoutText: {
    color: "#FF8494",
    fontSize: 13,
    fontWeight: "700",
  },
});
