import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, categories } = useData();

  const item = items.find((i) => i.id === id);
  const category = item ? categories.find((c) => c.id === item.categoryId) : null;

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "" }} />
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
          <Text style={[styles.notFoundText, { color: colors.foreground }]}>
            항목을 찾을 수 없습니다
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: category?.title ?? "",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryForeground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) + 20 },
        ]}
      >
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: category.color + "15" }]}>
              <Feather name={category.icon as any} size={14} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.title}
              </Text>
            </View>
          )}

          <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>

          <View style={[styles.dateLine, { borderTopColor: colors.border }]}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <Text style={[styles.bodyText, { color: colors.foreground }]}>{item.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 16,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
    marginBottom: 12,
  },
  dateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  bodyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
});
