import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeck, readyDecks } from "@/content";
import { DeckPlayer } from "@/components/DeckPlayer";

export const dynamicParams = false;

export function generateStaticParams() {
  return readyDecks.map((d) => ({ deckId: d.id }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[deckId]">): Promise<Metadata> {
  const { deckId } = await params;
  return { title: `${getDeck(deckId)?.title ?? "Deck"} – PyCards` };
}

export default async function DeckPage({ params }: PageProps<"/learn/[deckId]">) {
  const { deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) notFound();

  const i = readyDecks.indexOf(deck);
  const next = readyDecks[i + 1];

  return <DeckPlayer deck={deck} nextDeck={next && { id: next.id, title: next.title }} />;
}
