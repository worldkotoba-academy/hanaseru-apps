import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Word, TranslationDirection } from "../lib/types";
import { speakTarget } from "../lib/tts";
import { useTheme } from "../lib/ThemeContext";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  word: Word;
  direction: TranslationDirection;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export default function WordCard({
  word,
  direction,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await speakTarget(word.word);
    } catch {}
    setIsSpeaking(false);
  }, [word.word, isSpeaking]);

  const handleSpeakExample = useCallback(async () => {
    if (!word.example_native) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await speakTarget(word.example_native);
    } catch {}
  }, [word.example_native]);

  const handleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite(word.id);
  }, [word.id, onToggleFavorite]);

  const levelColor =
    word.level === "beginner"
      ? { bg: colors.badgeBeginner, text: colors.badgeBeginnerText }
      : word.level === "intermediate"
      ? { bg: colors.badgeIntermediate, text: colors.badgeIntermediateText }
      : { bg: colors.badgeAdvanced, text: colors.badgeAdvancedText };

  const levelLabel =
    word.level === "beginner"
      ? "初級"
      : word.level === "intermediate"
      ? "中級"
      : "上級";

  const primary = direction === "de-ja" ? word.word : word.meaning;
  const secondary = direction === "de-ja" ? word.meaning : word.word;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handleToggleExpand}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: levelColor.bg }]}>
            <Text style={[styles.badgeText, { color: levelColor.text }]}>
              {levelLabel}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.primaryLight },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {word.pos}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleFavorite} style={styles.iconBtn}>
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={22}
              color={isFavorite ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSpeak} style={styles.iconBtn}>
            <Ionicons
              name={isSpeaking ? "volume-high" : "volume-medium-outline"}
              size={22}
              color={isSpeaking ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textMuted}
          />
        </View>
      </View>

      <Text style={[styles.primaryText, { color: colors.text }]}>
        {primary}
      </Text>
      {direction === "de-ja" && word.pronunciation ? (
        <Text style={[styles.pronunciation, { color: colors.textSecondary }]}>
          [{word.pronunciation}]
        </Text>
      ) : null}
      <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>
        {secondary}
      </Text>

      {expanded && (
        <View
          style={[styles.expandedArea, { borderTopColor: colors.border }]}
        >
          {word.example_native ? (
            <View style={styles.exampleBlock}>
              <View style={styles.exampleHeader}>
                <Text
                  style={[styles.exampleLabel, { color: colors.primary }]}
                >
                  例文
                </Text>
                <TouchableOpacity onPress={handleSpeakExample}>
                  <Ionicons
                    name="volume-medium-outline"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.exampleText, { color: colors.text }]}>
                {word.example_native}
              </Text>
              <Text
                style={[
                  styles.exampleTranslation,
                  { color: colors.textSecondary },
                ]}
              >
                {word.example_ja}
              </Text>
              {word.english ? (
                <Text
                  style={[
                    styles.exampleEnglish,
                    { color: colors.textMuted },
                  ]}
                >
                  {word.english}
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.noExample, { color: colors.textMuted }]}>
              例文はありません
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  primaryText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  pronunciation: {
    fontSize: 13,
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 15,
  },
  expandedArea: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  exampleBlock: {
    gap: 4,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exampleTranslation: {
    fontSize: 13,
    lineHeight: 18,
  },
  exampleEnglish: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  noExample: {
    fontSize: 13,
    fontStyle: "italic",
  },
});
