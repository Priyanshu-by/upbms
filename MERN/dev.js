const { spawn } = require("node:child_process");
const path = require("node:path");

const root = __dirname;
const backendDir = path.join(root, "backend");
const frontendDir = path.join(root, "frontend");

console.log("==================================================");
console.log("Starting UPBMS MERN Stack (Backend + Frontend)...");
console.log("Backend:  http://127.0.0.1:5000");
console.log("Frontend: http://localhost:5174");
console.log("==================================================");

function run(name, cmd, args, cwd) {
  const proc = spawn(cmd, args, { cwd, shell: true, stdio: ["ignore", "pipe", "pipe"] });
  proc.stdout.on("data", (d) => {
    process.stdout.write(`[${name}] ${d}`);
  });
  proc.stderr.on("data", (d) => {
    process.stderr.write(`[${name}] ${d}`);
  });
  proc.on("exit", (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });
  return proc;
}

const backend = run("BACKEND", "node", ["src/index.js"], backendDir);
const frontend = run("FRONTEND", "node", ["node_modules/vite/bin/vite.js"], frontendDir);

function cleanup() {
  console.log("\nShutting down UPBMS services...");
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
