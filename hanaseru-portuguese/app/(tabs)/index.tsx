import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../lib/AppContext";
import { useTheme } from "../../lib/ThemeContext";
import { LEVELS, POS_FILTERS, LevelKey } from "../../lib/types";
import WordCard from "../../components/WordCard";

export default function WordListScreen() {
  const { words, settings, setTranslationDirection, toggleFavorite, isFavorite, isLoading } =
    useApp();
  const { colors } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>("all");
  const [search, setSearch] = useState("");
  const [selectedPos, setSelectedPos] = useState("すべて");
  const [showPosFilter, setShowPosFilter] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const filteredWords = useMemo(() => {
    let result = words;
    if (selectedLevel !== "all") {
      result = result.filter((w) => w.level === selectedLevel);
    }
    if (selectedPos !== "すべて") {
      result = result.filter((w) => w.pos === selectedPos);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.includes(q) ||
          w.pronunciation.toLowerCase().includes(q) ||
          w.english?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [words, selectedLevel, selectedPos, search]);

  const toggleDirection = useCallback(() => {
    setTranslationDirection(
      settings.translationDirection === "pt-ja" ? "ja-pt" : "pt-ja"
    );
  }, [settings.translationDirection, setTranslationDirection]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof words)[0] }) => (
      <WordCard
        word={item}
        direction={settings.translationDirection}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [settings.translationDirection, isFavorite, toggleFavorite]
  );

  const keyExtractor = useCallback(
    (item: (typeof words)[0]) => String(item.id),
    []
  );

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Kata Belajar</Text>
            <Text style={styles.heroSubtitle}>
              ポルトガル語単語帳 — {words.length.toLocaleString()}語収録
            </Text>
          </View>
        </View>

        {/* Level Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.levelTabs,
            { paddingHorizontal: 16 },
          ]}
        >
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.key}
              onPress={() => setSelectedLevel(level.key as LevelKey)}
              style={[
                styles.levelTab,
                {
                  backgroundColor:
                    selectedLevel === level.key
                      ? colors.primary
                      : colors.surface,
                  borderColor:
                    selectedLevel === level.key
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelTabText,
                  {
                    color:
                      selectedLevel === level.key ? "#FFF" : colors.text,
                  },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search & Direction Toggle */}
        <View style={[styles.searchRow, { paddingHorizontal: 16 }]}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="単語を検索..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={toggleDirection}
            style={[
              styles.directionBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="swap-horizontal"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.directionText, { color: colors.text }]}>
              {settings.translationDirection === "pt-ja" ? "PT→JA" : "JA→PT"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* POS Filter */}
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <TouchableOpacity
            onPress={() => setShowPosFilter(!showPosFilter)}
            style={[
              styles.posFilterBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="filter" size={14} color={colors.textSecondary} />
            <Text
              style={[styles.posFilterLabel, { color: colors.textSecondary }]}
            >
              品詞: {selectedPos}
            </Text>
          </TouchableOpacity>
          {showPosFilter && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.posScroll}
            >
              {POS_FILTERS.map((pos) => (
                <TouchableOpacity
                  key={pos}
                  onPress={() => {
                    setSelectedPos(pos);
                    setShowPosFilter(false);
                  }}
                  style={[
                    styles.posChip,
                    {
                      backgroundColor:
                        selectedPos === pos
                          ? colors.primary
                          : colors.surface,
                      borderColor:
                        selectedPos === pos
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        selectedPos === pos ? "#FFF" : colors.text,
                      fontWeight: selectedPos === pos ? "600" : "400",
                    }}
                  >
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Word Count */}
        <View style={[styles.countRow, { paddingHorizontal: 16 }]}>
          <Ionicons name="library-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {filteredWords.length.toLocaleString()}語
          </Text>
        </View>
      </View>
    ),
    [
      words.length,
      selectedLevel,
      search,
      selectedPos,
      showPosFilter,
      filteredWords.length,
      settings.translationDirection,
      colors,
    ]
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            単語データを読み込み中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        ref={flatListRef}
        data={filteredWords}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              該当する単語が見つかりません
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  heroBanner: {
    height: 140,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroContent: {
    padding: 16,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  levelTabs: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
  },
  levelTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 40,
  },
  directionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
  },
  directionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  posFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  posFilterLabel: {
    fontSize: 12,
  },
  posScroll: {
    marginTop: 8,
  },
  posChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
    marginTop: 4,
  },
  countText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
