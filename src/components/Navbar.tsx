'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import {
  Show,
  UserButton,
  OrganizationSwitcher
} from "@clerk/nextjs";

export default function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    const activeTheme = isDark ? 'dark' : 'light';
    setTheme(activeTheme);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-slow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold tracking-tight text-brand transition-colors">
            DocVault
          </Link>
          <Show when="signed-in">
            <Link href="/dashboard" className="text-sm font-medium text-muted-text hover:text-foreground transition-colors duration-fast">
              Dashboard
            </Link>
          </Show>
        </div>

        <div className="flex gap-4 items-center">
          {/* Theme Toggler */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-sm text-muted-text hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-brand" />
            ) : (
              <Moon className="h-4 w-4 text-brand" />
            )}
          </Button>

          <Show when="signed-in">
            <div className="flex items-center gap-3">
              {/* Organization and Team Switcher */}
              <OrganizationSwitcher
                appearance={{
                  variables: {
                    colorPrimary: '#6C47FF',
                    colorBackground: theme === 'dark' ? '#1E1E26' : '#E8E8F0',
                  },
                  elements: {
                    rootBox: "flex items-center text-sm font-medium border border-border rounded-sm px-2 py-1 bg-card hover:bg-card-hover transition-colors duration-fast",
                    organizationSwitcherTrigger: "text-foreground hover:text-foreground"
                  }
                }}
                hidePersonal={false} // Allow personal workspace as default team
              />
              <UserButton
                appearance={{
                  variables: {
                    colorPrimary: '#6C47FF',
                    colorBackground: theme === 'dark' ? '#1E1E26' : '#E8E8F0',
                  }
                }}
              />
            </div>
          </Show>
          <Show when="signed-out">
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-sm h-9 px-4 rounded-sm text-muted-text hover:text-foreground">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm h-9 px-4 rounded-sm bg-brand hover:bg-brand-hover active:bg-brand-active text-white shadow-sm transition-all duration-fast">
                  Sign Up
                </Button>
              </Link>
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
}
