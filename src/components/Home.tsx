"use client";

import Link from "next/link";
import { curriculum, isReady, readyDecks } from "@/content";
import { currentStreak, useProgress } from "@/lib/progress";

export function Home() {
  const progress = useProgress();
  const streak = currentStreak(progress);

  const stats = readyDecks.map((d) => {
    const done = progress.decks[d.id]?.completed.filter((id) => d.cards.some((c) => c.id === id)).length ?? 0;
    return { id: d.id, done, total: d.cards.length };
  });
  const totalDone = stats.reduce((n, s) => n + s.done, 0);
  // Recommend the first deck that isn't finished.
  const upNext = stats.find((s) => s.done < s.total)?.id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between">
        <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] font-mono text-sm text-[var(--accent-fg)]">py</span>
          PyCards
        </span>
        <div className="flex items-center gap-4 text-sm text-[var(--fg-muted)]">
          <span title="Cards completed"><strong className="text-[var(--fg)]">{totalDone}</strong> cards</span>
          <span title="Days in a row" className="flex items-center gap-1">
            <span aria-hidden>🔥</span>
            <strong className="text-[var(--fg)]">{streak}</strong> day{streak === 1 ? "" : "s"}
          </span>
        </div>
      </header>

      <section className="mb-10">
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Learn Python, one card at a time.
        </h1>
        <p className="max-w-lg text-lg text-[var(--fg-muted)]">
          Short lessons, real code you can run in your browser, and quick challenges. Nothing to install.
        </p>
      </section>

      <ol className="relative space-y-3">
        {curriculum.map((deck, i) => {
          const ready = isReady(deck);
          const s = stats.find((x) => x.id === deck.id);
          const pct = s ? Math.round((s.done / s.total) * 100) : 0;
          const finished = s && s.done === s.total;
          const isNext = deck.id === upNext;

          const inner = (
            <div
              className={`flex items-center gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                ready
                  ? `bg-[var(--surface)] hover:-translate-y-0.5 hover:shadow-md ${isNext ? "border-[var(--accent)] ring-2 ring-[var(--accent-soft)]" : "border-[var(--border)]"}`
                  : "border-dashed border-[var(--border)] opacity-60"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  finished ? "bg-[var(--success)] text-white" : ready ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--code-bg)] text-[var(--fg-muted)]"
                }`}
              >
                {finished ? "✓" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="truncate font-semibold">{deck.title}</h2>
                  <span className="shrink-0 text-xs text-[var(--fg-muted)]">
                    {ready ? `${s!.done}/${s!.total}` : "Coming soon"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[var(--fg-muted)]">{deck.summary}</p>
                {ready && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--code-bg)]">
                    <div className="h-full rounded-full bg-[var(--success)] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              {ready && (
                <span className={`hidden rounded-lg px-3 py-1.5 text-sm font-semibold sm:inline ${isNext ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "text-[var(--accent)]"}`}>
                  {finished ? "Review" : s!.done > 0 ? "Continue" : "Start"}
                </span>
              )}
            </div>
          );

          return (
            <li key={deck.id}>
              {ready ? <Link href={`/learn/${deck.id}`} className="block">{inner}</Link> : inner}
            </li>
          );
        })}
      </ol>

      <footer className="mt-12 text-center text-xs text-[var(--fg-muted)]">
        Progress is saved in this browser. Python runs locally via Pyodide.
      </footer>
    </div>
  );
}
