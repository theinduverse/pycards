"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Deck } from "@/content/types";
import { getProgress, markCardDone, setLastCard, useProgress } from "@/lib/progress";
import { CardView } from "./Cards";

type Props = {
  deck: Deck;
  nextDeck?: { id: string; title: string };
};

export function DeckPlayer({ deck, nextDeck }: Props) {
  const progress = useProgress();
  const completed = progress.decks[deck.id]?.completed ?? [];
  const [index, setIndex] = useState(0);
  // Card index we're restoring to on mount; null once restored.
  const restoring = useRef<number | null>(null);
  const card = deck.cards[index];
  const isLast = index === deck.cards.length - 1;

  // Pick up where the learner left off (progress is only readable on the client).
  useEffect(() => {
    const last = getProgress().decks[deck.id]?.last ?? 0;
    if (last > 0 && last < deck.cards.length) {
      restoring.current = last;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
      setIndex(last);
    }
  }, [deck]);

  // Reading-only cards count as done once seen.
  useEffect(() => {
    if (restoring.current !== null) {
      if (restoring.current !== index) return;
      restoring.current = null;
    }
    if (card.type === "concept" || card.type === "tryit" || card.type === "recap") markCardDone(deck.id, card.id);
    setLastCard(deck.id, index);
  }, [deck.id, card, index]);

  const onDone = useCallback(() => markCardDone(deck.id, card.id), [deck.id, card.id]);
  const done = completed.includes(card.id);
  const canAdvance = !isLast && (card.type !== "predict" || done);

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), deck.cards.length - 1)),
    [deck.cards.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest(".cm-editor, input, textarea")) return;
      if (e.key === "ArrowRight" && canAdvance) go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, canAdvance]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5 sm:py-8">
      <header className="mb-5 flex items-center gap-4">
        <Link href="/" aria-label="Back to all decks" className="rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--code-bg)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </Link>
        <div className="flex flex-1 gap-1" aria-label={`Card ${index + 1} of ${deck.cards.length}`}>
          {deck.cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setIndex(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i === index ? "bg-[var(--accent)]" : completed.includes(c.id) ? "bg-[var(--success)] opacity-70" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <span className="w-12 text-right text-sm tabular-nums text-[var(--fg-muted)]">
          {index + 1}/{deck.cards.length}
        </span>
      </header>

      <p className="mb-2 text-sm font-medium text-[var(--fg-muted)]">{deck.title}</p>

      <div key={card.id} className="card-in rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
        <CardView
          card={card}
          onDone={onDone}
          footer={
            isLast && (
              <div className="flex flex-wrap gap-3 pt-2">
                {nextDeck && (
                  <Link href={`/learn/${nextDeck.id}`} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] hover:brightness-110">
                    Next: {nextDeck.title} →
                  </Link>
                )}
                <Link href="/" className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--code-bg)]">
                  All decks
                </Link>
              </div>
            )
          }
        />
      </div>

      <nav className="sticky bottom-0 mt-auto flex pt-5 items-center justify-between gap-3 bg-[var(--bg)] py-3">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-xl border border-[var(--border)] px-5 py-3 font-semibold disabled:opacity-40"
        >
          ← Back
        </button>
        {!isLast && (
          <button
            onClick={() => go(1)}
            disabled={!canAdvance}
            title={canAdvance ? undefined : "Pick an answer first"}
            className="rounded-xl bg-[var(--fg)] px-6 py-3 font-semibold text-[var(--bg)] transition hover:opacity-90 disabled:opacity-30"
          >
            {card.type === "challenge" && !done ? "Skip →" : "Next →"}
          </button>
        )}
      </nav>
    </div>
  );
}
