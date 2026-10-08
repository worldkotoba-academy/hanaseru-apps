import * as Speech from "expo-speech";

let currentRate = 1.0;
// undefined = not looked up yet, null = no Vietnamese voice found
let cachedVoiceId: string | null | undefined;

export function setRate(rate: number) {
  currentRate = Math.max(0.5, Math.min(1.5, rate));
}

export function getRate(): number {
  return currentRate;
}

async function resolveVietnameseVoice(): Promise<string | null> {
  if (cachedVoiceId !== undefined) return cachedVoiceId;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Voice.language is reported as "vi-VN", "vi_VN" or "vi" depending on OS.
    const match = voices.find((v) => /^vi([-_]|$)/i.test(v.language));
    cachedVoiceId = match ? match.identifier : null;
  } catch {
    cachedVoiceId = null;
  }
  return cachedVoiceId;
}

export async function speakVietnamese(
  text: string,
  rate?: number
): Promise<void> {
  const useRate = rate ?? currentRate;

  // Stop any ongoing speech
  await Speech.stop();

  const voiceId = await resolveVietnameseVoice();

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: "vi-VN",
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
