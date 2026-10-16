import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "./colors";
import { useApp } from "./AppContext";

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: Colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();
  const systemScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (settings.theme === "system") {
      return systemScheme === "dark";
    }
    return settings.theme === "dark";
  }, [settings.theme, systemScheme]);

  const colors = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
