"use client";

import ThemeChooser from "./theme-chooser.js";

export default function LoginPreview({ initialTheme }) {
  return (
    <div className="auth-overlay">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-top">
          <div className="auth-icon" aria-hidden="true">✳</div>
          <ThemeChooser initialTheme={initialTheme} />
        </div>
        <p className="eyebrow">WELCOME TO STOCK</p>
        <h2 id="login-title">Good to see you.</h2>
        <p>Sign in to manage your book inventory.</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" placeholder="Enter your password" autoComplete="current-password" />
          <button type="submit">Sign in <span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-note">Preview only. Sign-in is not enabled.</p>
      </section>
    </div>
  );
}
