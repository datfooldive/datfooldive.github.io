"use client";

import { useTranslation } from "react-i18next";

export default function PageContent() {
  const { t } = useTranslation();

  return (
    <article className="relative z-10 space-y-8 text-[17px] leading-8 sm:space-y-10 sm:text-lg">
      <title>Datfooldive</title>

      <section className="space-y-6">
        <h1 className="text-3xl tracking-tight sm:text-4xl">
          Datfooldive
        </h1>
        <p className="text-lg leading-8 sm:text-xl sm:leading-9">
          {t("tagline")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] sm:text-lg">
          {t("about_heading")}
        </h2>
        <p>{t("about_p1")}</p>
        <p>
          {t("about_p2_prefix")}
          <a href="https://www.gnuweeb.org/">Gnuweeb</a>
          {t("about_p2_suffix")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] sm:text-lg">
          {t("contact_heading")}
        </h2>
        <ul className="space-y-2">
          <li>
            <a href="mailto:datfooldive@gnuweeb.org">Email</a>
          </li>
          <li>
            <a href="https://t.me/datfooldive">Telegram</a>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] sm:text-lg">
          {t("links_heading")}
        </h2>
        <ul className="space-y-2">
          <li>
            <a href="https://github.com/datfooldive">GitHub</a>
          </li>
        </ul>
      </section>
    </article>
  );
}
