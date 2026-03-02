import fs from "fs/promises";
import net from "net";
import path from "path";
import type { PortAllocation, PortsState } from "./types";

async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => { server.close(); resolve(true); });
    server.listen(port, "0.0.0.0");
  });
}

const BACKEND_PORT_START = 8081;
const FRONTEND_PORT_START = 3001;
const TOTAL_SLOTS = 16;

export const PORTS_FILE = path.join(process.cwd(), ".ports.json");

let lockChain: Promise<void> = Promise.resolve();

async function readPortsState(): Promise<PortsState> {
  try {
    const raw = await fs.readFile(PORTS_FILE, "utf-8");
    return JSON.parse(raw) as PortsState;
  } catch {
    return { allocations: [] };
  }
}

async function writePortsState(state: PortsState): Promise<void> {
  await fs.writeFile(PORTS_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export async function allocatePorts(
  stackName: string,
  isUnified: boolean
): Promise<PortAllocation> {
  return new Promise((resolve, reject) => {
    lockChain = lockChain.then(async () => {
      try {
        const state = await readPortsState();
        const existing = state.allocations.find(
          (a) => a.stackName === stackName
        );
        if (existing) {
          resolve(existing);
          return;
        }

        const usedBackend = new Set(state.allocations.map((a) => a.backendPort));
        const usedFrontend = new Set(
          state.allocations.map((a) => a.frontendPort)
        );

        let backendPort = -1;
        let frontendPort = -1;

        for (let i = 0; i < TOTAL_SLOTS; i++) {
          const fp = FRONTEND_PORT_START + i;
          if (!usedFrontend.has(fp) && await isPortFree(fp)) {
            frontendPort = fp;
            break;
          }
        }
        if (frontendPort === -1) throw new Error("No frontend ports available");

        if (isUnified) {
          backendPort = frontendPort;
        } else {
          for (let i = 0; i < TOTAL_SLOTS; i++) {
            const bp = BACKEND_PORT_START + i;
            if (!usedBackend.has(bp) && await isPortFree(bp)) {
              backendPort = bp;
              break;
            }
          }
          if (backendPort === -1) throw new Error("No backend ports available");
        }

        const allocation: PortAllocation = {
          stackName,
          backendPort,
          frontendPort,
          allocatedAt: new Date().toISOString(),
        };
        state.allocations.push(allocation);
        await writePortsState(state);
        resolve(allocation);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function releasePorts(stackName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    lockChain = lockChain.then(async () => {
      try {
        const state = await readPortsState();
        state.allocations = state.allocations.filter(
          (a) => a.stackName !== stackName
        );
        await writePortsState(state);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function getPortsForStack(
  stackName: string
): Promise<PortAllocation | null> {
  const state = await readPortsState();
  return state.allocations.find((a) => a.stackName === stackName) ?? null;
}

export async function getAllAllocations(): Promise<PortAllocation[]> {
  const state = await readPortsState();
  return state.allocations;
}
