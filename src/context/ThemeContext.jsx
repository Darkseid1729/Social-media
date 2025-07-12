import React, { createContext, useContext, useState, useMemo } from "react";
import { themes } from "../constants/themes";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default to dark theme, or use localStorage if you want persistence
  const [themeName, setThemeName] = useState("dark");

  const theme = useMemo(() => themes[themeName], [themeName]);

  const changeTheme = (name) => {
    setThemeName(name);
    // Optionally: localStorage.setItem("theme", name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
