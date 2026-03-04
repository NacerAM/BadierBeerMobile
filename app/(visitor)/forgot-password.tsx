import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Linking, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { forgotPasswordApi } from "../../src/api/authApi";
import { router } from "expo-router";

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
      <Text style={styles.subtitle}>Entrez votre email, nous vous enverrons un lien de réinitialisation.</Text>

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={error} />

      <Button label="Envoyer" onPress={onSubmit} />

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={() => router.replace('/(visitor)/' as any)}>
          <Ionicons name="home" size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Accueil</Text>
        </Pressable>
        <Pressable style={styles.bottomItem} onPress={() => router.push('/(visitor)/explore' as any)}>
          <Ionicons name="compass" size={22} color={colors.text as any} />
          <Text style={styles.bottomLabel}>Explorer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.lg },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 6 },
  bottomItem: { alignItems: 'center' },
  bottomLabel: { color: colors.text, fontWeight: '700', marginTop: 2 },
});
