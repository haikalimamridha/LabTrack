
import { firestore } from "@/config/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from "@react-native-firebase/firestore";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

type Lab = {
  id: string;
  nama: string;
  kode: string;
  gedung: string;
  lantai: number;
  latitude: number;
  longitude: number;
  deskripsi: string;
  aktif: boolean;
};

type LabForm = {
  nama: string;
  kode: string;
  gedung: string;
  lantai: string;
  latitude: string;
  longitude: string;
  deskripsi: string;
  aktif: boolean;
};

const initialForm: LabForm = {
  nama: "",
  kode: "",
  gedung: "",
  lantai: "",
  latitude: "",
  longitude: "",
  deskripsi: "",
  aktif: true,
};

export default function KelolaLabScreen() {
  const router = useRouter();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LabForm>(initialForm);

  // Mengambil seluruh data laboratorium secara realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestore, "laboratorium"),
      (snapshot) => {
        const data: Lab[] = snapshot.docs.map((item) => {
          const lab = item.data();

          return {
            id: item.id,
            nama: lab.nama ?? "",
            kode: lab.kode ?? "",
            gedung: lab.gedung ?? "",
            lantai: Number(lab.lantai ?? 0),
            latitude: Number(lab.latitude ?? 0),
            longitude: Number(lab.longitude ?? 0),
            deskripsi: lab.deskripsi ?? "",
            aktif: lab.aktif ?? true,
          };
        });

        setLabs(data);
        setLoading(false);
      },
      (error) => {
        console.error("Gagal mengambil data lab:", error);
        setLoading(false);
        Alert.alert("Error", "Gagal mengambil data laboratorium.");
      }
    );

    return unsubscribe;
  }, []);

  // Filter pencarian
  const filteredLabs = labs.filter((lab) => {
    const keyword = search.toLowerCase();

    return (
      lab.nama.toLowerCase().includes(keyword) ||
      lab.kode.toLowerCase().includes(keyword) ||
      lab.gedung.toLowerCase().includes(keyword)
    );
  });

  // Mengubah nilai form
  const updateForm = (key: keyof LabForm, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Membuka modal tambah lab
  const handleAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setModalVisible(true);
  };

  // Membuka modal edit lab
  const handleEdit = (lab: Lab) => {
    setEditingId(lab.id);

    setForm({
      nama: lab.nama,
      kode: lab.kode,
      gedung: lab.gedung,
      lantai: String(lab.lantai),
      latitude: String(lab.latitude),
      longitude: String(lab.longitude),
      deskripsi: lab.deskripsi,
      aktif: lab.aktif,
    });

    setModalVisible(true);
  };

  // Menyimpan data lab
  const handleSave = async () => {
    const {
      nama,
      kode,
      gedung,
      lantai,
      latitude,
      longitude,
      deskripsi,
      aktif,
    } = form;

    if (
      !nama.trim() ||
      !kode.trim() ||
      !gedung.trim() ||
      !lantai.trim() ||
      !latitude.trim() ||
      !longitude.trim()
    ) {
      Alert.alert("Validasi", "Mohon lengkapi seluruh data yang wajib diisi.");
      return;
    }

    const parsedLantai = Number(lantai);
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (
      !Number.isInteger(parsedLantai) ||
      parsedLantai < 0 ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      Alert.alert("Validasi", "Periksa kembali lantai dan koordinat laboratorium.");
      return;
    }

    const payload = {
      nama: nama.trim(),
      kode: kode.trim().toUpperCase(),
      gedung: gedung.trim(),
      lantai: parsedLantai,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      deskripsi: deskripsi.trim(),
      aktif,
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateDoc(
          doc(firestore, "laboratorium", editingId),
          payload
        );

        Alert.alert("Berhasil", "Data laboratorium berhasil diperbarui.");
      } else {
        await addDoc(collection(firestore, "laboratorium"), payload);

        Alert.alert("Berhasil", "Laboratorium berhasil ditambahkan.");
      }

      setModalVisible(false);
      setForm(initialForm);
      setEditingId(null);
    } catch (error) {
      console.error("Gagal menyimpan lab:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data lab.");
    } finally {
      setSaving(false);
    }
  };

  // Menghapus laboratorium
  const handleDelete = (lab: Lab) => {
    Alert.alert(
      "Hapus Laboratorium",
      `Apakah kamu yakin ingin menghapus ${lab.nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(firestore, "laboratorium", lab.id));

              Alert.alert("Berhasil", "Laboratorium berhasil dihapus.");
            } catch (error) {
              console.error("Gagal menghapus lab:", error);
              Alert.alert("Gagal", "Tidak dapat menghapus laboratorium.");
            }
          },
        },
      ]
    );
  };

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Kelola Laboratorium</Text>
          <Text style={styles.headerSubtitle}>
            Kelola informasi dan lokasi laboratorium
          </Text>
        </LinearGradient>

        {/* STATISTIK */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>

            <Text style={styles.statValue}>{labs.length}</Text>
            <Text style={styles.statLabel}>Total Lab</Text>
          </View>

          <View style={styles.statCard}>

            <Text style={styles.statValue}>
              {labs.filter((lab) => lab.aktif).length}
            </Text>
            <Text style={styles.statLabel}>Lab Aktif</Text>
          </View>

          <View style={styles.statCard}>

            <Text style={styles.statValue}>
              {labs.filter((lab) => !lab.aktif).length}
            </Text>
            <Text style={styles.statLabel}>Nonaktif</Text>
          </View>
        </View>

        {/* DAFTAR LAB */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Daftar Laboratorium</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredLabs.length} laboratorium ditemukan
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="plus"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#A9A2C7"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, kode, atau gedung lab..."
            placeholderTextColor="#89839F"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#89839F"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* LIST LAB */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A77BFF" />
            <Text style={styles.loadingText}>Memuat laboratorium...</Text>
          </View>
        ) : filteredLabs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="flask-empty-outline"
              size={48}
              color="#77708F"
            />

            <Text style={styles.emptyTitle}>
              {search ? "Lab tidak ditemukan" : "Belum ada laboratorium"}
            </Text>

            <Text style={styles.emptySubtitle}>
              {search
                ? "Coba gunakan kata kunci lainnya."
                : "Tambahkan laboratorium untuk mulai mengelolanya."}
            </Text>
          </View>
        ) : (
          filteredLabs.map((lab) => (
            <View key={lab.id} style={styles.labCard}>
              <View style={styles.labCardTop}>
                <View style={styles.labIcon}>
                  <MaterialCommunityIcons
                    name="flask-outline"
                    size={26}
                    color="#B99AFF"
                  />
                </View>

                <View style={styles.labInfo}>
                  <Text style={styles.labName}>{lab.nama}</Text>
                  <Text style={styles.labCode}>{lab.kode}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    lab.aktif ? styles.activeBadge : styles.inactiveBadge,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: lab.aktif ? "#69D9A3" : "#F18A8A",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: lab.aktif ? "#69D9A3" : "#F18A8A" },
                    ]}
                  >
                    {lab.aktif ? "Aktif" : "Nonaktif"}
                  </Text>
                </View>
              </View>

              <View style={styles.labDivider} />

              <View style={styles.labDetail}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={17}
                    color="#A99BCB"
                  />
                  <Text style={styles.detailText}>
                    Gedung {lab.gedung}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="stairs"
                    size={17}
                    color="#A99BCB"
                  />
                  <Text style={styles.detailText}>
                    Lantai {lab.lantai}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={17}
                  color="#A99BCB"
                />
                <Text style={styles.coordinateText}>
                  {lab.latitude}, {lab.longitude}
                </Text>
              </View>

              {lab.deskripsi ? (
                <Text style={styles.labDescription}>
                  {lab.deskripsi}
                </Text>
              ) : null}

              <View style={styles.labActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(lab)}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={17}
                    color="#B99AFF"
                  />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(lab)}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={17}
                    color="#F18A8A"
                  />
                  <Text style={styles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL FORM LAB */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingId ? "Edit Laboratorium" : "Tambah Laboratorium"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Lengkapi informasi laboratorium
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Nama Laboratorium *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Lab B"
                placeholderTextColor="#89839F"
                value={form.nama}
                onChangeText={(value) => updateForm("nama", value)}
              />

              <Text style={styles.inputLabel}>Kode Laboratorium *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: LAB-IF-B"
                placeholderTextColor="#89839F"
                autoCapitalize="characters"
                value={form.kode}
                onChangeText={(value) => updateForm("kode", value)}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Gedung *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: E"
                    placeholderTextColor="#89839F"
                    value={form.gedung}
                    onChangeText={(value) => updateForm("gedung", value)}
                  />
                </View>

                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Lantai *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: 2"
                    placeholderTextColor="#89839F"
                    keyboardType="number-pad"
                    value={form.lantai}
                    onChangeText={(value) => updateForm("lantai", value)}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Latitude *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: -7.0495631"
                placeholderTextColor="#89839F"
                keyboardType="decimal-pad"
                value={form.latitude}
                onChangeText={(value) => updateForm("latitude", value)}
              />

              <Text style={styles.inputLabel}>Longitude *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: 110.4412289"
                placeholderTextColor="#89839F"
                keyboardType="decimal-pad"
                value={form.longitude}
                onChangeText={(value) => updateForm("longitude", value)}
              />

              <Text style={styles.inputLabel}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Deskripsi laboratorium..."
                placeholderTextColor="#89839F"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={form.deskripsi}
                onChangeText={(value) => updateForm("deskripsi", value)}
              />

              <View style={styles.activeRow}>
                <View>
                  <Text style={styles.activeTitle}>Status Laboratorium</Text>
                  <Text style={styles.activeSubtitle}>
                    {form.aktif ? "Laboratorium aktif" : "Laboratorium nonaktif"}
                  </Text>
                </View>

                <Switch
                  value={form.aktif}
                  onValueChange={(value) => updateForm("aktif", value)}
                  trackColor={{
                    false: "#45405B",
                    true: "#7651C9",
                  }}
                  thumbColor={form.aktif ? "#FFFFFF" : "#B0A9C0"}
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#7651C9", "#49358B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="content-save-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.saveButtonText}>
                        {editingId ? "Simpan Perubahan" : "Tambah Laboratorium"}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B35",
  },
  scrollContent: {
    paddingBottom: 35,
  },
  header: {
    paddingTop: 55,
    paddingBottom: 30,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    color: "#DDD1F7",
    fontSize: 13,
    marginTop: 6,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#302A4D",
    borderRadius: 17,
    padding: 13,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#B8B0D0",
    fontSize: 11,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#7651C9",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#302A4D",
    borderRadius: 14,
    marginHorizontal: 18,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: 9,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    color: "#B8B0D0",
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 13,
  },
  emptySubtitle: {
    color: "#A9A2C7",
    textAlign: "center",
    fontSize: 12,
    marginTop: 7,
    lineHeight: 19,
  },
  labCard: {
    backgroundColor: "#302A4D",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#453B64",
  },
  labCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  labIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#45366B",
    alignItems: "center",
    justifyContent: "center",
  },
  labInfo: {
    flex: 1,
    marginLeft: 12,
  },
  labName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  labCode: {
    color: "#B99AFF",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: "rgba(105,217,163,0.12)",
  },
  inactiveBadge: {
    backgroundColor: "rgba(241,138,138,0.12)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  labDivider: {
    height: 1,
    backgroundColor: "#49415F",
    marginVertical: 15,
  },
  labDetail: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  detailText: {
    color: "#D5CFE6",
    fontSize: 12,
  },
  coordinateText: {
    color: "#A9A2C7",
    fontSize: 11,
  },
  labDescription: {
    color: "#A9A2C7",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  labActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(185,154,255,0.12)",
    borderRadius: 11,
    paddingVertical: 11,
  },
  editButtonText: {
    color: "#B99AFF",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "rgba(241,138,138,0.10)",
    borderRadius: 11,
    paddingVertical: 11,
  },
  deleteButtonText: {
    color: "#F18A8A",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#25213D",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 21,
    paddingTop: 22,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#A9A2C7",
    fontSize: 12,
    marginTop: 5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#403957",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: "#DDD6EF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 13,
  },
  input: {
    backgroundColor: "#342E50",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    color: "#FFFFFF",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#49415F",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  descriptionInput: {
    height: 95,
    paddingTop: 13,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#342E50",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
  },
  activeTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  activeSubtitle: {
    color: "#A9A2C7",
    fontSize: 11,
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 23,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 15,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
