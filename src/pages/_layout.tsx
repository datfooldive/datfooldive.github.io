import "../styles.css";

import type { ReactNode } from "react";
import ThemeScript from "../components/ThemeScript.js";
import ThemeToggle from "../components/ThemeToggle.js";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="relative isolate min-h-svh overflow-hidden">
      <ThemeScript />
      <meta
        name="description"
        content="A simple personal website with placeholder text."
      />
      <header className="relative z-20 mx-auto flex max-w-xl items-center justify-end px-6 pt-6 sm:px-8 sm:pt-8">
        <ThemeToggle />
      </header>
      <main className="relative z-10 mx-auto max-w-xl px-6 py-6 sm:px-8 sm:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
