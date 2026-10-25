import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>LABTRACK</Text>
        <Text style={styles.title}>Pilih Peran</Text>
        <Text style={styles.subtitle}>
          Sistem Manajemen Praktikum & Presensi Laboratorium
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/pilih-identitas' as any,
                params: { role: 'praktikan' },
              })
            }
          >
            <Text style={styles.buttonTitle}>Praktikan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonAsprak]}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/pilih-identitas' as any,
                params: { role: 'asprak' },
              })
            }
          >
            <Text style={styles.buttonTitle}>Asisten Praktikum</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25292e',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
  },
  eyebrow: {
    color: '#A5A2FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B8BCC4',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  buttonAsprak: {
    borderColor: '#A5A2FF',
    backgroundColor: '#34354A',
  },
  buttonTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
