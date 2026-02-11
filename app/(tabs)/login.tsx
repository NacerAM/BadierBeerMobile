import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function onSubmit() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email requis";
    if (!password.trim()) e.password = "Mot de passe requis";
    setErrors(e);

    if (Object.keys(e).length === 0) {
      // TODO: appel API login
      console.log("LOGIN", { email, password });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

      <Button label="Se connecter" onPress={onSubmit} />

      <View style={styles.links}>
        <Link href="/forgot-password" style={styles.link}>
          Mot de passe oublié ?
        </Link>
        <Link href="/register" style={styles.link}>
          Créer un compte
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "700", marginBottom: spacing.lg, color: colors.text },
  links: { marginTop: spacing.lg, gap: spacing.sm },
  link: { color: colors.primaryDark, fontWeight: "600" },
});
