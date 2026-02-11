import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

export default function HomeVisitorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil Visiteur</Text>

      <Link href="/catalogue" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Aller au Catalogue</Text>
        </Pressable>
      </Link>

      <Link href="/glass-detail" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Aller au Détail Verre</Text>
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Aller à Inscription</Text>
        </Pressable>
      </Link>

      <Link href="/login" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Aller à Connexion</Text>
        </Pressable>
      </Link>

      <Link href="/forgot-password" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Aller à Mot de passe oublié</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  button: {
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    width: 260,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "600" },
});
