export default async function HomePage() {
  return (
    <article className="space-y-8 text-[17px] leading-8 sm:space-y-10 sm:text-lg">
      <title>Datfooldive</title>

      <section className="space-y-6">
        <h1 className="text-3xl font-normal tracking-tight sm:text-4xl">
          Datfooldive
        </h1>
        <p className="text-lg leading-8 sm:text-xl sm:leading-9">
          Linux and programming enthusiast. Suka Linux, suka ricing Linux, dan
          suka mencoba hal-hal baru.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] font-normal sm:text-lg">About</h2>
        <p>
          Memiliki keahlian di DevOps dan programming. Sudah sekitar tiga tahun
          menjadi programmer, dan suka bereksperimen dengan sistem, tools,
          workflow, dan hal-hal kecil yang membuat komputer terasa lebih
          personal.
        </p>
        <p>
          Bagian dari komunitas <a href="https://www.gnuweeb.org/">Gnuweeb</a>.
          Di luar programming, suka anime dan baca manga.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] font-normal sm:text-lg">Contact</h2>
        <ul className="space-y-2">
          <li>
            <a href="mailto:datfooldive@gmail.com">Email</a>
          </li>
          <li>
            <a href="https://t.me/datfooldive">Telegram</a>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-[17px] font-normal sm:text-lg">Links</h2>
        <ul className="space-y-2">
          <li>
            <a href="https://github.com/datfooldive">GitHub</a>
          </li>
        </ul>
      </section>
    </article>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
