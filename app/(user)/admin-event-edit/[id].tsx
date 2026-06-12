import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import Input from "../../../src/components/Input";
import DateInput from "../../../src/components/DateInput";
import Button from "../../../src/components/Button";
import ImageUploadField from "../../../src/components/ImageUploadField";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import { AdminPendingEvent, listAdminPostsApi, updateAdminPostApi } from "../../../src/api/adminApi";

function formatDateForInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

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

export default function AdminEventEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const [event, setEvent] = useState<AdminPendingEvent | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listAdminPostsApi();
      const item = (res.items || []).find((entry) => Number(entry.id) === eventId) || null;
      if (!item) {
        setEvent(null);
        setError("Evenement introuvable");
        return;
      }
      setEvent(item);
      setTitle(item.title || "");
      setContent(item.content || "");
      setAddress(item.address || "");
      setStartAt(formatDateForInput(item.startAt));
      setEndAt(formatDateForInput(item.endAt));
      setRegistrationDeadline(formatDateForInput(item.registrationDeadline));
      setImageUrl(item.imageUrl || "");
    } catch (e: any) {
      setError(e?.message || "Impossible de charger cet evenement");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSave() {
    if (!title.trim() || !content.trim() || !address.trim()) {
      Alert.alert("Erreur", "Tous les champs de l'evenement sont requis");
      return;
    }
    const startAtIso = toApiDateTimeString(startAt);
    const endAtIso = toApiDateTimeString(endAt);
    const deadlineIso = toApiDateTimeString(registrationDeadline);
    const startDate = parseDisplayDateTime(startAt);
    const endDate = parseDisplayDateTime(endAt);
    const deadlineDate = parseDisplayDateTime(registrationDeadline);
    if (!startAtIso || !endAtIso || !deadlineIso || !startDate || !endDate || !deadlineDate) {
      Alert.alert("Erreur", "Introduisez les dates au format jj/mm/aaaa hh:mm");
      return;
    }
    if (endDate.getTime() <= startDate.getTime()) {
      Alert.alert("Erreur", "La date et l'heure de fin doivent etre posterieures a la date et l'heure de debut");
      return;
    }
    if (deadlineDate.getTime() > startDate.getTime()) {
      Alert.alert("Erreur", "La date et l'heure limite d'inscription doivent etre anterieures ou egales a la date et l'heure de debut");
      return;
    }

    try {
      setSaving(true);
      await updateAdminPostApi(eventId, {
        title: title.trim(),
        content: content.trim(),
        address: address.trim(),
        startAt: startAtIso,
        endAt: endAtIso,
        registrationDeadline: deadlineIso,
        imageUrl: imageUrl.trim() || null,
      });
      Alert.alert("Enregistre", "L'evenement a ete modifie", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier cet evenement");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /><Text style={styles.centerText}>Chargement...</Text></View>;
  }
  if (error || !event) {
    return <View style={styles.center}><Text style={styles.errorText}>{error || "Evenement introuvable"}</Text><Button label="Reessayer" onPress={load} /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.title}>Modifier l'evenement</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <Input label="Titre" value={title} onChangeText={setTitle} />
        <Input label="Description" value={content} onChangeText={setContent} multiline numberOfLines={5} style={styles.multilineInput as any} />
        <Input label="Adresse" value={address} onChangeText={setAddress} />
        <DateInput label="Date et heure de debut" value={startAt} onChangeText={setStartAt} withTime />
        <DateInput label="Date et heure de fin" value={endAt} onChangeText={setEndAt} withTime />
        <DateInput label="Date et heure limite de participation" value={registrationDeadline} onChangeText={setRegistrationDeadline} withTime />
        <ImageUploadField label="Image de l'evenement (optionnel)" value={imageUrl || null} onChange={(value) => setImageUrl(value || "")} />

        <View style={styles.actions}>
          <Button label={saving ? "Validation..." : "Valider les modifications"} onPress={onSave} disabled={saving} />
          <Button label="Annuler" variant="secondary" onPress={() => router.back()} disabled={saving} />
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  centerText: { color: colors.muted },
  errorText: { color: colors.dangerText, fontWeight: "900", textAlign: "center" },
});
