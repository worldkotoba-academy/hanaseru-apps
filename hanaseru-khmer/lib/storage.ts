import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings, DEFAULT_SETTINGS, Word } from "./types";

const KEYS = {
  FAVORITES: "kata_favorites",
  SETTINGS: "kata_settings",
  CUSTOM_WORDS: "kata_custom_words",
};

// Favorites
export async function getFavorites(): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    if (raw) {
      return new Set(JSON.parse(raw) as number[]);
    }
  } catch {}
  return new Set();
}

export async function saveFavorites(favs: Set<number>): Promise<void> {
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify([...favs]));
}

// Settings
export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Custom Words
export async function getCustomWords(): Promise<Word[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CUSTOM_WORDS);
    if (raw) {
      return JSON.parse(raw) as Word[];
    }
  } catch {}
  return [];
}

export async function saveCustomWords(words: Word[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CUSTOM_WORDS, JSON.stringify(words));
}

// Reset all data
export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.FAVORITES,
    KEYS.SETTINGS,
    KEYS.CUSTOM_WORDS,
  ]);
}
