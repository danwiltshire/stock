import { cookies } from "next/headers";
import { getTheme } from "../lib/themes.js";
import "./globals.css";

export const metadata = {
  title: "Stock | Book inventory management",
  description: "Manage your book inventory in one place.",
};

export default async function RootLayout({ children }) {
  const theme = getTheme((await cookies()).get("books-theme")?.value);

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
