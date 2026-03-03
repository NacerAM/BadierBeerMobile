import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { useAuth } from "../../src/store/useAuth";
import { loginApi, resendVerificationApi } from "../../src/api/authApi";

export default function LoginScreen() {
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function onSubmit() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email requis";
    if (!password.trim()) e.password = "Mot de passe requis";
    setErrors(e);

    if (Object.keys(e).length === 0) {
      try {
        const res = await loginApi(email, password);
        await login({ token: res.token, user: res.user });
        if (redirect) { router.replace(redirect as any); } else { router.replace("/(user)/" as any); }
      } catch (err: any) {
        const msg = err?.message || "Échec de la connexion";
        if (err?.status === 403 && email.trim()) {
          Alert.alert(
            "Compte non actif",
            msg,
            [
              { text: "Annuler" },
              {
                text: "Renvoyer l'email",
                onPress: async () => {
                  try {
                    const r = await resendVerificationApi(email.trim());
                    const opts: any[] = [{ text: "OK" }];
                    if (r?.previewUrl) {
                      const { Linking } = require("react-native");
                      opts.unshift({ text: "Voir l’email", onPress: () => Linking.openURL(r.previewUrl as any) });
                    }
                    Alert.alert("Envoyé", r?.message || "Email renvoyé.", opts);
                  } catch (e2: any) {
                    Alert.alert("Erreur", e2?.message || "Échec de renvoi");
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert("Erreur", msg);
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />

      <Button label="Se connecter" onPress={onSubmit} />

      <View style={styles.links}>
        <Link href={"/(visitor)/forgot-password" as any} style={styles.link}>Mot de passe oublié ?</Link>
        <Link href={"/(visitor)/register" as any} style={styles.link}>Créer un compte</Link>
      </View>

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
  title: { fontSize: typography.h1, fontWeight: '700', marginBottom: spacing.lg, color: colors.text },
  links: { marginTop: spacing.lg, gap: spacing.sm },
  link: { color: colors.primaryDark, fontWeight: '600' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: 6 },
  bottomItem: { alignItems: 'center' },
  bottomLabel: { color: colors.text, fontWeight: '700', marginTop: 2 },
});
