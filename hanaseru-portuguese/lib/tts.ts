import * as Speech from "expo-speech";

// 読み上げ言語（ポルトガル語）。声は地域まで一致するものを優先し、なければ言語だけ一致するもの
const LANG = "pt-PT";
const VOICE_PATTERNS = [/^pt[-_]PT/i, /^pt([-_]|$)/i];

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
  const useRate = rate ?? currentRate;
  // 強勢記号（ロシア語の U+0301）は表示専用。読み上げには渡さない
  const body = text.replace(/\u0301/g, "");

  // Stop any ongoing speech
  await Speech.stop();

  const voiceId = await resolveTargetVoice();

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
