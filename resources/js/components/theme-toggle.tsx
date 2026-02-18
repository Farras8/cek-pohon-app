import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setIsDark(true);
        } else if (saved === 'light') {
            setIsDark(false);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDark(true);
        }
    }, []);

    return (
        <SidebarMenuButton
            onClick={() => setIsDark(!isDark)}
            tooltip={{ children: isDark ? 'Light Mode' : 'Dark Mode' }}
        >
            {isDark ? <Sun /> : <Moon />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </SidebarMenuButton>
    );
}
