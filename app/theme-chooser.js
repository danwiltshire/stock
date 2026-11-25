"use client";

import { useState } from "react";
import { themes } from "../lib/themes.js";

export default function ThemeChooser({ initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);

  function changeTheme(event) {
    const selected = event.target.value;
    setTheme(selected);
    document.documentElement.dataset.theme = selected;
    document.cookie = `books-theme=${selected}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <label className="theme-chooser">
      <span className="theme-icon" aria-hidden="true">☼</span>
      <span className="sr-only">Choose theme</span>
      <select value={theme} onChange={changeTheme}>
        {themes.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
      <svg className="theme-chevron" aria-hidden="true" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
