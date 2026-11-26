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
      className="section-anchor bg-[var(--surface-subtle)] py-9 sm:py-12 lg:py-16"
    >
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:gap-8 sm:px-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-green)] sm:text-xs">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-1.5 text-[clamp(1.6rem,3.6vw,2.85rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[var(--ink-primary)] sm:mt-2"
          >
            Pertanyaan Umum
          </h2>

          <div className="mt-3.5 sm:mt-5">
            <label htmlFor="faq-search" className="sr-only">
              Cari pertanyaan FAQ
            </label>
            <input
              id="faq-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari topik, misal: KIP, slip gaji, syarat..."
              className="min-h-10 w-full rounded-xl border border-[var(--surface-pill-border)] bg-white px-3.5 py-2 text-xs text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--brand-green)] focus:outline-none sm:min-h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
            />
          </div>

          <div
            role="group"
            aria-label="Filter kategori FAQ"
            className="mt-3 flex flex-wrap gap-1.5 sm:gap-2"
          >
            {FAQ_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-8 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm ${
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

        <div className="space-y-2.5 lg:col-span-7">
          {filteredFaqs.length === 0 ? (
            <div className="editorial-card p-6 text-center">
              <p className="text-sm font-semibold text-[var(--ink-primary)]">
                Pertanyaan tidak ditemukan
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)] sm:text-sm">
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
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
                  >
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-green)] sm:text-[11px]">
                        {item.category}
                      </span>
                      <p className="mt-0.5 text-sm font-bold leading-snug tracking-[-0.02em] text-[var(--ink-primary)] sm:text-base">
                        {item.question}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-9 sm:w-9 ${
                        isOpen
                          ? 'rotate-45 border-[var(--brand-green-dark)] bg-[var(--brand-green-dark)] text-white'
                          : 'border-black/12 bg-[var(--surface-subtle)] text-[var(--ink-primary)]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                      >
                        <path
                          d="M8 3.25V12.75M3.25 8H12.75"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${item.id}`}
                    className={`faq-accordion-content ${isOpen ? 'is-open' : ''}`}
                  >
                    <div className="faq-accordion-inner">
                      <p className="border-t border-black/6 px-4 pb-4 pt-3 text-xs leading-relaxed text-[var(--ink-muted)] sm:px-5 sm:pb-5 sm:pt-3.5 sm:text-sm">
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
