"use client";

import { useSyncExternalStore } from "react";

// Progress lives in localStorage for now; swap this module for a backend
// later without touching the components.

export type DeckProgress = { completed: string[]; last: number };
export type Progress = {
  decks: Record<string, DeckProgress>;
  streak: { count: number; lastDay: string | null };
};

const KEY = "pycards:progress:v1";
const EMPTY: Progress = { decks: {}, streak: { count: 0, lastDay: null } };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: Progress) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: progress just won't persist.
  }
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export const getProgress = read;

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

function today() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
}

function bumpStreak(streak: Progress["streak"]): Progress["streak"] {
  const now = today();
  if (streak.lastDay === now) return streak;
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString("en-CA");
  return { count: streak.lastDay === yesterday ? streak.count + 1 : 1, lastDay: now };
}

export function markCardDone(deckId: string, cardId: string) {
  const p = read();
  const deck = p.decks[deckId] ?? { completed: [], last: 0 };
  if (deck.completed.includes(cardId)) return;
  write({
    decks: { ...p.decks, [deckId]: { ...deck, completed: [...deck.completed, cardId] } },
    streak: bumpStreak(p.streak),
  });
}

export function setLastCard(deckId: string, index: number) {
  const p = read();
  const deck = p.decks[deckId] ?? { completed: [], last: 0 };
  if (deck.last === index) return;
  write({ ...p, decks: { ...p.decks, [deckId]: { ...deck, last: index } } });
}

export function resetDeck(deckId: string) {
  const p = read();
  const decks = { ...p.decks };
  delete decks[deckId];
  write({ ...p, decks });
}

// A streak only counts if the learner studied today or yesterday.
export function currentStreak(p: Progress) {
  const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString("en-CA");
  return p.streak.lastDay === today() || p.streak.lastDay === yesterday ? p.streak.count : 0;
}
