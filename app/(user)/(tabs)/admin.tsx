import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Button from "../../../src/components/Button";
import Input from "../../../src/components/Input";
import { colors } from "../../../src/theme/colors";
import { spacing } from "../../../src/theme/spacing";
import { typography } from "../../../src/theme/typography";
import {
  AdminAccount,
  AdminPendingEvent,
  AdminPendingGlass,
  AdminProduct,
  cancelAdminPostApi,
  createAdminPostApi,
  deleteAdminGlassApi,
  deleteAdminPostApi,
  deleteAdminProductApi,
  listAdminAccountsApi,
  listAdminGlassesApi,
  listAdminPostsApi,
  listAdminProductsApi,
  reviewAdminAccountApi,
  reviewAdminGlassApi,
  reviewAdminPostApi,
  reviewAdminProductApi,
  updateAdminGlassApi,
  updateAdminPostApi,
  updateAdminProductApi,
} from "../../../src/api/adminApi";

type AdminTab = "accounts" | "glasses" | "products" | "events";

type AdminEventForm = {
  title: string;
  content: string;
  address: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string;
  imageUrl: string;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
};

const initialEventForm: AdminEventForm = {
  title: "",
  content: "",
  address: "",
  startAt: "",
  endAt: "",
  registrationDeadline: "",
  imageUrl: "",
};

