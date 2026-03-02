import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import type { StackMeta, PortAllocation } from "./types";

const execAsync = promisify(exec);

export async function ensureEnvFile(stackDir: string): Promise<void> {
  const envPath = path.join(stackDir, ".env");
  const examplePath = path.join(stackDir, ".env.example");
  try {
    await fs.access(envPath);
  } catch {
    let content = await fs.readFile(examplePath, "utf-8");
    content = content.replace(/^DB_DRIVER=.*/m, "DB_DRIVER=sqlite3");
    await fs.writeFile(envPath, content, "utf-8");
  }
}

export async function startStack(
  meta: StackMeta,
  ports: PortAllocation
): Promise<void> {
  const cmd = [
    "docker compose",
    `-f "${meta.stackDir}/docker-compose.yml"`,
    `--project-name brewnet-${meta.name}`,
    `-e BACKEND_PORT=${ports.backendPort}`,
    `-e FRONTEND_PORT=${ports.frontendPort}`,
    `-e DB_DRIVER=sqlite3`,
    "up -d --build",
  ].join(" ");

  await execAsync(cmd, { cwd: meta.stackDir });
}

export async function stopStack(meta: StackMeta): Promise<void> {
  const cmd = [
    "docker compose",
    `-f "${meta.stackDir}/docker-compose.yml"`,
    `--project-name brewnet-${meta.name}`,
    "down",
  ].join(" ");

  await execAsync(cmd, { cwd: meta.stackDir });
}

interface HealthResult {
  healthy: boolean;
  dockerStatus: string;
}

export async function checkHealth(
  ports: PortAllocation,
  isUnified: boolean
): Promise<HealthResult> {
  const port = isUnified ? ports.frontendPort : ports.backendPort;
  try {
    const res = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return { healthy: res.ok, dockerStatus: "running" };
  } catch {
    try {
      const res = await fetch(`http://localhost:${port}/`, {
        signal: AbortSignal.timeout(3000),
      });
      return { healthy: res.ok, dockerStatus: "running" };
    } catch {
      return { healthy: false, dockerStatus: "starting" };
    }
  }
}

interface ContainerState {
  running: boolean;
  status: string;
}

export async function getDockerStatus(
  meta: StackMeta
): Promise<ContainerState> {
  try {
    const { stdout } = await execAsync(
      [
        "docker compose",
        `-f "${meta.stackDir}/docker-compose.yml"`,
        `--project-name brewnet-${meta.name}`,
        "ps --format json",
      ].join(" "),
      { cwd: meta.stackDir }
    );

    const lines = stdout.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return { running: false, status: "stopped" };

    let anyRunning = false;
    for (const line of lines) {
      try {
        const obj = JSON.parse(line) as { State?: string; Status?: string };
        const state = (obj.State ?? obj.Status ?? "").toLowerCase();
        if (state === "running") anyRunning = true;
      } catch {
        // skip malformed lines
      }
    }
    return { running: anyRunning, status: anyRunning ? "running" : "stopped" };
  } catch {
    return { running: false, status: "stopped" };
  }
}
