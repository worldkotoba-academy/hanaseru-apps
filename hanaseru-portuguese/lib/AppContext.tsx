import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  Word,
  Settings,
  DEFAULT_SETTINGS,
  TranslationDirection,
} from "./types";
import {
  getFavorites,
  saveFavorites,
  getSettings,
  saveSettings,
  getCustomWords,
  saveCustomWords,
  resetAllData,
} from "./storage";
import { setRate } from "./tts";
import wordsData from "../data/words.json";

interface AppContextType {
  words: Word[];
  settings: Settings;
  favorites: Set<number>;
  isLoading: boolean;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  getFavoriteWords: () => Word[];
  setTranslationDirection: (dir: TranslationDirection) => void;
  setSpeechRate: (rate: number) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  addCustomWord: (word: Omit<Word, "id" | "isCustom">) => void;
  editCustomWord: (id: number, word: Partial<Word>) => void;
  deleteCustomWord: (id: number) => void;
  resetData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [builtInWords] = useState<Word[]>(() => wordsData as Word[]);
  const [customWords, setCustomWords] = useState<Word[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const [favs, savedSettings, custom] = await Promise.all([
        getFavorites(),
        getSettings(),
        getCustomWords(),
      ]);
      setFavorites(favs);
      setSettings(savedSettings);
      setCustomWords(custom);
      setRate(savedSettings.speechRate);
      setIsLoading(false);
    })();
  }, []);

  const words = useMemo(
    () => [...builtInWords, ...customWords],
    [builtInWords, customWords]
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        saveFavorites(next);
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (id: number) => favorites.has(id),
    [favorites]
  );

  const getFavoriteWords = useCallback(
    () => words.filter((w) => favorites.has(w.id)),
    [words, favorites]
  );

  const setTranslationDirection = useCallback(
    (dir: TranslationDirection) => {
      setSettings((prev) => {
        const next = { ...prev, translationDirection: dir };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const setSpeechRate = useCallback((rate: number) => {
    setRate(rate);
    setSettings((prev) => {
      const next = { ...prev, speechRate: rate };
      saveSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback(
    (theme: "light" | "dark" | "system") => {
      setSettings((prev) => {
        const next = { ...prev, theme };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  const addCustomWord = useCallback(
    (word: Omit<Word, "id" | "isCustom">) => {
      setCustomWords((prev) => {
        const maxId = Math.max(
          ...builtInWords.map((w) => w.id),
          ...prev.map((w) => w.id),
          0
        );
        const newWord: Word = {
          ...word,
          id: maxId + 1,
          isCustom: true,
        };
        const next = [...prev, newWord];
        saveCustomWords(next);
        return next;
      });
    },
    [builtInWords]
  );

  const editCustomWord = useCallback(
    (id: number, updates: Partial<Word>) => {
      setCustomWords((prev) => {
        const next = prev.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        );
        saveCustomWords(next);
        return next;
      });
    },
    []
  );

  const deleteCustomWord = useCallback((id: number) => {
    setCustomWords((prev) => {
      const next = prev.filter((w) => w.id !== id);
      saveCustomWords(next);
      return next;
    });
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const resetData = useCallback(async () => {
    await resetAllData();
    setFavorites(new Set());
    setCustomWords([]);
    setSettings(DEFAULT_SETTINGS);
    setRate(DEFAULT_SETTINGS.speechRate);
  }, []);

  const value = useMemo(
    () => ({
      words,
      settings,
      favorites,
      isLoading,
      toggleFavorite,
      isFavorite,
      getFavoriteWords,
      setTranslationDirection,
      setSpeechRate,
      setTheme,
      addCustomWord,
      editCustomWord,
      deleteCustomWord,
      resetData,
    }),
    [
      words,
      settings,
      favorites,
      isLoading,
      toggleFavorite,
      isFavorite,
      getFavoriteWords,
      setTranslationDirection,
      setSpeechRate,
      setTheme,
      addCustomWord,
      editCustomWord,
      deleteCustomWord,
      resetData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
