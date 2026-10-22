"use client";

export type RunResult = {
  ok: boolean;
  output: string;
  error?: string;
  passed?: boolean;
  failure?: string;
};

export type EngineStatus = "idle" | "loading" | "ready" | "error";

const TIMEOUT_MS = 5000;

let worker: Worker | null = null;
let status: EngineStatus = "idle";
let nextId = 0;
const pending = new Map<number, (r: RunResult) => void>();
const listeners = new Set<(s: EngineStatus) => void>();

function setStatus(s: EngineStatus) {
  status = s;
  listeners.forEach((l) => l(s));
}

function startWorker() {
  worker = new Worker("/pyodide-worker.js");
  setStatus("loading");
  worker.onmessage = ({ data }) => {
    if (data.type === "ready") return setStatus("ready");
    if (data.type === "load-error") {
      pending.forEach((resolve) =>
        resolve({ ok: false, output: "", error: "Couldn't load Python. Check your connection and refresh." })
      );
      pending.clear();
      worker?.terminate();
      worker = null;
      return setStatus("error");
    }
    pending.get(data.id)?.(data);
    pending.delete(data.id);
  };
  return worker;
}

export function getStatus() {
  return status;
}

export function subscribeStatus(fn: (s: EngineStatus) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

// Starts downloading Python in the background before the first Run.
export function warmUp() {
  if (!worker) startWorker();
}

export function runPython(code: string, tests?: string): Promise<RunResult> {
  const w = worker ?? startWorker();
  const id = nextId++;
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const armTimeout = () => {
      timer = setTimeout(() => {
        // Stuck (e.g. infinite loop): kill the worker and start a fresh one.
        pending.delete(id);
        w.terminate();
        worker = null;
        startWorker();
        resolve({
          ok: false,
          output: "",
          error: `Stopped after ${TIMEOUT_MS / 1000}s - is there a loop that never ends?`,
        });
      }, TIMEOUT_MS);
    };
    pending.set(id, (r) => {
      clearTimeout(timer);
      resolve(r);
    });
    // Don't count Python's first download against the time limit.
    if (status === "ready") armTimeout();
    else {
      const unsub = subscribeStatus((s) => {
        if (s === "ready" && pending.has(id)) armTimeout();
        if (s !== "loading") unsub();
      });
    }
    w.postMessage({ id, code, tests });
  });
}
