import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Linking } from "react-native";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { forgotPasswordApi } from "../../src/api/authApi";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  async function onSubmit() {
    const e = email.trim();
    if (!e) {
      setError("Email requis");
      return;
    }
    setError(undefined);
    try {
      const res = await forgotPasswordApi(e);
      const buttons: any[] = [{ text: "OK" }];
      if ((res as any)?.previewUrl) {
        buttons.unshift({ text: "Voir l’email", onPress: () => Linking.openURL((res as any).previewUrl) });
      }
      Alert.alert("Envoyé", res?.message || "Un lien de réinitialisation a été envoyé s’il existe.", buttons);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Échec d’envoi");
    }
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