function formatDateTime(value?: string | null) {
  if (!value) return "A confirmer";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateForInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function toApiDateString(value: string) {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return iso;
}

function accountStatusLabel(status: AdminAccount["status"]) {
  if (status === "ACTIVE") return "Actif";
  if (status === "SUSPENDED") return "Suspendu";
  if (status === "PENDING_APPROVAL") return "Attente admin";
  return "Email non verifie";
}

function contentStatusLabel(status: "EN_ATTENTE" | "VALIDE" | "REJETE", isCancelled?: boolean) {
  if (isCancelled) return "Annule";
  if (status === "VALIDE") return "Valide";
  if (status === "REJETE") return "Rejete";
  return "En attente";
}

export default function AdminScreen() {
  const [tab, setTab] = useState<AdminTab>("accounts");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [glasses, setGlasses] = useState<AdminPendingGlass[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [events, setEvents] = useState<AdminPendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [accountReasons, setAccountReasons] = useState<Record<number, string>>({});
  const [glassReasons, setGlassReasons] = useState<Record<number, string>>({});
  const [productReasons, setProductReasons] = useState<Record<number, string>>({});
  const [eventReasons, setEventReasons] = useState<Record<number, string>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<number, string>>({});
  const [eventForm, setEventForm] = useState<AdminEventForm>(initialEventForm);
  const [glassForms, setGlassForms] = useState<Record<number, { name: string; description: string }>>({});
  const [productForms, setProductForms] = useState<Record<number, ProductForm>>({});
  const [eventForms, setEventForms] = useState<Record<number, AdminEventForm>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [accountsRes, glassesRes, productsRes, eventsRes] = await Promise.all([
        listAdminAccountsApi(),
        listAdminGlassesApi(),
        listAdminProductsApi(),
        listAdminPostsApi(),
      ]);
      const nextGlasses = glassesRes.items ?? [];
      const nextProducts = productsRes.items ?? [];
      const nextEvents = eventsRes.items ?? [];
      setAccounts(accountsRes.items ?? []);
      setGlasses(nextGlasses);
      setProducts(nextProducts);
      setEvents(nextEvents);
      setGlassForms(Object.fromEntries(nextGlasses.map((item) => [item.id, { name: item.name || "", description: item.description || "" }])));
      setProductForms(Object.fromEntries(nextProducts.map((item) => [item.id, { name: item.name || "", description: item.description || "", price: item.price != null ? String(item.price) : "", imageUrl: item.imageUrl || "", isAvailable: item.isAvailable !== false }])));
      setEventForms(Object.fromEntries(nextEvents.map((item) => [item.id, {
        title: item.title || "",
        content: item.content || "",
        address: item.address || "",
        startAt: formatDateForInput(item.startAt),
        endAt: formatDateForInput(item.endAt),
        registrationDeadline: formatDateForInput(item.registrationDeadline),
        imageUrl: item.imageUrl || "",
      }])));
      setCancelReasons(Object.fromEntries(nextEvents.map((item) => [item.id, item.cancellationReason || ""])));
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de charger l'espace administrateur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pendingGlasses = useMemo(() => glasses.filter((item) => item.status === "EN_ATTENTE"), [glasses]);
  const managedGlasses = useMemo(() => glasses.filter((item) => item.status === "VALIDE"), [glasses]);
  const pendingProducts = useMemo(() => products.filter((item) => item.status === "EN_ATTENTE"), [products]);
  const managedProducts = useMemo(() => products.filter((item) => item.status === "VALIDE"), [products]);
  const pendingEvents = useMemo(() => events.filter((item) => item.status === "EN_ATTENTE"), [events]);
  const managedEvents = useMemo(() => events.filter((item) => item.status === "VALIDE"), [events]);

  function updateEventForm(key: keyof AdminEventForm, value: string) {
    setEventForm((current) => ({ ...current, [key]: value }));
  }

  function updateManagedGlass(id: number, key: "name" | "description", value: string) {
    setGlassForms((current) => ({ ...current, [id]: { ...(current[id] || { name: "", description: "" }), [key]: value } }));
  }

  function updateManagedProduct(id: number, key: keyof ProductForm, value: string | boolean) {
    setProductForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] || { name: "", description: "", price: "", imageUrl: "", isAvailable: true }),
        [key]: value,
      },
    }));
  }

  function updateManagedEvent(id: number, key: keyof AdminEventForm, value: string) {
    setEventForms((current) => ({
      ...current,
      [id]: {
        ...(current[id] || initialEventForm),
        [key]: value,
      },
    }));
  }

  function buildEventPayload(form: AdminEventForm) {
    const startAt = toApiDateString(form.startAt);
    const endAt = toApiDateString(form.endAt);
    const registrationDeadline = toApiDateString(form.registrationDeadline);
    if (!startAt || !endAt || !registrationDeadline) {
      return { error: "Introduisez les dates au format jj/mm/aaaa" };
    }
    return {
      title: form.title.trim(),
      content: form.content.trim(),
      address: form.address.trim(),
      startAt,
      endAt,
      registrationDeadline,
      imageUrl: form.imageUrl.trim() || undefined,
    };
  }

  async function onCreateAdminEvent() {
    const payload = buildEventPayload(eventForm);
    if ("error" in payload) return Alert.alert("Erreur", payload.error);
    if (!payload.title || !payload.content || !payload.address) {
      return Alert.alert("Erreur", "Tous les champs obligatoires de l'evenement admin doivent etre renseignes");
    }

    try {
      setBusyKey("create-admin-event");
      await createAdminPostApi(payload);
      setEventForm(initialEventForm);
      Alert.alert("Publie", "L'evenement admin est maintenant visible pour tout le monde");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de publier cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewAccount(item: AdminAccount, action: "validate" | "suspend") {
    const reason = (accountReasons[item.id] || "").trim();
    if (action === "suspend" && reason.length < 3) return Alert.alert("Erreur", "Motif de suspension requis");
    try {
      setBusyKey(`account-${item.id}-${action}`);
      await reviewAdminAccountApi(item.id, { action, reason: action === "suspend" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de mettre a jour ce compte");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewGlass(item: AdminPendingGlass, action: "validate" | "reject") {
    const reason = (glassReasons[item.id] || "").trim();
    if (action === "reject" && reason.length < 3) return Alert.alert("Erreur", "Motif de rejet requis");
    try {
      setBusyKey(`glass-${item.id}-${action}`);
      await reviewAdminGlassApi(item.id, { action, rejectReason: action === "reject" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de traiter ce verre");
    } finally {
      setBusyKey(null);
    }
  }

  async function onSaveGlass(item: AdminPendingGlass) {
    const form = glassForms[item.id];
    if (!form?.name?.trim()) return Alert.alert("Erreur", "Le nom du verre est requis");
    try {
      setBusyKey(`glass-${item.id}-save`);
      await updateAdminGlassApi(item.id, { name: form.name.trim(), description: form.description.trim() || null });
      Alert.alert("Enregistre", "Le verre a ete modifie");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier ce verre");
    } finally {
      setBusyKey(null);
    }
  }

  async function onDeleteGlass(item: AdminPendingGlass) {
    try {
      setBusyKey(`glass-${item.id}-delete`);
      await deleteAdminGlassApi(item.id);
      Alert.alert("Supprime", "Le verre a ete supprime");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de supprimer ce verre");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewProduct(item: AdminProduct, action: "validate" | "reject") {
    const reason = (productReasons[item.id] || "").trim();
    if (action === "reject" && reason.length < 3) return Alert.alert("Erreur", "Motif de rejet requis");
    try {
      setBusyKey(`product-${item.id}-${action}`);
      await reviewAdminProductApi(item.id, { action, rejectReason: action === "reject" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de traiter ce produit");
    } finally {
      setBusyKey(null);
    }
  }

  async function onSaveProduct(item: AdminProduct) {
    const form = productForms[item.id];
    if (!form?.name?.trim()) return Alert.alert("Erreur", "Le nom du produit est requis");
    try {
      setBusyKey(`product-${item.id}-save`);
      await updateAdminProductApi(item.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: form.price.trim() ? Number(form.price.trim()) : null,
        imageUrl: form.imageUrl.trim() || null,
        isAvailable: form.isAvailable,
      });
      Alert.alert("Enregistre", "Le produit a ete modifie");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier ce produit");
    } finally {
      setBusyKey(null);
    }
  }

  async function onDeleteProduct(item: AdminProduct) {
    try {
      setBusyKey(`product-${item.id}-delete`);
      await deleteAdminProductApi(item.id);
      Alert.alert("Supprime", "Le produit a ete supprime");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de supprimer ce produit");
    } finally {
      setBusyKey(null);
    }
  }

  async function onReviewEvent(item: AdminPendingEvent, action: "validate" | "reject") {
    const reason = (eventReasons[item.id] || "").trim();
    if (action === "reject" && reason.length < 3) return Alert.alert("Erreur", "Motif de rejet requis");
    try {
      setBusyKey(`event-${item.id}-${action}`);
      await reviewAdminPostApi(item.id, { action, rejectReason: action === "reject" ? reason : undefined });
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de traiter cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  function startEditEvent(item: AdminPendingEvent) {
    setEditingEventId(item.id);
    setEventForms((current) => ({
      ...current,
      [item.id]: {
        title: item.title || "",
        content: item.content || "",
        address: item.address || "",
        startAt: formatDateForInput(item.startAt),
        endAt: formatDateForInput(item.endAt),
        registrationDeadline: formatDateForInput(item.registrationDeadline),
        imageUrl: item.imageUrl || "",
      },
    }));
  }

  async function onSaveEvent(item: AdminPendingEvent) {
    const form = eventForms[item.id];
    if (!form?.title?.trim() || !form.content.trim() || !form.address.trim()) {
      return Alert.alert("Erreur", "Tous les champs de l'evenement sont requis");
    }
    const payload = buildEventPayload(form);
    if ("error" in payload) return Alert.alert("Erreur", payload.error);
    try {
      setBusyKey(`event-${item.id}-save`);
      await updateAdminPostApi(item.id, payload);
      setEditingEventId(null);
      Alert.alert("Enregistre", "L'evenement a ete modifie");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de modifier cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  async function onCancelEvent(item: AdminPendingEvent) {
    try {
      setBusyKey(`event-${item.id}-cancel`);
      await cancelAdminPostApi(item.id, { reason: (cancelReasons[item.id] || "").trim() || undefined });
      Alert.alert("Annule", "L'evenement a ete annule");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible d'annuler cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  async function onDeleteEvent(item: AdminPendingEvent) {
    try {
      setBusyKey(`event-${item.id}-delete`);
      await deleteAdminPostApi(item.id);
      Alert.alert("Supprime", "L'evenement a ete supprime");
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "Impossible de supprimer cet evenement");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={{ width: 30 }} />
        <Text style={styles.title}>Espace administrateur</Text>
        <Pressable onPress={() => router.replace({ pathname: "/(user)/(tabs)", params: { asUser: "1" } } as any)} hitSlop={10}>
          <Text style={styles.switchLink}>Voir en tant qu'utilisateur</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Validez les comptes, moderez les verres, produits et evenements, puis gerez leurs modifications, suppressions et annulations depuis ce meme espace.</Text>

      <View style={styles.utilityCard}>
        <Text style={styles.utilityTitle}>Messagerie</Text>
        <Text style={styles.utilityText}>Chaque compte est maintenant consultable. Ouvrez son profil pour le contacter.</Text>
        <Button label="Ouvrir la messagerie" onPress={() => router.push("/(user)/(tabs)/messages" as any)} style={styles.fullButton} />
      </View>

      <View style={styles.segmentWrap}>
        <Pressable onPress={() => setTab("accounts")} style={[styles.segment, tab === "accounts" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "accounts" ? styles.segmentTextActive : null]}>Comptes</Text></Pressable>
        <Pressable onPress={() => setTab("glasses")} style={[styles.segment, tab === "glasses" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "glasses" ? styles.segmentTextActive : null]}>Verres</Text></Pressable>
        <Pressable onPress={() => setTab("products")} style={[styles.segment, tab === "products" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "products" ? styles.segmentTextActive : null]}>Produits</Text></Pressable>
        <Pressable onPress={() => setTab("events")} style={[styles.segment, tab === "events" ? styles.segmentActive : null]}><Text style={[styles.segmentText, tab === "events" ? styles.segmentTextActive : null]}>Evenements</Text></Pressable>
      </View>

      {loading ? <Text style={styles.loading}>Chargement...</Text> : null}

      {!loading && tab === "accounts" ? (
        <View>
          {accounts.map((item) => (
            <Pressable key={item.id} style={styles.card} onPress={() => router.push({ pathname: "/(user)/profile/[id]", params: { id: String(item.id), fromAdmin: "1" } } as any)}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.username}</Text>
                <Text style={styles.badge}>{accountStatusLabel(item.status)}</Text>
              </View>
              <Text style={styles.meta}>{item.email} · {item.role === "BREWER" ? "Brasseur" : "Utilisateur"}</Text>
              <Text style={styles.meta}>Creation: {formatDateTime(item.createdAt)}</Text>
              {item.brewery ? <Text style={styles.meta}>Brasserie: {item.brewery.name}{item.brewery.vatNumber ? ` · TVA ${item.brewery.vatNumber}` : ""}</Text> : null}
              {item.statusReason ? <Text style={styles.reject}>Motif: {item.statusReason}</Text> : null}
              <Text style={styles.openHint}>Touchez pour consulter ce compte et le contacter</Text>
              <Input label="Motif de suspension" value={accountReasons[item.id] || ""} onChangeText={(value) => setAccountReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `account-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewAccount(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `account-${item.id}-suspend` ? "..." : "Suspendre"} variant="secondary" onPress={() => onReviewAccount(item, "suspend")} disabled={busyKey != null} />
              </View>
            </Pressable>
          ))}
          {accounts.length === 0 ? <Text style={styles.empty}>Aucun compte a moderer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "glasses" ? (
        <View>
          <Text style={styles.sectionTitle}>Verres en attente</Text>
          {pendingGlasses.map((item) => {
            const imageUrl = item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;
            return (
              <View key={item.id} style={styles.card}>
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.badge}>{contentStatusLabel(item.status)}</Text></View>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie inconnue"}</Text>
                <Text style={styles.meta}>Propose par {item.createdBy?.username || "Utilisateur"}</Text>
                {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
                <Input label="Motif de rejet" value={glassReasons[item.id] || ""} onChangeText={(value) => setGlassReasons((current) => ({ ...current, [item.id]: value }))} />
                <View style={styles.actionsRow}>
                  <Button label={busyKey === `glass-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewGlass(item, "validate")} disabled={busyKey != null} />
                  <Button label={busyKey === `glass-${item.id}-reject` ? "..." : "Rejeter"} variant="secondary" onPress={() => onReviewGlass(item, "reject")} disabled={busyKey != null} />
                </View>
              </View>
            );
          })}
          {pendingGlasses.length === 0 ? <Text style={styles.empty}>Aucun verre en attente.</Text> : null}

          <Text style={styles.sectionTitle}>Verres valides a gerer</Text>
          {managedGlasses.map((item) => {
            const imageUrl = item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;
            const form = glassForms[item.id] || { name: item.name || "", description: item.description || "" };
            return (
              <View key={item.id} style={styles.card}>
                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.badge}>{contentStatusLabel(item.status)}</Text></View>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie inconnue"}</Text>
                <Input label="Nom" value={form.name} onChangeText={(value) => updateManagedGlass(item.id, "name", value)} />
                <Input label="Description" value={form.description} onChangeText={(value) => updateManagedGlass(item.id, "description", value)} multiline style={styles.multilineInput} />
                <View style={styles.actionsRow}>
                  <Button label={busyKey === `glass-${item.id}-save` ? "..." : "Modifier"} onPress={() => onSaveGlass(item)} disabled={busyKey != null} />
                  <Button label={busyKey === `glass-${item.id}-delete` ? "..." : "Supprimer"} variant="secondary" onPress={() => onDeleteGlass(item)} disabled={busyKey != null} />
                </View>
              </View>
            );
          })}
          {managedGlasses.length === 0 ? <Text style={styles.empty}>Aucun verre valide a gerer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "products" ? (
        <View>
          <Text style={styles.sectionTitle}>Produits en attente</Text>
          {pendingProducts.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
              <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.badge}>{contentStatusLabel(item.status)}</Text></View>
              <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
              <Text style={styles.meta}>Prix: {item.price != null ? `${item.price} ${item.currency || "EUR"}` : "A confirmer"}</Text>
              {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
              <Input label="Motif de rejet" value={productReasons[item.id] || ""} onChangeText={(value) => setProductReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `product-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewProduct(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `product-${item.id}-reject` ? "..." : "Rejeter"} variant="secondary" onPress={() => onReviewProduct(item, "reject")} disabled={busyKey != null} />
              </View>
            </View>
          ))}
          {pendingProducts.length === 0 ? <Text style={styles.empty}>Aucun produit en attente.</Text> : null}

          <Text style={styles.sectionTitle}>Produits valides a gerer</Text>
          {managedProducts.map((item) => {
            const form = productForms[item.id] || { name: item.name || "", description: item.description || "", price: item.price != null ? String(item.price) : "", imageUrl: item.imageUrl || "", isAvailable: item.isAvailable !== false };
            return (
              <View key={item.id} style={styles.card}>
                {form.imageUrl ? <Image source={{ uri: form.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.badge}>{contentStatusLabel(item.status)}</Text></View>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
                <Input label="Nom" value={form.name} onChangeText={(value) => updateManagedProduct(item.id, "name", value)} />
                <Input label="Description" value={form.description} onChangeText={(value) => updateManagedProduct(item.id, "description", value)} multiline style={styles.multilineInput} />
                <Input label="Prix" value={form.price} onChangeText={(value) => updateManagedProduct(item.id, "price", value)} keyboardType="decimal-pad" />
                <Input label="Image URL" value={form.imageUrl} onChangeText={(value) => updateManagedProduct(item.id, "imageUrl", value)} autoCapitalize="none" />
                <Text style={styles.meta}>Disponibilite: {form.isAvailable ? "En vente" : "Masque"}</Text>
                <View style={styles.actionsRow}>
                  <Button label={form.isAvailable ? "Masquer" : "Rendre visible"} variant="secondary" onPress={() => updateManagedProduct(item.id, "isAvailable", !form.isAvailable)} disabled={busyKey != null} />
                </View>
                <View style={styles.actionsRow}>
                  <Button label={busyKey === `product-${item.id}-save` ? "..." : "Modifier"} onPress={() => onSaveProduct(item)} disabled={busyKey != null} />
                  <Button label={busyKey === `product-${item.id}-delete` ? "..." : "Supprimer"} variant="secondary" onPress={() => onDeleteProduct(item)} disabled={busyKey != null} />
                </View>
              </View>
            );
          })}
          {managedProducts.length === 0 ? <Text style={styles.empty}>Aucun produit valide a gerer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "events" ? (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Publier un evenement admin</Text>
            <Text style={styles.helper}>Format des dates : jj/mm/aaaa</Text>
            <Input label="Titre" value={eventForm.title} onChangeText={(value) => updateEventForm("title", value)} />
            <Input label="Description" value={eventForm.content} onChangeText={(value) => updateEventForm("content", value)} multiline style={styles.multilineInput} />
            <Input label="Adresse" value={eventForm.address} onChangeText={(value) => updateEventForm("address", value)} />
            <Input label="Date de debut (jj/mm/aaaa)" value={eventForm.startAt} onChangeText={(value) => updateEventForm("startAt", value)} />
            <Input label="Date de fin (jj/mm/aaaa)" value={eventForm.endAt} onChangeText={(value) => updateEventForm("endAt", value)} />
            <Input label="Date limite d'inscription (jj/mm/aaaa)" value={eventForm.registrationDeadline} onChangeText={(value) => updateEventForm("registrationDeadline", value)} />
            <Input label="Image URL optionnelle" value={eventForm.imageUrl} onChangeText={(value) => updateEventForm("imageUrl", value)} autoCapitalize="none" />
            <Button label={busyKey === "create-admin-event" ? "Publication..." : "Publier l'evenement"} onPress={onCreateAdminEvent} disabled={busyKey != null} style={styles.fullButton} />
          </View>

          <Text style={styles.sectionTitle}>Evenements en attente</Text>
          {pendingEvents.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.badge}>{contentStatusLabel(item.status)}</Text></View>
              <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
              <Text style={styles.meta}>Debut: {formatDateTime(item.startAt)}</Text>
              <Text style={styles.meta}>Fin: {formatDateTime(item.endAt)}</Text>
              <Text style={styles.meta}>Adresse: {item.address || "A confirmer"}</Text>
              <Text style={styles.text}>{item.content}</Text>
              <Input label="Motif de rejet" value={eventReasons[item.id] || ""} onChangeText={(value) => setEventReasons((current) => ({ ...current, [item.id]: value }))} />
              <View style={styles.actionsRow}>
                <Button label={busyKey === `event-${item.id}-validate` ? "..." : "Valider"} onPress={() => onReviewEvent(item, "validate")} disabled={busyKey != null} />
                <Button label={busyKey === `event-${item.id}-reject` ? "..." : "Rejeter"} variant="secondary" onPress={() => onReviewEvent(item, "reject")} disabled={busyKey != null} />
              </View>
            </View>
          ))}
          {pendingEvents.length === 0 ? <Text style={styles.empty}>Aucun evenement en attente.</Text> : null}

          <Text style={styles.sectionTitle}>Evenements valides a gerer</Text>
          {managedEvents.map((item) => {
            const form = eventForms[item.id] || initialEventForm;
            const isEditing = editingEventId === item.id;
            return (
              <View key={item.id} style={styles.card}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.badge}>{contentStatusLabel(item.status, item.isCancelled)}</Text></View>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
                <Text style={styles.meta}>Debut: {formatDateTime(item.startAt)}</Text>
                <Text style={styles.meta}>Fin: {formatDateTime(item.endAt)}</Text>
                <Text style={styles.meta}>Adresse: {item.address || "A confirmer"}</Text>
                {item.isCancelled ? <Text style={styles.reject}>Evenement annule{item.cancellationReason ? ` · Motif: ${item.cancellationReason}` : ""}</Text> : null}

                {isEditing ? (
                  <View style={styles.editPanel}>
                    <Input label="Titre" value={form.title} onChangeText={(value) => updateManagedEvent(item.id, "title", value)} />
                    <Input label="Description" value={form.content} onChangeText={(value) => updateManagedEvent(item.id, "content", value)} multiline style={styles.multilineInput} />
                    <Input label="Adresse" value={form.address} onChangeText={(value) => updateManagedEvent(item.id, "address", value)} />
                    <Input label="Date de debut (jj/mm/aaaa)" value={form.startAt} onChangeText={(value) => updateManagedEvent(item.id, "startAt", value)} />
                    <Input label="Date de fin (jj/mm/aaaa)" value={form.endAt} onChangeText={(value) => updateManagedEvent(item.id, "endAt", value)} />
                    <Input label="Date limite d'inscription (jj/mm/aaaa)" value={form.registrationDeadline} onChangeText={(value) => updateManagedEvent(item.id, "registrationDeadline", value)} />
                    <Input label="Image URL optionnelle" value={form.imageUrl} onChangeText={(value) => updateManagedEvent(item.id, "imageUrl", value)} autoCapitalize="none" />
                    <View style={styles.actionsRow}>
                      <Button label={busyKey === `event-${item.id}-save` ? "..." : "Valider les modifications"} onPress={() => onSaveEvent(item)} disabled={busyKey != null} />
                      <Button label="Annuler" variant="secondary" onPress={() => setEditingEventId(null)} disabled={busyKey != null} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionsRow}>
                    <Button label="Modifier" onPress={() => startEditEvent(item)} disabled={busyKey != null} />
                    <Button label={busyKey === `event-${item.id}-delete` ? "..." : "Supprimer"} variant="secondary" onPress={() => onDeleteEvent(item)} disabled={busyKey != null} />
                  </View>
                )}

                {!item.isCancelled ? (
                  <>
                    <Input label="Motif d'annulation optionnel" value={cancelReasons[item.id] || ""} onChangeText={(value) => setCancelReasons((current) => ({ ...current, [item.id]: value }))} />
                    <View style={styles.actionsRow}>
                      <Button label={busyKey === `event-${item.id}-cancel` ? "..." : "Annuler l'evenement"} variant="secondary" onPress={() => onCancelEvent(item)} disabled={busyKey != null} />
                    </View>
                  </>
                ) : null}
              </View>
            );
          })}
          {managedEvents.length === 0 ? <Text style={styles.empty}>Aucun evenement valide a gerer.</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm, marginTop: spacing.lg, gap: spacing.sm },
  title: { fontSize: typography.h1, fontWeight: "900", color: colors.text, flex: 1, textAlign: "center" },
  switchLink: { color: colors.primaryDark, fontWeight: "900", fontSize: 12, textAlign: "right", maxWidth: 110 },
  subtitle: { color: colors.muted, lineHeight: 20, marginBottom: spacing.lg },
  utilityCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.lg },
  utilityTitle: { color: colors.text, fontWeight: "900", fontSize: 17 },
  utilityText: { color: colors.muted, marginTop: spacing.xs, lineHeight: 20 },
  segmentWrap: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg, flexWrap: "wrap" },
  segment: { minWidth: "23%", borderRadius: 14, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  segmentText: { color: colors.text, fontWeight: "900" },
  segmentTextActive: { color: "#2E1A0F" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 18, marginBottom: spacing.sm, marginTop: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 17, flex: 1 },
  badge: { color: colors.primaryDark, fontWeight: "900" },
  meta: { color: colors.muted, marginTop: spacing.xs, fontWeight: "700" },
  openHint: { color: colors.primaryDark, marginTop: spacing.md, fontWeight: "900" },
  text: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  helper: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 18 },
  multilineInput: { minHeight: 110, textAlignVertical: "top" },
  fullButton: { marginTop: spacing.sm },
  reject: { color: colors.dangerText, marginTop: spacing.sm, fontWeight: "700" },
  image: { width: "100%", height: 180, borderRadius: 14, marginBottom: spacing.md, backgroundColor: colors.bg2 },
  actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  editPanel: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
});
