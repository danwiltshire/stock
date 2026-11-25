import { cookies } from "next/headers";
import { books } from "../lib/books.js";
import { getConfig } from "../lib/config.js";
import { getTheme } from "../lib/themes.js";
import Inventory from "./inventory.js";
import LoginPreview from "./login-preview.js";
import ThemeChooser from "./theme-chooser.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const { enableAuth } = getConfig();
  const theme = getTheme((await cookies()).get("books-theme")?.value);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Stock home">
            <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
            <span>stock<span className="brand-period">.</span></span>
          </a>
          <div className="header-right">
            <span className="workspace-label"><span className="workspace-dot" /> Inventory workspace</span>
            {!enableAuth && <ThemeChooser initialTheme={theme} />}
          </div>
        </div>
      </header>
      <Inventory initialBooks={books} />
      {enableAuth && <LoginPreview initialTheme={theme} />}
    </>
  );
}
