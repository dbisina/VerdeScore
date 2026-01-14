import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('greenloan-theme') || 'liquid';
        }
        return 'liquid';
    });

    useEffect(() => {
        localStorage.setItem('greenloan-theme', theme);

        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('theme-liquid', 'theme-dark', 'theme-system');
        root.classList.add(`theme-${theme}`);

        // Update CSS variables based on theme
        if (theme === 'dark' || theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.style.setProperty('--bg-primary', '#0a0a0a');
            root.style.setProperty('--bg-secondary', '#111111');
        } else if (theme === 'liquid') {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
