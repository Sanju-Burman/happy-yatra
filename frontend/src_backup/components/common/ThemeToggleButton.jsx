// src/components/ThemeToggleButton.jsx
import { useTheme } from "../../context/ThemeContext";

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
};

export default ThemeToggleButton;
