
import {
    Camera,
    Map,
    ViewAnnotation,
} from "@maplibre/maplibre-react-native";
import { useState } from "react";
import {
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

export default function MapsScreen() {
  const [selectedLab, setSelectedLab] = useState(false);

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          initialViewState={{
            center: [LAB_B.longitude, LAB_B.latitude],
            zoom: 16,
          }}
        />

        <ViewAnnotation
          id="lab-b"
          lngLat={[LAB_B.longitude, LAB_B.latitude]}
          onPress={() => setSelectedLab(true)}
        >
          <View style={styles.markerContainer}>
            <View style={styles.marker}>
              <Text style={styles.markerText}>B</Text>
            </View>
            <View style={styles.markerTail} />
          </View>
        </ViewAnnotation>
      </Map>

      {selectedLab && (
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.labName}>{LAB_B.nama}</Text>
              <Text style={styles.labCode}>{LAB_B.kode}</Text>
            </View>

            <Pressable
              onPress={() => setSelectedLab(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>
            {LAB_B.deskripsi}
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gedung</Text>
            <Text style={styles.detailValue}>{LAB_B.gedung}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lantai</Text>
            <Text style={styles.detailValue}>{LAB_B.lantai}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Koordinat</Text>
            <Text style={styles.detailValue}>
              {LAB_B.latitude}, {LAB_B.longitude}
            </Text>
          </View>
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
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6D45B5",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  markerTail: {
    width: 10,
    height: 10,
    backgroundColor: "#6D45B5",
    transform: [{ rotate: "45deg" }],
    marginTop: -6,
  },
  infoCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "#2A2545",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#494263",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  labCode: {
    color: "#A6A2BA",
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#403A5C",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#494263",
    marginVertical: 14,
  },
  description: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 9,
  },
  detailLabel: {
    color: "#A6A2BA",
    fontSize: 13,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
});
