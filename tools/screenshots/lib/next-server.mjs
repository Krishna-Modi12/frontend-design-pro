/**
 * Starting and stopping a Next server, shared by capture.mjs and verify.mjs.
 *
 * Both scripts need the same three things and got them subtly wrong in the same
 * way, so they live here once.
 */
import { spawn } from "node:child_process";

const IS_WIN = process.platform === "win32";
const NPX = IS_WIN ? "npx.cmd" : "npx";

/** Run a command to completion, inheriting stdio. Rejects on a non-zero exit. */
export function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: IS_WIN });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`)),
    );
    child.on("error", reject);
  });
}

/** Returns the PIDs of any process currently LISTENING on `port`, or []. */
function findPidsOnPort(port) {
  return new Promise((resolve) => {
    const cmd = IS_WIN ? "netstat" : "lsof";
    const args = IS_WIN ? ["-ano"] : ["-i", `:${port}`, "-sTCP:LISTEN", "-t"];
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "ignore"], shell: IS_WIN });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("error", () => resolve([]));
    child.on("exit", () => {
      if (IS_WIN) {
        const pids = new Set();
        for (const line of out.split("\n")) {
          const m = line.match(/^\s*TCP\s+\S*:(\d+)\s+\S+\s+LISTENING\s+(\d+)/);
          if (m && Number(m[1]) === port) pids.add(m[2]);
        }
        resolve([...pids]);
      } else {
        resolve(
          out
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }
    });
  });
}

/**
 * Kills whatever is already listening on `port`, if anything.
 *
 * A prior `startNextServer` run that was interrupted — backgrounded, killed,
 * or timed out — before reaching its own `finally` block leaves an orphaned
 * Next server holding the port. The next real run doesn't fail to bind; it
 * hits the stale server instead, which usually answers mid-recompile with an
 * `HTTP 500` that reads like a regression in the code under test and is not.
 * This automates the diagnose-and-kill sequence (netstat/lsof, then a
 * targeted kill by PID) rather than a blanket kill-by-process-name, which
 * risks taking out unrelated `node`/`next` processes sharing the same
 * executable name.
 */
export async function killStalePort(port) {
  const pids = await findPidsOnPort(port);
  if (pids.length === 0) return;
  console.log(`  port ${port} already in use (pid ${pids.join(", ")}) — clearing stale server…`);
  for (const pid of pids) {
    await new Promise((resolve) => {
      if (IS_WIN) {
        const killer = spawn("taskkill", ["/PID", pid, "/T", "/F"], { stdio: "ignore", shell: true });
        killer.on("exit", () => resolve());
        killer.on("error", () => resolve());
      } else {
        try {
          process.kill(Number(pid), "SIGTERM");
        } catch {
          return resolve();
        }
        setTimeout(() => {
          try {
            process.kill(Number(pid), "SIGKILL");
          } catch {
            /* already gone */
          }
          resolve();
        }, 2000);
      }
    });
  }
  // A killed process, especially on Windows, doesn't release its socket the
  // instant the kill command exits — `taskkill /F` (and this repo's own
  // `stop()`, the same shape) resolves as soon as the *killer* exits, not
  // when the OS finishes tearing the target down. Spawning straight into
  // that window found the exact failure this function exists to prevent:
  // the new server binds to a port the old one hasn't fully released, and
  // `waitForServer` spends its whole timeout getting an HTTP 500 from
  // whichever process actually answers. Poll until the port is genuinely
  // free instead of guessing at a fixed delay.
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if ((await findPidsOnPort(port)).length === 0) return;
    await new Promise((r) => setTimeout(r, 200));
  }
}

export async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "no response";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return;
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = String(e.cause?.code ?? e.name ?? e);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server never became ready at ${url} (last: ${lastError})`);
}

/**
 * `next dev|start` on a port, with a stop() that actually stops it.
 *
 * The naive version leaks. On Windows `shell: true` puts a cmd.exe between us
 * and npx, and npx puts another process between that and next, so `child.kill()`
 * kills the shell and leaves the server holding the port — the next run then
 * fails with "server never became ready" against a port that is very much in
 * use, which reads like a timeout and is not. taskkill /T walks the tree; on
 * POSIX the equivalent is a detached child and a signal to its process group.
 */
export async function startNextServer({ cwd, port, mode = "start" }) {
  await killStalePort(port);
  const child = spawn(NPX, ["next", mode, "-p", String(port)], {
    cwd,
    stdio: "ignore",
    shell: IS_WIN,
    detached: !IS_WIN,
  });

  let stopped = false;
  const stop = () =>
    new Promise((resolve) => {
      if (stopped || child.pid === undefined) return resolve();
      stopped = true;
      if (IS_WIN) {
        // /T the tree, /F because Next ignores a polite signal from a dead shell.
        const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
          shell: true,
        });
        killer.on("exit", () => resolve());
        killer.on("error", () => resolve());
      } else {
        // Wait for the process to actually exit, not just for the signal to be
        // delivered. verify.mjs runs `next build` against the same .next
        // directory immediately after stopping the dev server, and resolving
        // early races that build against the dying server's own cleanup.
        const done = () => resolve();
        child.once("exit", done);
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          child.off("exit", done);
          return resolve(); // already gone
        }
        // SIGKILL anything still up after a grace period, so a wedged server
        // cannot hang the run indefinitely.
        setTimeout(() => {
          try {
            process.kill(-child.pid, "SIGKILL");
          } catch {
            /* gone in the meantime */
          }
          resolve();
        }, 5000).unref();
      }
    });

  return { child, stop };
}

export { IS_WIN, NPX };
