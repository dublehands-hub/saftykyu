import { Feather } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings } = useData();

  const [phone, setPhone] = useState(settings.emergencyPhone);
  const [isAdmin, setIsAdmin] = useState(settings.isAdmin);

  const handleSave = async () => {
    await updateSettings({ emergencyPhone: phone.trim(), isAdmin });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("저장 완료", "설정이 저장되었습니다.", [
      { text: "확인", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: "설정",
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: colors.destructive + "15" }]}>
              <Feather name="phone" size={20} color={colors.destructive} />
            </View>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                긴급 연락처
              </Text>
              <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                긴급 버튼 클릭 시 전화할 번호
              </Text>
            </View>
          </View>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.input }]}
            placeholder="예: 010-1234-5678"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.adminRow}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}>
                <Feather name="shield" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  관리자 모드
                </Text>
                <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
                  항목 추가/수정/삭제 활성화
                </Text>
              </View>
            </View>
            <Switch
              value={isAdmin}
              onValueChange={setIsAdmin}
              trackColor={{ false: colors.muted, true: colors.primary + "60" }}
              thumbColor={isAdmin ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Feather name="check" size={20} color={colors.primaryForeground} />
          <Text style={[styles.saveText, { color: colors.primaryForeground }]}>설정 저장</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  sectionDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  adminRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  saveText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
