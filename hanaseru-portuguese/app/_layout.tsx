import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { AppProvider } from "../lib/AppContext";
import { ThemeProvider, useTheme } from "../lib/ThemeContext";

function InnerLayout() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Route speech through the playback audio session so pronunciation is
    // audible even when the device's mute/silent switch is on. Without this,
    // AVSpeechSynthesizer is silenced by the iOS mute switch (the cause of
    // App Review's "no audible content" finding on a muted review device).
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <InnerLayout />
      </ThemeProvider>
    </AppProvider>
  );
}
