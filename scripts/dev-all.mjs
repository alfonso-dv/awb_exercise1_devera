// Starts the dev backend and the Vite dev server together (one terminal).
// Works on Windows, macOS and Linux. Ctrl+C stops both.
import { spawn } from "node:child_process";

const commands = [
  ["api", "npm run api"],
  ["vite", "npm run dev"]
];

const children = commands.map(([name, command]) => {
  const child = spawn(command, { shell: true, stdio: "inherit" });
  child.on("exit", (code) => {
    console.log(`[${name}] exited with code ${code}`);
    for (const other of children) if (other !== child) other.kill();
    process.exit(code ?? 0);
  });
  return child;
});

process.on("SIGINT", () => {
  for (const child of children) child.kill("SIGINT");
});
