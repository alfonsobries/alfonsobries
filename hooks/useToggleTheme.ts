import { useTheme } from "next-themes";

const useToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return {
    toggleTheme,
    theme,
  };
};

export default useToggleTheme;
