import { Fragment } from "react";

// Renders the tiny Markdown subset used in card text: paragraphs,
// numbered lines, `code` and **bold**.
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`"))
          return (
            <code key={i} className="rounded bg-[var(--code-bg)] px-1.5 py-0.5 font-mono text-[0.9em]">
              {part.slice(1, -1)}
            </code>
          );
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-[var(--fg)]">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
          return <em key={i}>{part.slice(1, -1)}</em>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-[1.05rem] leading-relaxed text-[var(--fg-muted)]">
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              <Inline text={line} />
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
