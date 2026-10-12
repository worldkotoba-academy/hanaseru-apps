import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../lib/AppContext";
import { useTheme } from "../../lib/ThemeContext";
import WordCard from "../../components/WordCard";

export default function FavoritesScreen() {
  const { getFavoriteWords, settings, toggleFavorite, isFavorite } = useApp();
  const { colors } = useTheme();

  const favoriteWords = useMemo(() => getFavoriteWords(), [getFavoriteWords]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof favoriteWords)[0] }) => (
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
    (item: (typeof favoriteWords)[0]) => String(item.id),
    []
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          お気に入り
        </Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
          {favoriteWords.length}語
        </Text>
      </View>

      <FlatList
        data={favoriteWords}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              お気に入りがありません
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              単語カードの★マークをタップして{"\n"}お気に入りに追加しましょう
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  headerCount: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
