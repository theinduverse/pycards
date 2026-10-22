// Card bodies support a tiny subset of Markdown: blank-line paragraphs,
// `inline code` and **bold**.

export type ConceptCard = {
  type: "concept";
  id: string;
  title: string;
  body: string;
  code?: string;
};

export type TryItCard = {
  type: "tryit";
  id: string;
  title: string;
  body: string;
  starter: string;
};

export type PredictCard = {
  type: "predict";
  id: string;
  title: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ChallengeCard = {
  type: "challenge";
  id: string;
  title: string;
  body: string;
  starter: string;
  // Python run after the learner's code in the same namespace. `_output` holds
  // everything the learner's code printed. Use `assert cond, "hint"`.
  tests: string;
  hint: string;
  solution: string;
};

export type RecapCard = {
  type: "recap";
  id: string;
  title: string;
  points: string[];
};

export type Card = ConceptCard | TryItCard | PredictCard | ChallengeCard | RecapCard;

export type Deck = {
  id: string;
  title: string;
  summary: string;
  cards: Card[];
};

// A deck listed on the home screen before its cards are written.
export type PlannedDeck = Omit<Deck, "cards"> & { cards?: undefined };
