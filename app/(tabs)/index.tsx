import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useData, type Category } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

const ADMIN_PIN = "1234";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, categories, updateCategory, getItemsByCategory } = useData();

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleEmergencyCall = () => {
    if (!settings.emergencyPhone) {
      Alert.alert("알림", "긴급 연락처가 설정되지 않았습니다.\n관리자 설정에서 등록해주세요.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (Platform.OS === "web") {
      window.open(`tel:${settings.emergencyPhone}`);
    } else {
      Linking.openURL(`tel:${settings.emergencyPhone}`);
    }
  };

  const handleAdminToggle = () => {
    if (settings.isAdmin) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateSettings({ isAdmin: false });
    } else {
      setPin("");
      setPinError(false);
      setPinModalVisible(true);
    }
  };

  const handlePinSubmit = () => {
    if (pin === ADMIN_PIN) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateSettings({ isAdmin: true });
      setPinModalVisible(false);
      setPin("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinError(true);
      setPin("");
    }
  };

  const openEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setEditTitle(cat.title);
    setEditDesc(cat.description);
    setEditModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCat) return;
    if (!editTitle.trim()) {
      Alert.alert("알림", "메뉴 이름을 입력해주세요.");
      return;
    }
    await updateCategory(editingCat.id, editTitle.trim(), editDesc.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditModalVisible(false);
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + 16 + webTopInset,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.primaryForeground }]}>
              환경안전 도우미
            </Text>
            <Text style={[styles.headerSubtitle, { color: "rgba(255,255,255,0.7)" }]}>
              Environmental Safety Helper
            </Text>
          </View>
          <View style={styles.headerRight}>
            {settings.isAdmin && (
              <Pressable
                onPress={() => router.push("/settings")}
                style={({ pressed }) => [
                  styles.headerIconBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="settings" size={20} color={colors.primaryForeground} />
              </Pressable>
            )}
            <Pressable
              onPress={handleAdminToggle}
              style={({ pressed }) => [
                styles.adminBtn,
                {
                  backgroundColor: settings.isAdmin
                    ? colors.secondary
                    : "rgba(255,255,255,0.18)",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather
                name={settings.isAdmin ? "unlock" : "lock"}
                size={14}
                color={settings.isAdmin ? colors.accentForeground : "#fff"}
              />
              <Text
                style={[
                  styles.adminBtnText,
                  { color: settings.isAdmin ? colors.accentForeground : "#fff" },
                ]}
              >
                {settings.isAdmin ? "관리자 ON" : "관리자"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {settings.isAdmin && (
        <View style={[styles.adminBanner, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={13} color={colors.accentForeground} />
          <Text style={[styles.adminBannerText, { color: colors.accentForeground }]}>
            관리자 모드 — 카테고리 이름 수정 및 항목 추가·수정·삭제 가능
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={handleEmergencyCall}
          style={({ pressed }) => [
            styles.emergencyButton,
            {
              backgroundColor: colors.destructive,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <View style={styles.emergencyIcon}>
            <Feather name="phone-call" size={28} color="#fff" />
          </View>
          <View style={styles.emergencyText}>
            <Text style={styles.emergencyTitle}>긴급 연락</Text>
            <Text style={styles.emergencySubtitle}>
              {settings.emergencyPhone ? `${settings.emergencyPhone}` : "연락처 미설정"}
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            안전 카테고리
          </Text>
          {settings.isAdmin && (
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>
              이름 수정은 카드의 ✎ 버튼
            </Text>
          )}
        </View>

        <View style={styles.categoryGrid}>
          {categories.map((cat) => {
            const count = getItemsByCategory(cat.id).length;
            return (
              <View
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/category/${cat.id}`);
                  }}
                  style={({ pressed }) => [
                    styles.categoryCardInner,
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: cat.color + "18" }]}>
                    <Feather name={cat.icon as any} size={28} color={cat.color} />
                  </View>
                  <Text style={[styles.categoryTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {cat.title}
                  </Text>
                  <Text style={[styles.categoryDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {cat.description}
                  </Text>
                  <View style={styles.categoryFooter}>
                    <View style={[styles.countBadge, { backgroundColor: cat.color + "15" }]}>
                      <Text style={[styles.countText, { color: cat.color }]}>{count}건</Text>
                    </View>
                  </View>
                </Pressable>

                {settings.isAdmin && (
                  <Pressable
                    onPress={() => openEditCategory(cat)}
                    style={({ pressed }) => [
                      styles.editCatBtn,
                      {
                        backgroundColor: colors.primary,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Feather name="edit-3" size={13} color="#fff" />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="shield" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>관리자 인증</Text>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
              PIN 번호를 입력하세요
            </Text>
            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  borderColor: pinError ? colors.destructive : colors.input,
                  color: colors.foreground,
                },
              ]}
              placeholder="PIN 번호"
              placeholderTextColor={colors.mutedForeground}
              value={pin}
              onChangeText={(t) => { setPin(t); setPinError(false); }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              autoFocus
            />
            {pinError && (
              <Text style={[styles.pinError, { color: colors.destructive }]}>
                PIN 번호가 올바르지 않습니다 (기본: 1234)
              </Text>
            )}
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => { setPinModalVisible(false); setPin(""); }}
                style={[styles.modalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>취소</Text>
              </Pressable>
              <Pressable
                onPress={handlePinSubmit}
                style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalCard, { backgroundColor: colors.card }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.foreground }]}>
                메뉴 이름 수정
              </Text>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {editingCat && (
              <View style={[styles.editCatPreview, { backgroundColor: editingCat.color + "12" }]}>
                <Feather name={editingCat.icon as any} size={20} color={editingCat.color} />
                <Text style={[styles.editCatPreviewText, { color: editingCat.color }]}>
                  {editingCat.id}
                </Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>메뉴 이름</Text>
            <TextInput
              style={[
                styles.editInput,
                { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground },
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="메뉴 이름"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>설명 (선택)</Text>
            <TextInput
              style={[
                styles.editInput,
                styles.editInputMulti,
                { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground },
              ]}
              value={editDesc}
              onChangeText={setEditDesc}
              placeholder="메뉴 설명"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={[styles.modalBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.mutedForeground }]}>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveCategory}
                style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>저장</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  adminBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  adminBannerText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  emergencyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyText: { flex: 1, marginLeft: 14 },
  emergencyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  emergencySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  sectionHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  categoryCardInner: { padding: 16 },
  categoryIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  categoryDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 10 },
  categoryFooter: { flexDirection: "row", alignItems: "center" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  countText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  editCatBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  modalDesc: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  pinInput: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 6,
    marginBottom: 8,
  },
  pinError: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  modalButtons: { flexDirection: "row", gap: 12, width: "100%", marginTop: 12 },
  modalBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnPrimary: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  modalBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  editModalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editModalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  editCatPreview: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  editCatPreviewText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  editInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  editInputMulti: { height: 80 },
});
