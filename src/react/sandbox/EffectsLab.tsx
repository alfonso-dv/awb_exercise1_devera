/* eslint-disable react-hooks/exhaustive-deps, no-console --
   This lab logs to the console and demonstrates dependency arrays on purpose,
   including a missing one. */
import { useEffect, useRef, useState } from "react";
import { Panel } from "../shared/components/Panel.tsx";
import { useDocumentTitle } from "../shared/hooks/useDocumentTitle.ts";

/**
 * Exercise 6, Demos 1–3 — a throwaway lab for effects. Route: #/sandbox/effects
 * (not in the navigation). Open the browser console (F12) while using it.
 */

// ---------------------------------------------------------------------------
// Demo 1: a side effect during render (WRONG, on purpose)
// ---------------------------------------------------------------------------

/** Lives outside React. Changing it during render is a side effect. */
let rendersCountedDuringRender = 0;

function RenderSideEffect() {
  // ❌ Side effect in the render body: changes a variable outside the
  // component and logs on every call. In development, StrictMode calls this
  // function TWICE per render, so the count jumps by 2.
  rendersCountedDuringRender++;
  console.log(`[Demo 1] render body ran (${rendersCountedDuringRender})`);

  // ✅ Same idea done right: count *committed* renders in an effect.
  const committed = useRef(0);
  useEffect(() => {
    committed.current++;
    console.log(`[Demo 1] effect after commit (${committed.current})`);
  });

  const [, setTick] = useState(0);

  return (
    <Panel title="Demo 1 — side effect during render">
      <p>
        Module variable incremented in the render body:{" "}
        <strong>{rendersCountedDuringRender}</strong> (watch it jump by 2 per
        click in dev — StrictMode renders twice).
      </p>
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => setTick((t) => t + 1)}
      >
        Re-render
      </button>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Demo 2: three dependency arrays
// ---------------------------------------------------------------------------

function DependencyArrays() {
  const [count, setCount] = useState(0);
  const [, setUnrelated] = useState(0);

  useEffect(() => {
    console.log("[Demo 2] effect with NO array: runs after every render");
  });

  useEffect(() => {
    console.log(
      "[Demo 2] effect with []: runs once after the first render (mount)"
    );
  }, []);

  useEffect(() => {
    console.log(
      `[Demo 2] effect with [count]: runs when count changes (now ${count})`
    );
  }, [count]);

  // ❌ Omitted dependency: uses `count` but lists []. It only ever sees the
  // count from the first render (a stale closure) — it logs 0 forever.
  useEffect(() => {
    const id = setInterval(() => {
      console.log(`[Demo 2] stale interval sees count = ${count}`);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <Panel title="Demo 2 — dependency arrays (see console)">
      <p>
        count = <strong>{count}</strong>
      </p>
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => setCount((c) => c + 1)}
      >
        Change count
      </button>{" "}
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => setUnrelated((u) => u + 1)}
      >
        Re-render without changing count
      </button>
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Demo 3: cleanup — a timer that counts seconds
// ---------------------------------------------------------------------------

interface TickerProps {
  /** Ticks per second; changing it re-runs the effect. */
  speed: number;
  withCleanup: boolean;
}

let nextTimerId = 1;

function Ticker({ speed, withCleanup }: TickerProps) {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timerNo = nextTimerId++;
    console.log(`[Demo 3] timer #${timerNo} started (speed ${speed}/s)`);
    const id = setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000 / speed);

    if (!withCleanup) return; // ❌ no cleanup: the interval keeps running

    return () => {
      console.log(`[Demo 3] cleanup: timer #${timerNo} stopped`);
      clearInterval(id);
    };
  }, [speed, withCleanup]);

  return (
    <p>
      Ticks: <strong>{ticks}</strong> (should grow by {speed} per second)
    </p>
  );
}

function CleanupDemo() {
  const [mounted, setMounted] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [withCleanup, setWithCleanup] = useState(true);

  return (
    <Panel title="Demo 3 — cleanup (see console)">
      <p>
        <label>
          <input
            type="checkbox"
            checked={withCleanup}
            onChange={(e) => setWithCleanup(e.target.checked)}
          />{" "}
          with cleanup function
        </label>
      </p>
      <p>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setMounted((m) => !m)}
        >
          {mounted ? "Unmount ticker" : "Mount ticker"}
        </button>{" "}
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
        >
          Change speed (now {speed}/s)
        </button>
      </p>
      {mounted && <Ticker speed={speed} withCleanup={withCleanup} />}
      <p className="hint-text">
        Without cleanup, every speed change starts one more interval while the
        old ones keep running — the counter speeds up. Reload the page to stop
        them.
      </p>
    </Panel>
  );
}

export function EffectsLab() {
  useDocumentTitle("Effects lab");

  return (
    <section className="view active">
      <h2>Sandbox: effects lab</h2>
      <div className="detail-stack">
        <RenderSideEffect />
        <DependencyArrays />
        <CleanupDemo />
      </div>
    </section>
  );
}
