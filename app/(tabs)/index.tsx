import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Button from "../../src/components/Button";

export default function HomeVisitorScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Badier Beer</Text>
        <Text style={styles.heroTitle}>Catalogue de verres de bière</Text>
        <Text style={styles.heroSubtitle}>
          Découvrez, collectionnez et proposez des verres. Un catalogue collaboratif validé par un administrateur.
        </Text>
      </View>

      <View style={styles.actions}>
        <Link href="/catalogue" asChild>
          <View>
            <Button label="Consulter le catalogue" onPress={() => {}} />
          </View>
        </Link>

        <Link href="/register" asChild>
          <View>
            <Button label="Créer un compte" variant="secondary" onPress={() => {}} />
          </View>
        </Link>

        <Link href="/login" style={styles.loginLink}>
          Se connecter
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, justifyContent: "space-between" },
  hero: { marginTop: spacing.xl },
  appName: { color: colors.primaryDark, fontWeight: "800", marginBottom: spacing.sm },
  heroTitle: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  heroSubtitle: { color: colors.muted, lineHeight: 20 },
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  loginLink: { textAlign: "center", color: colors.primaryDark, fontWeight: "700" },
});
