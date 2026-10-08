import * as Speech from "expo-speech";

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
    // Voice.language is reported as "ko-KR", "ko_KR" or "ko" depending on OS.
    const match = voices.find((v) => /^ko([-_]|$)/i.test(v.language));
    cachedVoiceId = match ? match.identifier : null;
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

  // Stop any ongoing speech
  await Speech.stop();

  const voiceId = await resolveTargetVoice();

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: "ko-KR",
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
