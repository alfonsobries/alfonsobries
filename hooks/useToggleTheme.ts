import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

const useToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  const [realTheme, setRealTheme] = useState<string>();

  const toggleTheme = useCallback(() => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, [theme, setTheme]);

  useEffect(() => {
    setRealTheme(theme);
  }, [theme, setRealTheme]);

  return {
    toggleTheme,
    theme: realTheme,
  };
};

export default useToggleTheme;
