import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
} from "../../../src/api/adminApi";

type AdminTab = "accounts" | "glasses" | "products" | "events";

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

function normalizeSearchValue(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesSearch(query: string, values: Array<string | number | null | undefined>) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchValue(String(value || "")).includes(normalizedQuery));
}

export default function AdminScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<AdminTab>("accounts");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [glasses, setGlasses] = useState<AdminPendingGlass[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [events, setEvents] = useState<AdminPendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [accountReasons, setAccountReasons] = useState<Record<number, string>>({});
  const [glassReasons, setGlassReasons] = useState<Record<number, string>>({});
  const [productReasons, setProductReasons] = useState<Record<number, string>>({});
  const [eventReasons, setEventReasons] = useState<Record<number, string>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<number, string>>({});
  const [searchByTab, setSearchByTab] = useState<Record<AdminTab, string>>({
    accounts: "",
    glasses: "",
    products: "",
    events: "",
  });
  const [pendingOnlyByTab, setPendingOnlyByTab] = useState<Record<AdminTab, boolean>>({
    accounts: false,
    glasses: false,
    products: false,
    events: false,
  });

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

  useEffect(() => {
    const nextTab = params.tab;
    if (nextTab === "accounts" || nextTab === "glasses" || nextTab === "products" || nextTab === "events") {
      setTab(nextTab);
    }
  }, [params.tab]);

  const pendingGlasses = useMemo(() => glasses.filter((item) => item.status === "EN_ATTENTE"), [glasses]);
  const managedGlasses = useMemo(() => glasses.filter((item) => item.status === "VALIDE"), [glasses]);
  const pendingProducts = useMemo(() => products.filter((item) => item.status === "EN_ATTENTE"), [products]);
  const managedProducts = useMemo(() => products.filter((item) => item.status === "VALIDE"), [products]);
  const pendingEvents = useMemo(() => events.filter((item) => item.status === "EN_ATTENTE"), [events]);
  const managedEvents = useMemo(() => events.filter((item) => item.status === "VALIDE"), [events]);
  const pendingAccounts = useMemo(() => accounts.filter((item) => item.status === "PENDING_APPROVAL"), [accounts]);
  const managedAccounts = useMemo(() => accounts.filter((item) => item.status !== "PENDING_APPROVAL"), [accounts]);
  const searchQuery = searchByTab[tab];
  const pendingOnly = pendingOnlyByTab[tab];

  const filteredPendingAccounts = useMemo(
    () => pendingAccounts.filter((item) => matchesSearch(searchByTab.accounts, [item.username, item.email, item.role, item.brewery?.name, item.brewery?.vatNumber, item.statusReason])),
    [pendingAccounts, searchByTab.accounts]
  );
  const filteredManagedAccounts = useMemo(
    () => managedAccounts.filter((item) => matchesSearch(searchByTab.accounts, [item.username, item.email, item.role, item.brewery?.name, item.brewery?.vatNumber, item.statusReason])),
    [managedAccounts, searchByTab.accounts]
  );
  const filteredPendingGlasses = useMemo(
    () => pendingGlasses.filter((item) => matchesSearch(searchByTab.glasses, [item.name, item.description, item.Manufacturer?.name, item.createdBy?.username])),
    [pendingGlasses, searchByTab.glasses]
  );
  const filteredManagedGlasses = useMemo(
    () => managedGlasses.filter((item) => matchesSearch(searchByTab.glasses, [item.name, item.description, item.Manufacturer?.name])),
    [managedGlasses, searchByTab.glasses]
  );
  const filteredPendingProducts = useMemo(
    () => pendingProducts.filter((item) => matchesSearch(searchByTab.products, [item.name, item.description, item.Manufacturer?.name, item.price, item.currency])),
    [pendingProducts, searchByTab.products]
  );
  const filteredManagedProducts = useMemo(
    () => managedProducts.filter((item) => matchesSearch(searchByTab.products, [item.name, item.description, item.Manufacturer?.name, item.price, item.currency])),
    [managedProducts, searchByTab.products]
  );
  const filteredPendingEvents = useMemo(
    () => pendingEvents.filter((item) => matchesSearch(searchByTab.events, [item.title, item.content, item.address, item.Manufacturer?.name])),
    [pendingEvents, searchByTab.events]
  );
  const filteredManagedEvents = useMemo(
    () => managedEvents.filter((item) => matchesSearch(searchByTab.events, [item.title, item.content, item.address, item.Manufacturer?.name, item.cancellationReason])),
    [managedEvents, searchByTab.events]
  );

  function renderTabButton(key: AdminTab, label: string, pendingCount: number) {
    const isActive = tab === key;
    return (
      <Pressable onPress={() => setTab(key)} style={[styles.segment, isActive ? styles.segmentActive : null]}>
        <View style={styles.segmentInner}>
          <Text style={[styles.segmentText, isActive ? styles.segmentTextActive : null]}>{label}</Text>
          {pendingCount > 0 ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  function renderAccountCard(item: AdminAccount) {
    return (
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
    );
  }

  function primaryImageUrl(item: AdminPendingGlass) {
    const list = item.images || [];
    const primary = list.find((img) => img.isPrimary) || list[0];
    return primary?.url || null;
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
        <Text style={styles.title}>Espace administrateur</Text>
      </View>


      <View style={styles.utilityCard}>
        <Text style={styles.utilityTitle}>Messagerie</Text>
        <Button label="Ouvrir la messagerie" onPress={() => router.push("/(user)/(tabs)/messages" as any)} style={styles.fullButton} />
      </View>

      <View style={styles.segmentWrap}>
        {renderTabButton("accounts", "Comptes", pendingAccounts.length)}
        {renderTabButton("glasses", "Verres", pendingGlasses.length)}
        {renderTabButton("products", "Produits", pendingProducts.length)}
        {renderTabButton("events", "Evenements", pendingEvents.length)}
      </View>

      <View style={styles.filtersCard}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.muted as any} />
          <TextInput
            value={searchQuery}
            onChangeText={(value) => setSearchByTab((current) => ({ ...current, [tab]: value }))}
            placeholder=""
            placeholderTextColor={colors.muted}
            style={styles.search}
            autoCapitalize="none"
          />
        </View>
        <Pressable
          onPress={() => setPendingOnlyByTab((current) => ({ ...current, [tab]: !current[tab] }))}
          style={[styles.pendingFilterButton, pendingOnly ? styles.pendingFilterButtonActive : null]}
        >
          <Text style={[styles.pendingFilterText, pendingOnly ? styles.pendingFilterTextActive : null]}>
            En attente de validation
          </Text>
        </Pressable>
      </View>

      {loading ? <Text style={styles.loading}>Chargement...</Text> : null}

      {!loading && tab === "accounts" ? (
        <View>
          {filteredPendingAccounts.map((item) => renderAccountCard(item))}
          {pendingOnly && filteredPendingAccounts.length === 0 ? <Text style={styles.empty}>Aucun compte en attente.</Text> : null}

          {!pendingOnly ? (
            <>
              <Text style={styles.sectionTitle}>Comptes geres</Text>
              {filteredManagedAccounts.map((item) => renderAccountCard(item))}
              {filteredManagedAccounts.length === 0 ? <Text style={styles.empty}>Aucun autre compte a afficher.</Text> : null}
            </>
          ) : null}
        </View>
      ) : null}

      {!loading && tab === "glasses" ? (
        <View>
          {filteredPendingGlasses.map((item) => {
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
          {pendingOnly && filteredPendingGlasses.length === 0 ? <Text style={styles.empty}>Aucun verre en attente.</Text> : null}

          {!pendingOnly ? <Text style={styles.sectionTitle}>Verres valides a gerer</Text> : null}
          {!pendingOnly ? (
            <View style={styles.catalogGrid}>
              {filteredManagedGlasses.map((item) => {
                const imageUrl = primaryImageUrl(item);
                return (
                  <Pressable
                    key={item.id}
                    style={styles.catalogCard}
                    onPress={() => router.push({ pathname: "/(user)/admin-glass/[id]", params: { id: String(item.id) } } as any)}
                  >
                    <View style={styles.catalogImageWrap}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.catalogImage} resizeMode="cover" />
                      ) : (
                        <Text style={styles.catalogImageEmoji}>🍺</Text>
                      )}
                      <View style={styles.catalogBadge}>
                        <Text style={styles.catalogBadgeText}>Valide</Text>
                      </View>
                    </View>
                    <Text style={styles.catalogTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.catalogSubtitle} numberOfLines={1}>{item.Manufacturer?.name || "Brasserie inconnue"}</Text>
                    {item.description ? <Text style={styles.catalogDescription} numberOfLines={3}>{item.description}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {!pendingOnly && filteredManagedGlasses.length === 0 ? <Text style={styles.empty}>Aucun verre valide a gerer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "products" ? (
        <View>
          {filteredPendingProducts.map((item) => (
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
          {pendingOnly && filteredPendingProducts.length === 0 ? <Text style={styles.empty}>Aucun produit en attente.</Text> : null}

          {!pendingOnly ? <Text style={styles.sectionTitle}>Produits valides a gerer</Text> : null}
          {!pendingOnly ? (
            <View style={styles.catalogGrid}>
              {filteredManagedProducts.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.catalogCard}
                  onPress={() => router.push({ pathname: "/(user)/admin-product/[id]", params: { id: String(item.id) } } as any)}
                >
                  <View style={styles.catalogImageWrap}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.catalogImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.catalogImageEmoji}>🍺</Text>
                    )}
                    <View style={styles.catalogBadge}>
                      <Text style={styles.catalogBadgeText}>Valide</Text>
                    </View>
                  </View>
                  <Text style={styles.catalogTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.catalogSubtitle} numberOfLines={1}>{item.Manufacturer?.name || "Brasserie"}</Text>
                  {item.description ? <Text style={styles.catalogDescription} numberOfLines={3}>{item.description}</Text> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
          {!pendingOnly && filteredManagedProducts.length === 0 ? <Text style={styles.empty}>Aucun produit valide a gerer.</Text> : null}
        </View>
      ) : null}

      {!loading && tab === "events" ? (
        <View>
          {!pendingOnly ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Publication d'evenement admin</Text>
              <Button label="Ouvrir le formulaire" onPress={() => router.push("/(user)/admin-event-create" as any)} style={styles.fullButton} />
            </View>
          ) : null}

          {filteredPendingEvents.map((item) => (
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
          {pendingOnly && filteredPendingEvents.length === 0 ? <Text style={styles.empty}>Aucun evenement en attente.</Text> : null}

          {!pendingOnly ? <Text style={styles.sectionTitle}>Evenements valides a gerer</Text> : null}
          {!pendingOnly ? filteredManagedEvents.map((item) => {
            return (
              <View key={item.id} style={styles.card}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.badge}>{contentStatusLabel(item.status, item.isCancelled)}</Text></View>
                <Text style={styles.meta}>{item.Manufacturer?.name || "Brasserie"}</Text>
                <Text style={styles.meta}>Debut: {formatDateTime(item.startAt)}</Text>
                <Text style={styles.meta}>Fin: {formatDateTime(item.endAt)}</Text>
                <Text style={styles.meta}>Adresse: {item.address || "A confirmer"}</Text>
                {item.isCancelled ? <Text style={styles.reject}>Evenement annule{item.cancellationReason ? ` · Motif: ${item.cancellationReason}` : ""}</Text> : null}

                <View style={styles.actionsRow}>
                  <Button label="Modifier" onPress={() => router.push({ pathname: "/(user)/admin-event-edit/[id]", params: { id: String(item.id) } } as any)} disabled={busyKey != null} />
                  <Button label={busyKey === `event-${item.id}-delete` ? "..." : "Supprimer"} variant="secondary" onPress={() => onDeleteEvent(item)} disabled={busyKey != null} />
                </View>

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
          }) : null}
          {!pendingOnly && filteredManagedEvents.length === 0 ? <Text style={styles.empty}>Aucun evenement valide a gerer.</Text> : null}
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
  segmentWrap: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.lg, flexWrap: "nowrap" },
  segment: { flex: 1, minWidth: 0, borderRadius: 14, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: "center" },
  segmentInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  segmentText: { color: colors.text, fontWeight: "900", fontSize: 12, textAlign: "center" },
  segmentTextActive: { color: "#2E1A0F" },
  pendingBadge: { minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 999, backgroundColor: "#D92D20", alignItems: "center", justifyContent: "center" },
  pendingBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  filtersCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.md, marginBottom: spacing.lg },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16 },
  search: { flex: 1, color: colors.text, paddingVertical: 2 },
  pendingFilterButton: { marginTop: spacing.sm, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg2, paddingVertical: spacing.md, alignItems: "center" },
  pendingFilterButtonActive: { backgroundColor: "#FDEAEA", borderColor: "#D92D20" },
  pendingFilterText: { color: colors.text, fontWeight: "900" },
  pendingFilterTextActive: { color: "#D92D20" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.lg },
  sectionTitle: { color: colors.text, fontWeight: "900", fontSize: 18, marginBottom: spacing.sm, marginTop: spacing.lg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: spacing.lg, marginBottom: spacing.md },
  catalogGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  catalogCard: { width: "48%", borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.md },
  catalogImageWrap: { height: 140, borderRadius: 14, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm, overflow: "hidden" },
  catalogImage: { width: "100%", height: "100%" },
  catalogImageEmoji: { fontSize: 34, color: colors.muted },
  catalogBadge: { position: "absolute", left: spacing.sm, bottom: spacing.sm, backgroundColor: colors.badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  catalogBadgeText: { color: colors.badgeText, fontWeight: "900", fontSize: 12 },
  catalogTitle: { fontSize: 15, fontWeight: "900", color: colors.text, marginTop: 2 },
  catalogSubtitle: { marginTop: 4, color: colors.muted, fontSize: 12 },
  catalogDescription: { marginTop: 6, color: colors.text, fontSize: 12, lineHeight: 18 },
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
  empty: { color: colors.muted, textAlign: "center", marginTop: spacing.sm },
});
