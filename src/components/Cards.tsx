"use client";

import { useState } from "react";
import type { Card, ChallengeCard, PredictCard, RecapCard } from "@/content/types";
import { CodeEditor } from "./CodeEditor";
import { Inline, Prose } from "./Prose";
import { RunnableCode } from "./RunnableCode";

const badges: Record<Card["type"], { label: string; className: string }> = {
  concept: { label: "Concept", className: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  tryit: { label: "Try it", className: "bg-[var(--success-soft)] text-[var(--success)]" },
  predict: { label: "Predict", className: "bg-[#fdf1d6] text-[#9a6a00] dark:bg-[#3a2f12] dark:text-[#f2c55c]" },
  challenge: { label: "Challenge", className: "bg-[var(--danger-soft)] text-[var(--danger)]" },
  recap: { label: "Recap", className: "bg-[var(--code-bg)] text-[var(--fg-muted)]" },
};

type Props = {
  card: Card;
  onDone: () => void;
  footer?: React.ReactNode;
};

export function CardView({ card, onDone, footer }: Props) {
  const badge = badges[card.type];
  return (
    <article className="space-y-5">
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${badge.className}`}>
        {badge.label}
      </span>
      <h2 className="text-2xl font-semibold tracking-tight text-balance">{card.title}</h2>
      {card.type === "concept" && (
        <>
          <Prose text={card.body} />
          {card.code && <CodeEditor value={card.code} readOnly />}
        </>
      )}
      {card.type === "tryit" && (
        <>
          <Prose text={card.body} />
          <RunnableCode starter={card.starter} />
        </>
      )}
      {card.type === "predict" && <Predict card={card} onDone={onDone} />}
      {card.type === "challenge" && <Challenge card={card} onDone={onDone} />}
      {card.type === "recap" && <Recap card={card} />}
      {footer}
    </article>
  );
}

function Predict({ card, onDone }: { card: PredictCard; onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === card.answer;

  return (
    <div className="space-y-4">
      <Prose text={card.prompt} />
      {card.code && <CodeEditor value={card.code} readOnly />}
      <div className="grid gap-2 sm:grid-cols-2">
        {card.options.map((opt, i) => {
          let style = "border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]";
          if (answered && i === card.answer) style = "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]";
          else if (answered && i === picked) style = "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]";
          else if (answered) style = "border-[var(--border)] opacity-50";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                onDone();
              }}
              className={`rounded-xl border-2 px-4 py-3 text-left font-mono text-sm transition ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${correct ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}`}>
          <p className={`mb-1 font-semibold ${correct ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {correct ? "Correct!" : "Not quite."}
          </p>
          <p className="text-[var(--fg-muted)]">{card.explanation}</p>
        </div>
      )}
    </div>
  );
}

function Challenge({ card, onDone }: { card: ChallengeCard; onDone: () => void }) {
  const [code, setCode] = useState(card.starter);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4">
      <Prose text={card.body} />
      <RunnableCode
        starter={card.starter}
        tests={card.tests}
        code={code}
        onCodeChange={setCode}
        onResult={(r) => r.passed && onDone()}
      />
      <div className="flex flex-wrap gap-2 text-sm">
        <button onClick={() => setShowHint((s) => !s)} className="rounded-lg px-3 py-1.5 text-[var(--accent)] hover:bg-[var(--accent-soft)]">
          {showHint ? "Hide hint" : "💡 Hint"}
        </button>
        {showHint && (
          <button onClick={() => setCode(card.solution)} className="rounded-lg px-3 py-1.5 text-[var(--fg-muted)] hover:bg-[var(--code-bg)]">
            Show solution
          </button>
        )}
      </div>
      {showHint && (
        <p className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--fg-muted)]">
          <Inline text={card.hint} />
        </p>
      )}
    </div>
  );
}

function Recap({ card }: { card: RecapCard }) {
  return (
    <ul className="space-y-3">
      {card.points.map((p, i) => (
        <li key={i} className="flex gap-3 text-[1.05rem] leading-relaxed text-[var(--fg-muted)]">
          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--success-soft)] text-xs text-[var(--success)]">✓</span>
          <span><Inline text={p} /></span>
        </li>
      ))}
    </ul>
  );
}
