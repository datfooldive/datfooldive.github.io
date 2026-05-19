"use client";

import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === "id" ? "en" : "id";
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="theme-toggle inline-flex items-center justify-center rounded-lg p-2 opacity-60 transition-opacity hover:opacity-100"
    >
      {i18n.language === "id" ? (
        <svg width="16" height="16" viewBox="0 0 640 480">
          <rect width="640" height="240" fill="#FF0000" />
          <rect y="240" width="640" height="240" fill="#FFFFFF" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 640 480">
          <rect width="640" height="480" fill="#012169" />
          <path d="M75 0l249 193L573 0h67v62L400 255l240 185v40h-80L320 300 83 480H0v-42l238-184L0 68V0h75z" fill="#FFF" />
          <path d="M424 281l216 159v40L369 281h55zM240 300l6 51L54 480H0l240-180zM640 0v3L391 193l1-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E" />
          <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#FFF" />
          <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E" />
        </svg>
      )}
    </button>
  );
}
