import React, { useState, useMemo, useCallback } from "react";
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
import * as Haptics from "expo-haptics";
import { useApp } from "../../lib/AppContext";
import { useTheme } from "../../lib/ThemeContext";
import { speakTarget } from "../../lib/tts";
import { targetFont } from "../../lib/fonts";
import { Word, LevelKey, TranslationDirection } from "../../lib/types";

type QuizMode = "flashcard" | "multiple";
type QuizState = "setup" | "playing" | "result";

interface QuizQuestion {
  word: Word;
  choices?: string[];
  correctIndex?: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizScreen() {
  const { words, settings } = useApp();
  const { colors } = useTheme();

  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [mode, setMode] = useState<QuizMode>("flashcard");
  const [level, setLevel] = useState<LevelKey>("beginner");
  const [direction, setDirection] = useState<TranslationDirection>("zh-ja");
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);

  const levelWords = useMemo(() => {
    if (level === "all") return words;
    return words.filter((w) => w.level === level);
  }, [words, level]);

  const startQuiz = useCallback(() => {
    if (levelWords.length < 4) {
      Alert.alert("単語不足", "クイズには最低4語必要です。");
      return;
    }
    const shuffled = shuffleArray(levelWords);
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

    const qs: QuizQuestion[] = selected.map((word) => {
      if (mode === "multiple") {
        const others = shuffleArray(
          levelWords.filter((w) => w.id !== word.id)
        ).slice(0, 3);
        const answerText =
          direction === "zh-ja" ? word.meaning : word.word;
        const choiceTexts = others.map((o) =>
          direction === "zh-ja" ? o.meaning : o.word
        );
        const allChoices = shuffleArray([answerText, ...choiceTexts]);
        return {
          word,
          choices: allChoices,
          correctIndex: allChoices.indexOf(answerText),
        };
      }
      return { word };
    });

    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setShowAnswer(false);
    setAnswered(null);
    setQuizState("playing");
  }, [levelWords, numQuestions, mode, direction]);

  const handleFlashcardAnswer = useCallback(
    (knew: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (knew) setScore((s) => s + 1);
      if (currentIndex + 1 >= questions.length) {
        setQuizState("result");
      } else {
        setCurrentIndex((i) => i + 1);
        setShowAnswer(false);
      }
    },
    [currentIndex, questions.length]
  );

  const handleMultipleChoice = useCallback(
    (choiceIndex: number) => {
      if (answered !== null) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAnswered(choiceIndex);
      const q = questions[currentIndex];
      if (choiceIndex === q.correctIndex) {
        setScore((s) => s + 1);
      }
      setTimeout(() => {
        if (currentIndex + 1 >= questions.length) {
          setQuizState("result");
        } else {
          setCurrentIndex((i) => i + 1);
          setAnswered(null);
        }
      }, 1200);
    },
    [answered, currentIndex, questions]
  );

  const handleQuit = useCallback(() => {
    Alert.alert("学習を終了", "学習を終了しますか？", [
      { text: "続ける", style: "cancel" },
      {
        text: "終了",
        style: "destructive",
        onPress: () => {
          setQuizState("setup");
          setShowAnswer(false);
          setAnswered(null);
        },
      },
    ]);
  }, []);

