import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useApp } from "../../lib/AppContext";
import { useTheme } from "../../lib/ThemeContext";
import { speakTarget } from "../../lib/tts";

const SPEED_PRESETS = [
  { label: "ゆっくり", value: 0.5 },
  { label: "やや遅め", value: 0.75 },
  { label: "普通", value: 1.0 },
  { label: "やや速め", value: 1.25 },
  { label: "速い", value: 1.5 },
];

export default function SettingsScreen() {
  const {
    settings,
    setSpeechRate,
    setTheme,
    setTranslationDirection,
    resetData,
    words,
    favorites,
  } = useApp();
  const { colors, isDark } = useTheme();

  const handleTestVoice = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await speakTarget("Ciao, come stai?", settings.speechRate);
    } catch {}
  }, [settings.speechRate]);

  const handleReset = useCallback(() => {
    Alert.alert(
      "データリセット",
      "お気に入り、カスタム単語、設定をすべてリセットしますか？",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: async () => {
            await resetData();
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            Alert.alert("完了", "データをリセットしました。");
          },
        },
      ]
    );
  }, [resetData]);

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>設定</Text>

        {/* Theme */}
        {renderSection(
          "テーマ",
          <View style={styles.themeRow}>
            {(
              [
                { key: "light" as const, label: "ライト", icon: "sunny-outline" },
                { key: "dark" as const, label: "ダーク", icon: "moon-outline" },
                { key: "system" as const, label: "自動", icon: "phone-portrait-outline" },
              ] as const
            ).map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTheme(t.key)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor:
                      settings.theme === t.key
                        ? colors.primaryLight
                        : colors.surface,
                    borderColor:
                      settings.theme === t.key
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={t.icon as any}
                  size={22}
                  color={
                    settings.theme === t.key
                      ? colors.primary
                      : colors.textMuted
                  }
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      settings.theme === t.key
                        ? colors.primary
                        : colors.text,
                    marginTop: 4,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Translation Direction */}
        {renderSection(
          "翻訳方向",
          <View style={styles.directionRow}>
            {(
              [
                { key: "it-ja" as const, label: "イタリア語 → 日本語" },
                { key: "ja-it" as const, label: "日本語 → イタリア語" },
              ] as const
            ).map((d) => (
              <TouchableOpacity
                key={d.key}
                onPress={() => setTranslationDirection(d.key)}
                style={[
                  styles.dirOption,
                  {
                    backgroundColor:
                      settings.translationDirection === d.key
                        ? colors.primaryLight
                        : colors.surface,
                    borderColor:
                      settings.translationDirection === d.key
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color:
                      settings.translationDirection === d.key
                        ? colors.primary
                        : colors.text,
                  }}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Speech Rate */}
        {renderSection(
          "音声速度",
          <View>
            <View style={styles.sliderHeader}>
              <Text style={[styles.sliderValue, { color: colors.primary }]}>
                {settings.speechRate.toFixed(2)}x
              </Text>
            </View>
            <View style={styles.sliderRow}>
              <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                0.5x
              </Text>
              <View style={{ flex: 1 }}>
                <Slider
                  minimumValue={0.5}
                  maximumValue={1.5}
                  step={0.05}
                  value={settings.speechRate}
                  onSlidingComplete={(val: number) =>
                    setSpeechRate(Math.round(val * 100) / 100)
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
              </View>
              <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                1.5x
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetRow}
            >
              {SPEED_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setSpeechRate(p.value)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        Math.abs(settings.speechRate - p.value) < 0.01
                          ? colors.primary
                          : colors.surface,
                      borderColor:
                        Math.abs(settings.speechRate - p.value) < 0.01
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        Math.abs(settings.speechRate - p.value) < 0.01
                          ? "#FFF"
                          : colors.text,
                    }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={handleTestVoice}
              style={[
                styles.testBtn,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
            >
              <Ionicons name="volume-medium" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 13 }}>
                音声テスト再生
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        {renderSection(
          "データ",
          <View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                収録単語数
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {words.length.toLocaleString()}語
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                お気に入り
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {favorites.size}語
              </Text>
            </View>
          </View>
        )}

        {/* Reset */}
        <TouchableOpacity
          onPress={handleReset}
          style={[
            styles.resetBtn,
            { backgroundColor: colors.dangerLight, borderColor: colors.danger },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: "600" }}>
            データをリセット
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Kata Belajar v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            音声: iOS ネイティブTTS
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  sectionCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  themeRow: { flexDirection: "row", gap: 10 },
  themeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  directionRow: { gap: 8 },
  dirOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  sliderHeader: { alignItems: "center", marginBottom: 4 },
  sliderValue: { fontSize: 20, fontWeight: "800" },
  sliderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sliderLabel: { fontSize: 11 },
  presetRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: "600" },
  statDivider: { height: 1 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  footer: { alignItems: "center", marginTop: 24, gap: 4 },
  footerText: { fontSize: 12 },
});
