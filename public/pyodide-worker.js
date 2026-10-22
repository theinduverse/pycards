// Runs Python in a Web Worker so long-running code never freezes the page.
// The main thread terminates and recreates this worker on timeout.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");

const ready = loadPyodide().then((py) => {
  py.runPython(`
import builtins
def _no_input(prompt=""):
    raise RuntimeError("input() isn't available in the browser yet - set a variable instead.")
builtins.input = _no_input
`);
  return py;
});

// Drop Pyodide's internal frames so learners only see their own code.
function cleanTraceback(message) {
  const lines = message.split("\n");
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  if (start === -1) return message.trim();
  return ["Traceback (most recent call last):", ...lines.slice(start)]
    .join("\n")
    .trim();
}

self.onmessage = async ({ data }) => {
  const { id, code, tests } = data;
  const py = await ready;
  let output = "";
  py.setStdout({ batched: (s) => (output += s + "\n") });
  py.setStderr({ batched: (s) => (output += s + "\n") });

  const globals = py.toPy({});
  try {
    await py.loadPackagesFromImports(code);
    await py.runPythonAsync(code, { globals });
  } catch (err) {
    self.postMessage({ id, ok: false, output, error: cleanTraceback(String(err.message)) });
    globals.destroy();
    return;
  }

  if (tests) {
    const printed = output;
    globals.set("_output", printed);
    try {
      await py.runPythonAsync(tests, { globals });
      self.postMessage({ id, ok: true, output: printed, passed: true });
    } catch (err) {
      const msg = String(err.message);
      const assertion = msg.match(/AssertionError: ?(.*)\s*$/s);
      self.postMessage({
        id,
        ok: true,
        output: printed,
        passed: false,
        failure: assertion ? assertion[1].trim() || "Not quite - check the task again." : cleanTraceback(msg),
      });
    }
  } else {
    self.postMessage({ id, ok: true, output });
  }
  globals.destroy();
};

ready.then(
  () => self.postMessage({ type: "ready" }),
  (err) => self.postMessage({ type: "load-error", error: String(err) })
);
