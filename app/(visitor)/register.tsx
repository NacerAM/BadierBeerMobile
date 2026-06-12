import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import Input from "../../src/components/Input";
import Button from "../../src/components/Button";
import { registerApi, registerBrewerApi, RegisterResponse } from "../../src/api/authApi";

type AccountType = "USER" | "BREWER";
type FormErrors = {
  accountType?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
  breweryName?: string;
  vatNumber?: string;
};

function normalizeBelgianVat(value: string) {
  return value.replace(/[\s.-]/g, "").toUpperCase();
}

function isValidBelgianVat(value: string) {
  const normalized = normalizeBelgianVat(value);
  return /^(BE)?[01]\d{9}$/.test(normalized);
}

export default function RegisterScreen() {
  const [accountType, setAccountType] = useState<AccountType>("USER");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [breweryName, setBreweryName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const isBrewer = accountType === "BREWER";

  const helperText = useMemo(() => {
    return isBrewer
      ? "Choisissez Société pour créer un compte brasseur. Le numéro de TVA belge est obligatoire, par exemple BE0123456789."
      : "Choisissez Particulier pour créer un compte utilisateur classique.";
  }, [isBrewer]);

  async function onSubmit() {
    const e: FormErrors = {};
    const normalizedVatNumber = normalizeBelgianVat(vatNumber.trim());

    if (!username.trim()) e.username = "Nom d’utilisateur requis";
    if (!email.trim()) e.email = "Email requis";
    if (!password.trim()) e.password = "Mot de passe requis";
    if (confirm !== password) e.confirm = "Les mots de passe ne correspondent pas";
    if (isBrewer && !breweryName.trim()) e.breweryName = "Nom de société requis";
    if (isBrewer && !vatNumber.trim()) e.vatNumber = "Numéro de TVA requis";
    if (isBrewer && vatNumber.trim() && !isValidBelgianVat(vatNumber)) {
      e.vatNumber = "Introduisez un numéro de TVA belge valide, par exemple BE0123456789";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const res: RegisterResponse = isBrewer
        ? await registerBrewerApi({
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            breweryName: breweryName.trim(),
            vatNumber: normalizedVatNumber,
          })
        : await registerApi(username.trim(), email.trim(), password.trim());

      const buttons = [] as { text: string; onPress: () => void }[];
      if (res?.previewUrl) {
        buttons.push({ text: "Voir l’email (aperçu)", onPress: () => Linking.openURL(res.previewUrl!) });
      }
      buttons.push({ text: "Se connecter", onPress: () => router.replace("/(visitor)/login" as any) });
      Alert.alert("Compte créé", res?.message || "Votre compte a été créé. Vérifiez votre email.", buttons);
    } catch (err: any) {
      const msg = err?.data?.issues?.[0]?.message || err?.message || "Échec de l’inscription";
      Alert.alert("Erreur", msg);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Inscription</Text>

        <View style={styles.segmentWrap}>
          <Pressable
            onPress={() => setAccountType("USER")}
            style={[styles.segment, accountType === "USER" ? styles.segmentActive : null]}
          >
            <Text style={[styles.segmentText, accountType === "USER" ? styles.segmentTextActive : null]}>Particulier</Text>
          </Pressable>
          <Pressable
            onPress={() => setAccountType("BREWER")}
            style={[styles.segment, accountType === "BREWER" ? styles.segmentActive : null]}
          >
            <Text style={[styles.segmentText, accountType === "BREWER" ? styles.segmentTextActive : null]}>Société</Text>
          </Pressable>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>{helperText}</Text>
        </View>

        {isBrewer ? (
          <>
            <Input label="Nom de la société / brasserie" value={breweryName} onChangeText={setBreweryName} error={errors.breweryName} />
            <Input
              label="Numéro de TVA"
              value={vatNumber}
              onChangeText={setVatNumber}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="BE0123456789"
              error={errors.vatNumber}
            />
          </>
        ) : null}

        <Input label="Nom d’utilisateur" value={username} onChangeText={setUsername} error={errors.username} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
        <Input label="Confirmer le mot de passe" value={confirm} onChangeText={setConfirm} secureTextEntry error={errors.confirm} />

        <Button label={isBrewer ? "Créer mon compte société" : "Créer mon compte"} onPress={onSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 3 },
  title: { fontSize: typography.h1, fontWeight: "700", marginBottom: spacing.sm, color: colors.text },
  segmentWrap: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  segmentText: {
    color: colors.text,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#2E1A0F",
  },
  notice: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noticeText: {
    color: colors.muted,
    lineHeight: 20,
  },
});
