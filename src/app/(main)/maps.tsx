
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  Map,
  Marker,
  ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  listenLaboratorium,
  type Laboratorium,
} from "@/services/laboratoriumService";

const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
} as const;

type MapTheme = keyof typeof MAP_STYLES;

// Koordinat awal peta kampus
const INITIAL_CENTER: [number, number] = [
  110.4412289,
  -7.0495631,
];

export default function MapsScreen() {
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const { profile } = useAuth();

  const handleBack = () => {
    if (profile?.role === "asprak") {
      router.replace("/asprak");
    } else {
      router.replace("/praktikan");
    }
  };

  const [labs, setLabs] = useState<Laboratorium[]>([]);
  const [selectedLab, setSelectedLab] =
    useState<Laboratorium | null>(null);

  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [userCoordinate, setUserCoordinate] = useState<
    [number, number] | null
  >(null);

  // Mendengarkan perubahan data laboratorium dari Firestore
  useEffect(() => {
    const unsubscribe = listenLaboratorium(
      (data) => {
        setLabs(data);
        setLoadingLabs(false);

        // Memperbarui data lab yang sedang dipilih
        // atau menutup kartu jika lab sudah tidak aktif.
        setSelectedLab((current) => {
          if (!current) return null;

          return data.find((lab) => lab.id === current.id) ?? null;
        });
      },
        (error) => {
        console.log("FIRESTORE ERROR:", error);
        console.log("ERROR MESSAGE:", error.message);

        setLoadingLabs(false);
        }
    );

    return unsubscribe;
  }, []);

  // Fokus ke laboratorium tertentu
    const focusLab = (lab: Laboratorium) => {
    cameraRef.current?.flyTo({
        center: [lab.longitude, lab.latitude],
        zoom: 17,
        duration: 1000,
    });
    };

  // Kembali ke posisi awal kampus
  const focusCampus = () => {
    cameraRef.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: 16,
      duration: 1000,
    });
  };

  // Mendapatkan posisi pengguna
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

      const location =
        await Location.getCurrentPositionAsync({
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
      console.error("Gagal mendapatkan lokasi:", error);

      Alert.alert(
        "Gagal mendapatkan lokasi",
        "Pastikan GPS aktif dan coba kembali."
      );
    } finally {
      setLoadingLocation(false);
    }
  };

  const [mapTheme, setMapTheme] = useState<MapTheme>("dark");

  const toggleMapStyle = () => {
    setMapTheme((prev) => (prev === "dark" ? "liberty" : "dark"));
  };

  const currentMapStyle = MAP_STYLES[mapTheme];

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={currentMapStyle}
        compassPosition={{
            top: 115,
            left: 16,
        }}
      >
        <Camera
        ref={cameraRef}
        initialViewState={{
            center: [
            labs[0]?.longitude ?? 110.4412289,
            labs[0]?.latitude ?? -7.0495631,
            ],
            zoom: 16,
            pitch: 35,
        }}
        />

        {/* Marker laboratorium dari Firestore */}
        {labs.map((lab) => (
        <Marker
            key={lab.id}
            id={lab.id}
            lngLat={[lab.longitude, lab.latitude]}
            onPress={() => setSelectedLab(lab)}
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
        ))}

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
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

        <View style={styles.headerIcon}>
            <Ionicons
            name="map"
            size={22}
            color="#FFFFFF"
            />
        </View>

        <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
            Peta Kampus
            </Text>

            <Text style={styles.headerSubtitle}>
            {loadingLabs
                ? "Memuat lokasi laboratorium..."
                : `${labs.length} laboratorium terdaftar`}
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
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
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
          onPress={focusCampus}
        >
          <Ionicons
            name="business"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable
          style={styles.controlButton}
          onPress={toggleMapStyle}
        >
          <Ionicons
            name={mapTheme === "dark" ? "moon-outline" : "sunny-outline"}
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
                {selectedLab.nama}
              </Text>

              <Text style={styles.labCode}>
                {selectedLab.kode}
              </Text>
            </View>

            <Pressable
              onPress={() => setSelectedLab(null)}
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
            {selectedLab.deskripsi}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons
                name="business-outline"
                size={17}
                color="#A78BFA"
              />

              <View>
                <Text style={styles.detailLabel}>
                  Gedung
                </Text>

                <Text style={styles.detailValue}>
                  {selectedLab.gedung}
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
                <Text style={styles.detailLabel}>
                  Lantai
                </Text>

                <Text style={styles.detailValue}>
                  {selectedLab.lantai}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.directionButton}
            onPress={() => focusLab(selectedLab)}
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

  // Marker laboratorium
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
  backButton: {
    width: 20,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    },
});
