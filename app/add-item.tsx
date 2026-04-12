import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AddItemScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { addItem, categories } = useData();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const category = categories.find((c) => c.id === categoryId);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }
    if (!categoryId) return;

    setSaving(true);
    try {
      await addItem({ categoryId, title: title.trim(), content: content.trim(), imageUri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "새 항목 추가",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryForeground,
          headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => ({ opacity: pressed || saving ? 0.5 : 1 })}
            >
              <Text style={{ color: colors.secondary, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>
                {saving ? "저장중..." : "저장"}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {category && (
          <View style={[styles.categoryBadge, { backgroundColor: category.color + "15" }]}>
            <Feather name={category.icon as any} size={16} color={category.color} />
            <Text style={[styles.categoryText, { color: category.color }]}>
              {category.title}
            </Text>
          </View>
        )}

        <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>제목</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.input }]}
            placeholder="안전 항목 제목을 입력하세요"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>내용</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: colors.foreground, borderColor: colors.input },
            ]}
            placeholder="안전 관련 내용을 자세히 작성하세요"
            placeholderTextColor={colors.mutedForeground}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.foreground }]}>이미지 (선택)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <Pressable
                onPress={() => setImageUri(undefined)}
                style={[styles.removeImageBtn, { backgroundColor: colors.destructive }]}
              >
                <Feather name="x" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickImage}
              style={[styles.imagePicker, { borderColor: colors.input }]}
            >
              <Feather name="image" size={32} color={colors.mutedForeground} />
              <Text style={[styles.imagePickerText, { color: colors.mutedForeground }]}>
                탭하여 이미지 선택
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  inputGroup: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textArea: {
    minHeight: 150,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  imagePreviewContainer: {
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
