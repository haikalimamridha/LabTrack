
import { Ionicons } from "@expo/vector-icons";
import {
    Camera,
    Map,
    Marker,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const LAB_B = {
  latitude: -7.0495631,
  longitude: 110.4412289,
  nama: "Lab B",
  kode: "LAB-IF-B",
  gedung: "E",
  lantai: 2,
  deskripsi: "Laboratorium B informatika",
};

const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

export default function MapsScreen() {
  const cameraRef = useRef<any>(null);

  const [selectedLab, setSelectedLab] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userCoordinate, setUserCoordinate] = useState<
    [number, number] | null
  >(null);

  const focusLab = () => {
    cameraRef.current?.flyTo({
      center: [LAB_B.longitude, LAB_B.latitude],
      zoom: 17,
      duration: 1000,
    });
  };

  const goToMyLocation = async () => {
    try {
      setLoadingLocation(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Izin lokasi diperlukan",
          "Aktifkan izin lokasi agar LabTrack dapat menampilkan posisi kamu."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinate: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setUserCoordinate(coordinate);

      cameraRef.current?.flyTo({
        center: coordinate,
        zoom: 17,
        duration: 1200,
      });
    } catch (error) {
      Alert.alert(
        "Gagal mendapatkan lokasi",
        "Pastikan GPS aktif dan coba kembali."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [LAB_B.longitude, LAB_B.latitude],
            zoom: 16,
            pitch: 35,
          }}
        />

        {/* Marker laboratorium */}
        <Marker
        id="lab-b"
        lngLat={[LAB_B.longitude, LAB_B.latitude]}
        onPress={() => setSelectedLab(true)}
        >
        <View style={styles.markerContainer}>
            <View style={styles.marker}>
            <Ionicons
                name="business"
                size={19}
                color="#FFFFFF"
            />
            </View>
            <View style={styles.markerTail} />
        </View>
        </Marker>

        {/* Marker posisi pengguna */}
        {userCoordinate && (
          <ViewAnnotation
            id="user-location"
            lngLat={userCoordinate}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </ViewAnnotation>
        )}
      </Map>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="map"
            size={22}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Peta Kampus</Text>
          <Text style={styles.headerSubtitle}>
            Temukan lokasi laboratorium
          </Text>
        </View>
      </View>

      {/* Tombol kontrol peta */}
      <View style={styles.mapControls}>
        <Pressable
          style={styles.controlButton}
          onPress={goToMyLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Ionicons
              name="locate"
              size={23}
              color="#FFFFFF"
            />
          )}
        </Pressable>

        <Pressable
          style={styles.controlButton}
          onPress={focusLab}
        >
          <Ionicons
            name="business-outline"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* Informasi laboratorium */}
      {selectedLab && (
        <View style={styles.infoCard}>
          <View style={styles.cardHandle} />

          <View style={styles.cardHeader}>
            <View style={styles.labIcon}>
              <Ionicons
                name="business"
                size={24}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.labHeading}>
              <Text style={styles.labName}>
                {LAB_B.nama}
              </Text>
              <Text style={styles.labCode}>
                {LAB_B.kode}
              </Text>
            </View>

            <Pressable
              onPress={() => setSelectedLab(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          <Text style={styles.description}>
            {LAB_B.deskripsi}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons
                name="business-outline"
                size={17}
                color="#A78BFA"
              />
              <View>
                <Text style={styles.detailLabel}>Gedung</Text>
                <Text style={styles.detailValue}>
                  {LAB_B.gedung}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="layers-outline"
                size={17}
                color="#A78BFA"
              />
              <View>
                <Text style={styles.detailLabel}>Lantai</Text>
                <Text style={styles.detailValue}>
                  {LAB_B.lantai}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.directionButton}
            onPress={focusLab}
          >
            <Ionicons
              name="navigate"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.directionText}>
              Lihat lokasi
            </Text>
          </Pressable>
        </View>
      )}

      {/* Petunjuk bawah */}
      {!selectedLab && (
        <View style={styles.hint}>
          <Ionicons
            name="information-circle-outline"
            size={17}
            color="#C4B5FD"
          />
          <Text style={styles.hintText}>
            Ketuk marker untuk melihat informasi laboratorium
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1B3A",
  },
  map: {
    flex: 1,
  },

  // Header
  header: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2545",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#494263",
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#6D45B5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#A6A2BA",
    fontSize: 12,
    marginTop: 3,
  },

  // Marker lab
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6D45B5",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  markerTail: {
    width: 12,
    height: 12,
    backgroundColor: "#6D45B5",
    transform: [{ rotate: "45deg" }],
    marginTop: -7,
  },

  // Marker pengguna
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#6D45B5",
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6D45B5",
  },

  // Kontrol peta
  mapControls: {
    position: "absolute",
    right: 16,
    top: 105,
    gap: 10,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#2A2545",
    borderWidth: 1,
    borderColor: "#494263",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  // Kartu informasi
  infoCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#2A2545",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#494263",
    elevation: 10,
  },
  cardHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#625B7D",
    alignSelf: "center",
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  labIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#6D45B5",
    alignItems: "center",
    justifyContent: "center",
  },
  labHeading: {
    flex: 1,
    marginLeft: 12,
  },
  labName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },
  labCode: {
    color: "#A6A2BA",
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#403A5C",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    color: "#D1CEE0",
    fontSize: 13,
    marginTop: 16,
    lineHeight: 20,
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#35304F",
    borderRadius: 13,
    padding: 12,
  },
  detailLabel: {
    color: "#A6A2BA",
    fontSize: 11,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },
  directionButton: {
    height: 48,
    backgroundColor: "#6D45B5",
    borderRadius: 14,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  directionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // Petunjuk
  hint: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2A2545",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#494263",
  },
  hintText: {
    color: "#D1CEE0",
    fontSize: 12,
  },
});
