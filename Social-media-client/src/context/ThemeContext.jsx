import React, { createContext, useContext, useState, useMemo } from "react";
import { themes } from "../constants/themes";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Persist theme in localStorage
  const getInitialTheme = () => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("theme") : null;
    return saved && themes[saved] ? saved : "dark";
  };
  const [themeName, setThemeName] = useState(getInitialTheme);

  const theme = useMemo(() => themes[themeName], [themeName]);

  const changeTheme = (name) => {
    setThemeName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", name);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
