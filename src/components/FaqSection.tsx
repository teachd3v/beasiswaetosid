import { useState } from 'react';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../data/faqData';
import type { FaqCategory } from '../data/faqData';

export function FaqSection() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-anchor bg-[var(--surface-subtle)] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)]">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[var(--ink-primary)]"
          >
            Pertanyaan Umum
          </h2>

          <div className="mt-6">
            <label htmlFor="faq-search" className="sr-only">
              Cari pertanyaan FAQ
            </label>
            <input
              id="faq-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari topik, misal: KIP, slip gaji, syarat..."
              className="min-h-11 w-full rounded-2xl border border-[var(--surface-pill-border)] bg-white px-4 py-2.5 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand-green)] focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filter kategori FAQ"
            className="mt-4 flex flex-wrap gap-2"
          >
            {FAQ_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-10 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? 'border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                      : 'border-[var(--surface-pill-border)] bg-white text-[var(--ink-secondary)] hover:bg-neutral-50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-7">
          {filteredFaqs.length === 0 ? (
            <div className="editorial-card p-8 text-center">
              <p className="text-sm font-semibold text-[var(--ink-primary)]">
                Pertanyaan tidak ditemukan
              </p>
              <p className="mt-1.5 text-xs text-[var(--ink-muted)] sm:text-sm">
                Coba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`editorial-card overflow-hidden transition-colors ${
                    isOpen ? 'border-[var(--brand-green)]/35' : ''
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                    id={`faq-trigger-${item.id}`}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <div className="min-w-0">
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-green)]">
                        {item.category}
                      </span>
                      <p className="mt-1 text-base font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] sm:text-lg">
                        {item.question}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg font-medium transition-all duration-300 ${
                        isOpen
                          ? 'rotate-45 border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                          : 'border-black/12 bg-[var(--surface-subtle)] text-[var(--ink-primary)]'
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={`faq-accordion-content ${isOpen ? 'is-open' : ''}`}
                  >
                    <div className="faq-accordion-inner">
                      <p className="border-t border-black/6 px-5 pb-5 pt-4 text-sm leading-relaxed text-[var(--ink-muted)] sm:px-6 sm:pb-6 sm:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
