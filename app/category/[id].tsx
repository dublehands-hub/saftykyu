import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getItemsByCategory, deleteItem, settings, categories } = useData();

  const category = categories.find((c) => c.id === id);
  const items = id ? getItemsByCategory(id) : [];

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, textAlign: "center", marginTop: 100 }}>
          카테고리를 찾을 수 없습니다
        </Text>
      </View>
    );
  }

  const handleDelete = (itemId: string) => {
    Alert.alert("삭제 확인", "이 항목을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          deleteItem(itemId);
        },
      },
    ]);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const fabBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16) + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: category.title,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryForeground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        }}
      />

      {settings.isAdmin && (
        <View style={[styles.adminBar, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={13} color={colors.accentForeground} />
          <Text style={[styles.adminBarText, { color: colors.accentForeground }]}>
            관리자 모드 — 항목을 추가·수정·삭제할 수 있습니다
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        scrollEnabled={!!items.length}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: settings.isAdmin
              ? fabBottom + 80
              : insets.bottom + (Platform.OS === "web" ? 34 : 16) + 16,
          },
          items.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: category.color + "15" }]}>
              <Feather name={category.icon as any} size={40} color={category.color} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              등록된 항목이 없습니다
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              {settings.isAdmin
                ? "아래의 + 버튼을 눌러 첫 항목을 추가하세요"
                : "관리자가 항목을 추가하면 여기에 표시됩니다"}
            </Text>
            {settings.isAdmin && (
              <Pressable
                onPress={() => router.push(`/add-item?categoryId=${id}`)}
                style={({ pressed }) => [
                  styles.emptyAddBtn,
                  { backgroundColor: category.color, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.emptyAddBtnText}>항목 추가하기</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.itemCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Pressable
              onPress={() => router.push(`/item/${item.id}`)}
              style={({ pressed }) => [
                styles.itemCardInner,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
              ) : null}
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.itemPreview, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.content}
                </Text>
                <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ alignSelf: "center", marginRight: 4 }} />
            </Pressable>

            {settings.isAdmin && (
              <View style={[styles.adminActions, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={() => router.push(`/edit-item/${item.id}`)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: colors.primary + "12", opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="edit-2" size={15} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>수정</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(item.id)}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: colors.destructive + "12", opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="trash-2" size={15} color={colors.destructive} />
                  <Text style={[styles.actionBtnText, { color: colors.destructive }]}>삭제</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />

      {settings.isAdmin && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/add-item?categoryId=${id}`);
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: category.color,
              bottom: fabBottom,
              transform: [{ scale: pressed ? 0.93 : 1 }],
            },
          ]}
        >
          <Feather name="plus" size={26} color="#fff" />
          <Text style={styles.fabText}>항목 추가</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  adminBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 7,
  },
  adminBarText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", paddingVertical: 50, gap: 10 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyAddBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemCardInner: {
    flexDirection: "row",
  },
  itemImage: { width: 80, height: 90 },
  itemContent: { flex: 1, padding: 14, gap: 4 },
  itemTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  itemPreview: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  itemDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
  adminActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 10,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 50,
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
