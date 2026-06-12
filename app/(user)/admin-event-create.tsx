import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import Input from "../../src/components/Input";
import DateInput from "../../src/components/DateInput";
import Button from "../../src/components/Button";
import ImageUploadField from "../../src/components/ImageUploadField";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import { createAdminPostApi } from "../../src/api/adminApi";

type EventFormErrors = {
  title?: string;
  content?: string;
  address?: string;
  startAt?: string;
  endAt?: string;
  registrationDeadline?: string;
  imageUrl?: string;
};

function toApiDateTimeString(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseDisplayDateTime(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), 0, 0);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd) ||
    date.getHours() !== Number(hh) ||
    date.getMinutes() !== Number(min)
  ) {
    return null;
  }
  return date;
}

export default function AdminEventCreateScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});

  function validateForm() {
    const nextErrors: EventFormErrors = {};

    if (!title.trim()) nextErrors.title = "Le titre de l'evenement est requis.";
    if (!content.trim()) nextErrors.content = "La description de l'evenement est requise.";
    if (!address.trim()) nextErrors.address = "L'adresse de l'evenement est requise.";

    const startAtIso = toApiDateTimeString(startAt);
    const endAtIso = toApiDateTimeString(endAt);
    const deadlineIso = toApiDateTimeString(registrationDeadline);
    const startDate = parseDisplayDateTime(startAt);
    const endDate = parseDisplayDateTime(endAt);
    const deadlineDate = parseDisplayDateTime(registrationDeadline);

    if (!startAt.trim()) nextErrors.startAt = "La date et l'heure de debut sont requises.";
    else if (!startAtIso || !startDate) nextErrors.startAt = "Utilisez le format jj/mm/aaaa hh:mm.";

    if (!endAt.trim()) nextErrors.endAt = "La date et l'heure de fin sont requises.";
    else if (!endAtIso || !endDate) nextErrors.endAt = "Utilisez le format jj/mm/aaaa hh:mm.";

    if (!registrationDeadline.trim()) nextErrors.registrationDeadline = "La date limite d'inscription est requise.";
    else if (!deadlineIso || !deadlineDate) nextErrors.registrationDeadline = "Utilisez le format jj/mm/aaaa hh:mm.";

    if (startDate && endDate && endDate.getTime() <= startDate.getTime()) {
      nextErrors.endAt = "La date et l'heure de fin doivent etre posterieures a la date et l'heure de debut.";
    }
    if (startDate && deadlineDate && deadlineDate.getTime() > startDate.getTime()) {
      nextErrors.registrationDeadline = "La date limite doit etre anterieure ou egale a la date et l'heure de debut.";
    }

    setFormErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, startAtIso, endAtIso, deadlineIso };
  }

  async function onSubmit() {
    const { isValid, startAtIso, endAtIso, deadlineIso } = validateForm();
    if (!isValid || !startAtIso || !endAtIso || !deadlineIso) return;
    try {
      setLoading(true);
      await createAdminPostApi({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        address: address.trim(),
        startAt: startAtIso,
        endAt: endAtIso,
        registrationDeadline: deadlineIso,
      });
      Alert.alert("Publie", "L'evenement admin est maintenant visible pour tout le monde.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Erreur", err?.message || "Impossible de publier l'evenement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.title}>Ajouter un evenement</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Input label="Titre de l'evenement" value={title} onChangeText={setTitle} error={formErrors.title} />
        <Input label="Description" value={content} onChangeText={setContent} error={formErrors.content} multiline numberOfLines={5} style={styles.multilineInput as any} />
        <Input label="Adresse" value={address} onChangeText={setAddress} error={formErrors.address} />
        <DateInput label="Date et heure de debut" value={startAt} onChangeText={setStartAt} error={formErrors.startAt} withTime />
        <DateInput label="Date et heure de fin" value={endAt} onChangeText={setEndAt} error={formErrors.endAt} withTime />
        <DateInput label="Date et heure limite de participation" value={registrationDeadline} onChangeText={setRegistrationDeadline} error={formErrors.registrationDeadline} withTime />
        <ImageUploadField label="Image de l'evenement (optionnel)" value={imageUrl || null} onChange={(value) => setImageUrl(value || "")} error={formErrors.imageUrl} />

        <View style={styles.actions}>
          <Button label={loading ? "Validation..." : "Valider"} onPress={onSubmit} disabled={loading} />
          <Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={loading} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg, marginTop: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg },
  multilineInput: { minHeight: 110, textAlignVertical: "top" },
  actions: { marginTop: spacing.sm, gap: spacing.sm },
});
