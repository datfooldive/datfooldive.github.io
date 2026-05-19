import "../styles.css";

import type { ReactNode } from "react";
import I18nProvider from "../components/I18nProvider.js";
import ThemeScript from "../components/ThemeScript.js";
import ThemeToggle from "../components/ThemeToggle.js";
import LanguageToggle from "../components/LanguageToggle.js";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <I18nProvider>
      <div className="relative isolate min-h-svh overflow-hidden">
        <link
          rel="preload"
          href="/fonts/maple-mono-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <ThemeScript />
        <meta
          name="description"
          content="A simple personal website."
        />
        <header className="relative z-20 mx-auto flex max-w-xl items-center justify-end gap-2 px-6 pt-6 sm:px-8 sm:pt-8">
          <LanguageToggle />
          <ThemeToggle />
        </header>
        <main className="relative z-10 mx-auto max-w-xl px-6 py-6 sm:px-8 sm:py-8 lg:py-10">
          {children}
        </main>
      </div>
    </I18nProvider>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