  // ===== SETUP SCREEN =====
  if (quizState === "setup") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.setupContent}>
          <Text style={[styles.setupTitle, { color: colors.text }]}>
            学習モード
          </Text>

          {/* Mode Selection */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            モード
          </Text>
          <View style={styles.optionRow}>
            {(
              [
                { key: "flashcard", label: "フラッシュカード", icon: "albums-outline" },
                { key: "multiple", label: "4択クイズ", icon: "list-outline" },
              ] as const
            ).map((m) => (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor:
                      mode === m.key ? colors.primaryLight : colors.surface,
                    borderColor:
                      mode === m.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={m.icon as any}
                  size={24}
                  color={mode === m.key ? colors.primary : colors.textMuted}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: mode === m.key ? colors.primary : colors.text,
                    marginTop: 4,
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Level Selection */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            レベル
          </Text>
          <View style={styles.chipRow}>
            {(
              [
                { key: "all", label: "すべて" },
                { key: "beginner", label: "初級" },
                { key: "intermediate", label: "中級" },
                { key: "advanced", label: "上級" },
              ] as const
            ).map((l) => (
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
                    fontWeight: "600",
                    color: level === l.key ? "#FFF" : colors.text,
                  }}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Direction */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            出題方向
          </Text>
          <View style={styles.chipRow}>
            {(
              [
                { key: "zh-ja", label: "中国語→日本語" },
                { key: "ja-zh", label: "日本語→中国語" },
              ] as const
            ).map((d) => (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDirection(d.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      direction === d.key ? colors.primary : colors.surface,
                    borderColor:
                      direction === d.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: direction === d.key ? "#FFF" : colors.text,
                  }}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Number of Questions */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            問題数
          </Text>
          <View style={styles.chipRow}>
            {[10, 20, 30, 50].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setNumQuestions(n)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      numQuestions === n ? colors.primary : colors.surface,
                    borderColor:
                      numQuestions === n ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: numQuestions === n ? "#FFF" : colors.text,
                  }}
                >
                  {n}問
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={startQuiz}
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={20} color="#FFF" />
            <Text style={styles.startBtnText}>学習を開始する</Text>
          </TouchableOpacity>

          <Text style={[styles.wordCountNote, { color: colors.textMuted }]}>
            対象: {levelWords.length.toLocaleString()}語
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== PLAYING SCREEN =====
  if (quizState === "playing" && questions.length > 0) {
    const q = questions[currentIndex];
    const questionText =
      direction === "zh-ja" ? q.word.word : q.word.meaning;
    const answerText =
      direction === "zh-ja" ? q.word.meaning : q.word.word;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progress}%`,
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.playHeader}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentIndex + 1} / {questions.length}
          </Text>
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            {score}点
          </Text>
          <TouchableOpacity onPress={handleQuit}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.playContent}>
          {/* Question Card */}
          <View
            style={[
              styles.questionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.questionText, { color: colors.text }, direction === "zh-ja" ? targetFont : null]}>
              {questionText}
            </Text>
            {direction === "zh-ja" && q.word.pronunciation ? (
              <Text
                style={[styles.questionPron, { color: colors.textSecondary }]}
              >
                [{q.word.pronunciation}]
              </Text>
            ) : null}
            {direction === "zh-ja" && (
              <TouchableOpacity
                onPress={() => speakTarget(q.word.word)}
                style={[styles.speakBtn, { backgroundColor: colors.primaryLight }]}
              >
                <Ionicons
                  name="volume-medium"
                  size={22}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Flashcard Mode */}
          {mode === "flashcard" && (
            <View style={styles.flashcardArea}>
              {showAnswer ? (
                <>
                  <View
                    style={[
                      styles.answerCard,
                      {
                        backgroundColor: colors.surfaceAlt,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.answerText, { color: colors.primary }, direction === "ja-zh" ? targetFont : null]}
                    >
                      {answerText}
                    </Text>
                    <Text
                      style={[
                        styles.answerPos,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {q.word.pos}
                    </Text>
                  </View>
                  <View style={styles.flashcardBtns}>
                    <TouchableOpacity
                      onPress={() => handleFlashcardAnswer(false)}
                      style={[
                        styles.flashBtn,
                        {
                          backgroundColor: colors.dangerLight,
                          borderColor: colors.danger,
                        },
                      ]}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={colors.danger}
                      />
                      <Text style={{ color: colors.danger, fontWeight: "600" }}>
                        わからなかった
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleFlashcardAnswer(true)}
                      style={[
                        styles.flashBtn,
                        {
                          backgroundColor: colors.successLight,
                          borderColor: colors.success,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.success}
                      />
                      <Text
                        style={{ color: colors.success, fontWeight: "600" }}
                      >
                        わかった
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowAnswer(true)}
                  style={[
                    styles.revealBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Ionicons name="eye" size={20} color="#FFF" />
                  <Text style={styles.revealBtnText}>答えを見る</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Multiple Choice Mode */}
          {mode === "multiple" && q.choices && (
            <View style={styles.choicesArea}>
              {q.choices.map((choice, i) => {
                let bgColor = colors.surface;
                let borderCol = colors.border;
                let textColor = colors.text;

                if (answered !== null) {
                  if (i === q.correctIndex) {
                    bgColor = colors.successLight;
                    borderCol = colors.success;
                    textColor = colors.success;
                  } else if (i === answered && i !== q.correctIndex) {
                    bgColor = colors.dangerLight;
                    borderCol = colors.danger;
                    textColor = colors.danger;
                  }
                }

                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleMultipleChoice(i)}
                    disabled={answered !== null}
                    style={[
                      styles.choiceBtn,
                      {
                        backgroundColor: bgColor,
                        borderColor: borderCol,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.choiceText, { color: textColor }, direction === "ja-zh" ? targetFont : null]}
                    >
                      {choice}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ===== RESULT SCREEN =====
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const emoji =
    percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          学習完了！
        </Text>
        <View
          style={[
            styles.resultCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.resultScore, { color: colors.primary }]}>
            {score} / {questions.length}
          </Text>
          <Text style={[styles.resultPercent, { color: colors.textSecondary }]}>
            正答率 {percentage}%
          </Text>
        </View>
        <View style={styles.resultBtns}>
          <TouchableOpacity
            onPress={startQuiz}
            style={[styles.resultBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.resultBtnText}>もう一度</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setQuizState("setup");
              setShowAnswer(false);
              setAnswered(null);
            }}
            style={[
              styles.resultBtn,
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
            <Text style={[styles.resultBtnText, { color: colors.text }]}>
              設定に戻る
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  setupContent: { padding: 20, paddingBottom: 40 },
  setupTitle: { fontSize: 24, fontWeight: "800", marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  optionRow: { flexDirection: "row", gap: 12 },
  optionCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  wordCountNote: { textAlign: "center", fontSize: 12, marginTop: 10 },
  progressBar: { height: 3, width: "100%" },
  progressFill: { height: "100%" },
  playHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  progressText: { fontSize: 14, fontWeight: "600" },
  scoreText: { fontSize: 14, fontWeight: "700" },
  playContent: { flex: 1, paddingHorizontal: 20 },
  questionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  questionText: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  questionPron: { fontSize: 14, marginTop: 6 },
  speakBtn: {
    marginTop: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  flashcardArea: { flex: 1, justifyContent: "center", gap: 16 },
  answerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },
  answerText: { fontSize: 22, fontWeight: "700" },
  answerPos: { fontSize: 13, marginTop: 4 },
  flashcardBtns: { flexDirection: "row", gap: 12 },
  flashBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  revealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  revealBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  choicesArea: { flex: 1, justifyContent: "center", gap: 10 },
  choiceBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  choiceText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  resultContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  resultEmoji: { fontSize: 56 },
  resultTitle: { fontSize: 24, fontWeight: "800", marginTop: 12 },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  resultScore: { fontSize: 36, fontWeight: "800" },
  resultPercent: { fontSize: 16, marginTop: 4 },
  resultBtns: { flexDirection: "row", gap: 12, marginTop: 24 },
  resultBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resultBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
});
