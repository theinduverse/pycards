import type { Deck, PlannedDeck } from "./types";
import { helloPython } from "./decks/hello-python";
import { variables } from "./decks/variables";

// The learning path, in order. To add a deck, write a file in ./decks and
// replace its planned entry here.
export const curriculum: (Deck | PlannedDeck)[] = [
  helloPython,
  variables,
  { id: "strings", title: "Strings", summary: "Slice, format and transform text." },
  { id: "numbers", title: "Numbers & Math", summary: "Integer division, rounding and the math module." },
  { id: "conditionals", title: "Conditionals", summary: "Make decisions with if, elif and else." },
  { id: "loops", title: "Loops", summary: "Repeat work with for, while and range()." },
  { id: "lists", title: "Lists", summary: "Store and process collections of values." },
  { id: "dicts", title: "Dictionaries & Sets", summary: "Look things up by key." },
  { id: "functions", title: "Functions", summary: "Package code into reusable pieces." },
  { id: "errors", title: "Errors & Exceptions", summary: "Read tracebacks and handle failures." },
  { id: "modules", title: "Files & Modules", summary: "Import code and work with files." },
  { id: "classes", title: "Classes", summary: "Model things with objects." },
];

export function isReady(deck: Deck | PlannedDeck): deck is Deck {
  return deck.cards !== undefined;
}

export const readyDecks = curriculum.filter(isReady);

export function getDeck(id: string) {
  return readyDecks.find((d) => d.id === id);
}
