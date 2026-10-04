import React, { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext();
const KEY = "wp_theme_override";
const autoTheme = (d = new Date()) => {
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= 210 && m < 720 ? "morning" : "evening";
};
export function ThemeProvider({ children }) {
  const [override, setOverride] = useState(() => {
    localStorage.removeItem("wp_theme_mode"); 
    const v = localStorage.getItem(KEY);
    return v === "morning" || v === "evening" ? v : null;
  });
  const [auto, setAuto] = useState(autoTheme);
  const [cutoffTime, setCutoffTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => setAuto(autoTheme()), 60000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(16, 0, 0, 0);
      if (cutoff <= now) cutoff.setDate(cutoff.getDate() + 1);
      const diff = cutoff - now;
      setCutoffTime(`${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);
  const mode = override || auto;
  const isAuto = override === null;
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "evening");
    root.style.colorScheme = mode === "evening" ? "dark" : "light";
  }, [mode]);
  const toggleTheme = () => {
    const next = mode === "morning" ? "evening" : "morning";
    setOverride(next);
    localStorage.setItem(KEY, next);
  };
  const resetAuto = () => {
    setOverride(null);
    localStorage.removeItem(KEY);
  };
  return <ThemeContext.Provider value={{ mode, isAuto, toggleTheme, resetAuto, cutoffTime }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  return useContext(ThemeContext);
}
