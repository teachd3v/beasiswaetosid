const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-[var(--bg-canvas)] py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-6">
            <img
              src="/logo/dompetdhuafa.svg"
              alt="Logo Dompet Dhuafa"
              width={90}
              height={36}
              className="h-8 w-auto select-none sm:h-9"
            />
            <span aria-hidden="true" className="hidden h-6 w-px bg-black/12 sm:block" />
            <img
              src="/logo/greatedunesia.webp"
              alt="Logo GREAT Edunesia"
              width={90}
              height={32}
              className="h-7 w-auto select-none sm:h-8"
            />
            <span aria-hidden="true" className="hidden h-6 w-px bg-black/12 sm:block" />
            <img
              src="/logo/etos-id_net.svg"
              alt="Logo ETOS ID"
              width={95}
              height={32}
              className="h-7 w-auto select-none sm:h-8"
            />
          </div>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            Program beasiswa S1 yang fokus pada pengembangan SDM daerah dan penguatan nilai
            kerelawanan di bawah naungan GREAT Edunesia Dompet Dhuafa.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Alamat
            </p>
            <address className="mt-2.5 not-italic text-sm leading-relaxed text-[var(--ink-secondary)]">
              Jl. Raya Parung - Bogor KM.42 Desa Jampang, Kec. Kemang, Kab. Bogor, Jawa
              Barat 16310
            </address>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              Kontak & Media Sosial
            </p>
            <ul className="mt-2.5 space-y-2 text-sm text-[var(--ink-secondary)]">
              <li>
                <span className="text-[var(--ink-muted)]">Email: </span>
                <a
                  href="mailto:etos.id@dompetdhuafa.org"
                  className="font-medium transition-colors hover:text-[var(--brand-green-dark)]"
                >
                  etos.id@dompetdhuafa.org
                </a>
              </li>
              <li>
                <span className="text-[var(--ink-muted)]">WhatsApp: </span>
                <a
                  href="https://wa.me/6281383255525"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium transition-colors hover:text-[var(--brand-green-dark)]"
                >
                  0813 8325 5525
                </a>
              </li>
              <li className="flex flex-wrap gap-2 pt-1.5">
                <a
                  href="https://www.instagram.com/etos_id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--surface-pill-border)] bg-[var(--surface-subtle)] px-3.5 py-1 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:border-[var(--brand-green)]/35 hover:bg-[var(--brand-mint)] hover:text-[var(--brand-green-dark)]"
                >
                  <span>Instagram @etos_id</span>
                  <span aria-hidden="true">↗</span>
                </a>
                <a
                  href="https://www.youtube.com/@etosid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--surface-pill-border)] bg-[var(--surface-subtle)] px-3.5 py-1 text-xs font-semibold text-[var(--ink-primary)] transition-colors hover:border-[var(--brand-green)]/35 hover:bg-[var(--brand-mint)] hover:text-[var(--brand-green-dark)]"
                >
                  <span>YouTube @etosid</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-black/6 px-4 pt-6 sm:px-8">
        <p className="text-xs text-[var(--ink-muted)]">
          © {CURRENT_YEAR} ETOS ID · Ressillient Generations
        </p>
      </div>
    </footer>
  );
}
