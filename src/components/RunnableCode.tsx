"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { CodeEditor } from "./CodeEditor";
import { getStatus, runPython, subscribeStatus, warmUp, type RunResult } from "@/lib/python";

type Props = {
  starter: string;
  tests?: string;
  onResult?: (r: RunResult) => void;
  // Lets a parent (e.g. "Show solution") replace the editor contents.
  code?: string;
  onCodeChange?: (code: string) => void;
};

export function RunnableCode({ starter, tests, onResult, code: controlled, onCodeChange }: Props) {
  const [local, setLocal] = useState(starter);
  const code = controlled ?? local;
  const setCode = onCodeChange ?? setLocal;
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const status = useSyncExternalStore(subscribeStatus, getStatus, () => "idle" as const);

  useEffect(warmUp, []);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    const r = await runPython(code, tests);
    setResult(r);
    setRunning(false);
    onResult?.(r);
  }, [code, tests, running, onResult]);

  const label = running ? (status === "ready" ? "Running…" : "Loading Python…") : tests ? "Check" : "Run";

  return (
    <div className="space-y-3">
      <CodeEditor value={code} onChange={setCode} onRun={run} />
      <div className="flex items-center gap-2">
        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-fg)] transition hover:brightness-110 disabled:opacity-60"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2 1.5v9l8-4.5z" fill="currentColor" /></svg>
          {label}
        </button>
        <button
          onClick={() => {
            setCode(starter);
            setResult(null);
          }}
          className="rounded-lg px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-[var(--code-bg)]"
        >
          Reset
        </button>
        <span className="ml-auto hidden text-xs text-[var(--fg-muted)] sm:inline">
          {status === "loading" && !running ? "Preparing Python…" : "⌘/Ctrl + Enter to run"}
        </span>
      </div>
      {result && <Output result={result} />}
    </div>
  );
}

function Output({ result }: { result: RunResult }) {
  const text = result.output.replace(/\n$/, "");
  return (
    <div className="space-y-2">
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#17181b] p-3 font-mono text-sm text-[#e8e6e1]">
        {text || (result.ok && !result.error ? <span className="opacity-50">(no output)</span> : null)}
        {result.error && <span className="text-[#ff8a75]">{text ? "\n" : ""}{result.error}</span>}
      </pre>
      {result.passed === true && (
        <div className="rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-medium text-[var(--success)]">
          ✓ All checks passed. Nice work!
        </div>
      )}
      {result.passed === false && (
        <div className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
          <span className="font-semibold">Not yet: </span>
          <span className="whitespace-pre-wrap">{result.failure}</span>
        </div>
      )}
    </div>
  );
}
