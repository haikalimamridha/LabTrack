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
        <Text style={styles.title}>Pilih Peran</Text>

        <View style={styles.buttonContainer}>
        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.replace('/praktikan' as any)}
        >
            <Text style={styles.buttonTitle}>Praktikan</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.replace('/asprak' as any)}
        >
            <Text style={styles.buttonTitle}>Asisten Praktikum</Text>
        </TouchableOpacity>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff'
  },
  buttonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    },
});