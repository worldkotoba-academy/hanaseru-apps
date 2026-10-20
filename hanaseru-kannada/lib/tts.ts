import * as Speech from "expo-speech";
import { Alert } from "react-native";

// 読み上げ言語（カンナダ語）。声は地域まで一致するものを優先し、なければ言語だけ一致するもの
const LANG = "kn-IN";
const VOICE_PATTERNS: RegExp[] = [/^kn[-_]IN/i, /^kn([-_]|$)/i];
// false = iPhone にカンナダ語の読み上げの声が無い（読み上げボタン・音声速度を出さない）
export const HAS_VOICE = true;

let currentRate = 1.0;
// undefined = not looked up yet, null = no Target voice found
let cachedVoiceId: string | null | undefined;

export function setRate(rate: number) {
  currentRate = Math.max(0.5, Math.min(1.5, rate));
}

export function getRate(): number {
  return currentRate;
}

async function resolveTargetVoice(): Promise<string | null> {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    cachedVoiceId = null;
    for (const p of VOICE_PATTERNS) {
      const match = voices.find((v) => p.test(v.language));
      if (match) {
        cachedVoiceId = match.identifier;
        break;
      }
    }
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId;
}

export async function speakTarget(
  text: string,
  rate?: number
): Promise<void> {
  if (!HAS_VOICE) return;
  const useRate = rate ?? currentRate;
  // 強勢記号（ロシア語の U+0301）は表示専用。読み上げには渡さない
  const body = text.replace(/\u0301/g, "");

  // Stop any ongoing speech
  await Speech.stop();

  const voiceId = await resolveTargetVoice();
  if (!voiceId) {
    Alert.alert(
      "カンナダ語の音声がありません",
      "この iPhone にはカンナダ語の読み上げ音声が入っていません。「設定」→「アクセシビリティ」→「読み上げコンテンツ」→「声」からカンナダ語の声を追加すると、読み上げが使えるようになります。"
    );
    return;
  }

  return new Promise((resolve, reject) => {
    Speech.speak(body, {
      language: LANG,
      ...(voiceId ? { voice: voiceId } : {}),
      rate: useRate,
      pitch: 1.0,
      onDone: () => resolve(),
      onError: (error) => reject(error),
      onStopped: () => resolve(),
    });
  });
}

export async function stopSpeech(): Promise<void> {
  await Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
