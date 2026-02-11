import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  function onSubmit() {
    if (!email.trim()) {
      setError("Email requis");
      return;
    }
    setError(undefined);
    // TODO: appel API reset password
    console.log("RESET PASSWORD", { email });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>
        Entrez votre email, nous vous enverrons un lien de réinitialisation.
      </Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />

      <Button label="Envoyer" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "700", marginBottom: spacing.sm, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
});
