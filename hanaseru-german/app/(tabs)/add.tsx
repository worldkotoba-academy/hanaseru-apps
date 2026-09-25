import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useApp } from "../../lib/AppContext";
import { useTheme } from "../../lib/ThemeContext";

const POS_OPTIONS = [
  "名詞", "動詞", "形容詞", "副詞", "代名詞",
  "接続詞", "前置詞", "数詞", "助動詞", "間投詞", "挨拶", "その他",
];

const LEVEL_OPTIONS = [
  { key: "beginner" as const, label: "初級" },
  { key: "intermediate" as const, label: "中級" },
  { key: "advanced" as const, label: "上級" },
];

export default function AddWordScreen() {
  const { addCustomWord } = useApp();
  const { colors } = useTheme();

  const [wordText, setWordText] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pos, setPos] = useState("名詞");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner"
  );
  const [exampleId, setExampleId] = useState("");
  const [exampleJa, setExampleJa] = useState("");
  const [english, setEnglish] = useState("");

  const handleSubmit = useCallback(() => {
    if (!wordText.trim() || !meaning.trim()) {
      Alert.alert("入力エラー", "ドイツ語と日本語の意味は必須です。");
      return;
    }

    addCustomWord({
      word: wordText.trim(),
      pronunciation: pronunciation.trim(),
      meaning: meaning.trim(),
      pos,
      level,
      example_native: exampleId.trim(),
      example_ja: exampleJa.trim(),
      english: english.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("登録完了", `「${wordText.trim()}」を追加しました。`);

    // Reset form
    setWordText("");
    setPronunciation("");
    setMeaning("");
    setPos("名詞");
    setLevel("beginner");
    setExampleId("");
    setExampleJa("");
    setEnglish("");
  }, [
    wordText,
    pronunciation,
    meaning,
    pos,
    level,
    exampleId,
    exampleJa,
    english,
    addCustomWord,
  ]);

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    required = false,
    multiline = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.danger }}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        autoCorrect={false}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: colors.text }]}>
            単語を追加
          </Text>

          {renderInput(
            "ドイツ語",
            wordText,
            setWordText,
            "例: selamat pagi",
            true
          )}
          {renderInput(
            "カタカナ発音",
            pronunciation,
            setPronunciation,
            "例: スラマッ パギ"
          )}
          {renderInput(
            "日本語の意味",
            meaning,
            setMeaning,
            "例: おはようございます",
            true
          )}

          {/* POS Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              品詞
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {POS_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPos(p)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        pos === p ? colors.primary : colors.surface,
                      borderColor:
                        pos === p ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: pos === p ? "600" : "400",
                      color: pos === p ? "#FFF" : colors.text,
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Level Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              レベル
            </Text>
            <View style={styles.levelRow}>
              {LEVEL_OPTIONS.map((l) => (
                <TouchableOpacity
                  key={l.key}
                  onPress={() => setLevel(l.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        level === l.key ? colors.primary : colors.surface,
                      borderColor:
                        level === l.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: level === l.key ? "600" : "400",
                      color: level === l.key ? "#FFF" : colors.text,
                    }}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Example Sentences */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, marginTop: 16 },
            ]}
          >
            例文（任意）
          </Text>
          {renderInput(
            "ドイツ語例文",
            exampleId,
            setExampleId,
            "例: Hallo, wie geht es dir?",
            false,
            true
          )}
          {renderInput(
            "日本語訳",
            exampleJa,
            setExampleJa,
            "例: おはようございます、お元気ですか？",
            false,
            true
          )}
          {renderInput(
            "英語訳",
            english,
            setEnglish,
            "例: Good morning, how are you?",
            false,
            true
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.submitBtnText}>単語を登録</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", gap: 8 },
  levelRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
