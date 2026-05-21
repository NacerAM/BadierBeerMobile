import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Platform, ToastAndroid, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCollection } from "../../../src/store/useCollection";
import { listMyProposalsApi, deleteMyProposalApi, MyProposal } from "../../../src/api/proposalsApi";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";

import Button from "../../../src/components/Button";
import Input from "../../../src/components/Input";
function showToast(msg: string) { if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT); else Alert.alert("Info", msg); }
function badge(status?: string) {
  if (status === "VALIDE") return { bg: colors.successBg, text: colors.successText, label: "Validé" };
  if (status === "REJETE") return { bg: colors.dangerBg, text: colors.dangerText, label: "Rejeté" };
  return { bg: colors.warningBg, text: colors.warningText, label: "En attente" };
}

export default function ProposalsScreen() {
  const [items, setItems] = useState<MyProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForId, setShowForId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { has, toggle, refresh } = useCollection();
  const [savingId, setSavingId] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await listMyProposalsApi();
      setItems(res.items || []);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }


  async function onDelete(id: number) {
    if (!password.trim()) { setDeleteError("Mot de passe requis"); return; }
    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteMyProposalApi(id, password.trim());
      setPassword("");
      setShowForId(null);
      await load();
    } catch (e: any) {
      setDeleteError(e?.message || "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
      refresh();
    }, [refresh]));

  return (
    <View style={styles.container}>
    <View style={styles.topBar}>
        <Pressable onPress={() => router.push("/(user)/(tabs)/profile" as any)} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color={colors.text as any} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>Mes demandes</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.retry} onPress={load}>
            Réessayer
          </Text>
        </View>
      ) : (
        <FlatList


          data={items}
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}
          ListEmptyComponent={<Text style={styles.muted}>Aucune proposition.</Text>}
          renderItem={({ item }) => {
            const b = badge(item.status);
            return (
              <View style={styles.card}>
                <Pressable onPress={() => router.push({ pathname: "/(user)/proposal/[id]", params: { id: String(item.id) } } as any)}>
                  <View style={styles.row}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: b.bg }]}>
                      <Text style={[styles.badgeText, { color: b.text }]}>{b.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardSubtitle}>{item.Manufacturer?.name || "—"}</Text>

                  {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

                  {item.status === "REJETE" && item.rejectReason ? (
                    <Text style={styles.reject}>Raison : {item.rejectReason}</Text>
                  ) : null}

                  <Text style={styles.consultLink}>Consulter la proposition</Text>
                </Pressable>
                {item.status === "EN_ATTENTE" && (
  showForId === item.id ? (
    <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
      {deleteError ? <Text style={{ color: colors.dangerText, fontWeight: "800" }}>{deleteError}</Text> : null}
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <Button label="Annuler" variant="secondary" onPress={() => { setShowForId(null); setPassword(""); setDeleteError(null); }} />
        <Button label={deleting ? "Suppression..." : "Confirmer"} onPress={() => onDelete(item.id)} disabled={deleting || !password.trim()} />
      </View>
    </View>
  ) : (
    <View style={{ marginTop: spacing.sm, flexDirection: "row", justifyContent: "flex-end" }}>
      <Text onPress={() => setShowForId(item.id)} style={{ color: colors.dangerText, fontWeight: "800" }}>Supprimer</Text>
    </View>
  )
)}
                  {item.status === "VALIDE" ? (
                  <View style={{ marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Button
                      label={savingId === item.id ? "..." : (has(item.id) ? "Retirer de ma collection" : "Ajouter à ma collection")}
                      variant={has(item.id) ? "secondary" : "primary"}
                      disabled={!!savingId}
                      onPress={async () => {
                        try {
                          setSavingId(item.id);
                          await toggle(item.id);
                          showToast(has(item.id) ? "Retiré de votre collection" : "Ajouté à votre collection");
                          await refresh();
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    />
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", shadowColor: colors.shadow as any, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  topTitle: { fontSize: typography.h1, fontWeight: "900", color: colors.text },
  container: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg },
  title: { fontSize: typography.h1, fontWeight: "800", color: colors.text, marginBottom: spacing.md },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg },
  muted: { color: colors.muted, textAlign: "center" },
  error: { color: colors.dangerText, fontWeight: "700", textAlign: "center" },
  retry: { color: colors.primaryDark, fontWeight: "800" },

  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, backgroundColor: colors.card },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text, flex: 1 },
  cardSubtitle: { marginTop: 6, color: colors.muted },
  desc: { marginTop: 8, color: colors.text },
  consultLink: { marginTop: spacing.sm, color: colors.primaryDark, fontWeight: "900" },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },
  reject: { marginTop: 8, color: colors.dangerText, fontWeight: "800" },
});



























