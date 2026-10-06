import { HelloCase } from "./sandbox/HelloCase.tsx";

export function App() {
  return (
    <main className="app-main">
      <p>
        React version (migration in progress). The complete app is still at{" "}
        <a href="index.html">index.html</a>.
      </p>
      <HelloCase />
    </main>
  );
}
