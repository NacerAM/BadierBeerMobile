import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirm?: string }>({});

  function onSubmit() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Nom d’utilisateur requis";
    if (!email.trim()) e.email = "Email requis";
    if (!password.trim()) e.password = "Mot de passe requis";
    if (confirm !== password) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);

    if (Object.keys(e).length === 0) {
      // TODO: appel API register
      console.log("REGISTER", { username, email, password });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <Text style={styles.subtitle}>
        Un email de vérification sera envoyé après création du compte.
      </Text>

      <Input label="Nom d’utilisateur" value={username} onChangeText={setUsername} error={errors.username} />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Input label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} />

      <Button label="Créer mon compte" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "700", marginBottom: spacing.sm, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
});
