"use client";

import CodeMirror, { EditorView, keymap, Prec } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { useMemo, useSyncExternalStore } from "react";

const darkQuery = "(prefers-color-scheme: dark)";

function useDarkMode() {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(darkQuery);
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    },
    () => window.matchMedia(darkQuery).matches,
    () => false
  );
}

const baseTheme = EditorView.theme({
  "&": { backgroundColor: "var(--code-bg)" },
  ".cm-gutters": { backgroundColor: "var(--code-bg)", border: "none", color: "var(--fg-muted)", opacity: "0.6" },
  ".cm-content": { padding: "12px 0", fontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
  ".cm-line": { padding: "0 12px 0 4px" },
});

type Props = {
  value: string;
  onChange?: (v: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
};

export function CodeEditor({ value, onChange, onRun, readOnly }: Props) {
  const dark = useDarkMode();
  const extensions = useMemo(
    () => [
      python(),
      baseTheme,
      EditorView.lineWrapping,
      Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => (onRun?.(), true) }])),
    ],
    [onRun]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <CodeMirror
        value={value}
        onChange={onChange}
        editable={!readOnly}
        readOnly={readOnly}
        theme={dark ? "dark" : "light"}
        extensions={extensions}
        basicSetup={{
          lineNumbers: !readOnly,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          autocompletion: false,
        }}
        minHeight={readOnly ? undefined : "120px"}
      />
    </div>
  );
}
