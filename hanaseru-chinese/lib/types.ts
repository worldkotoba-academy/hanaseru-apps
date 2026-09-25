export interface Word {
  id: number;
  word: string;          // 中国語単語
  pronunciation: string; // カタカナ発音
  pos: string;           // 品詞
  meaning: string;       // 日本語の意味
  example_native: string;    // 中国語例文
  example_ja: string;    // 日本語訳例文
  english: string;       // 英語訳
  level: "beginner" | "intermediate" | "advanced";
  original_no?: number;
  isCustom?: boolean;
}

export type TranslationDirection = "zh-ja" | "ja-zh";

export interface Settings {
  translationDirection: TranslationDirection;
  speechRate: number;
  theme: "light" | "dark" | "system";
}

export const DEFAULT_SETTINGS: Settings = {
  translationDirection: "zh-ja",
  speechRate: 1.0,
  theme: "system",
};

export const LEVELS = [
  { key: "all", label: "すべて" },
  { key: "beginner", label: "初級" },
  { key: "intermediate", label: "中級" },
  { key: "advanced", label: "上級" },
] as const;

export const POS_FILTERS = [
  "すべて", "名詞", "動詞", "形容詞", "副詞", "代名詞",
  "接続詞", "前置詞", "数詞", "助動詞", "間投詞", "挨拶", "その他",
] as const;

export type LevelKey = "all" | "beginner" | "intermediate" | "advanced";
