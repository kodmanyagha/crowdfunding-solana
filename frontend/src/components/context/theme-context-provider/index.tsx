import { createContext, useState } from "react";

const themeStorageKey = "selectedTheme";
const initialTheme = window.localStorage.getItem(themeStorageKey) ?? "light";

export type ThemeContextValueType = {
  theme: string;
  setTheme: Function;
  toggleTheme: Function;
};

export const ThemeContext = createContext<ThemeContextValueType>({
  theme: initialTheme,
  setTheme: () => {},
  toggleTheme: () => {},
});

export default function ThemeContextProvider(props: any) {
  const [theme, setTheme] = useState(initialTheme);

  window.localStorage.setItem(themeStorageKey, theme);
  document.getElementsByTagName("html")[0].setAttribute("data-bs-theme", theme);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("auto");
    } else {
      setTheme("light");
    }
  };

  const contextValue = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>
  );
}
