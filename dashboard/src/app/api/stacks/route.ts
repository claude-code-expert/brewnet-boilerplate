import { NextResponse } from "next/server";
import { STACKS } from "@/lib/stacks";
import { getPortsForStack } from "@/lib/ports";
import { getDockerStatus, checkHealth } from "@/lib/docker";
import type { StackInfo, StackStatus } from "@/lib/types";

export async function GET() {
  const results: StackInfo[] = await Promise.all(
    STACKS.map(async (meta) => {
      try {
        const ports = await getPortsForStack(meta.name);
        if (!ports) {
          return { ...meta, status: "stopped" as StackStatus, ports: null, errorMessage: null };
        }

        const dockerState = await getDockerStatus(meta);
        if (!dockerState.running) {
          return { ...meta, status: "stopped" as StackStatus, ports, errorMessage: null };
        }

        const health = await checkHealth(ports, meta.isUnified);
        const status: StackStatus = health.healthy ? "running" : "starting";
        return { ...meta, status, ports, errorMessage: null };
      } catch (err) {
        return {
          ...meta,
          status: "error" as StackStatus,
          ports: null,
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  return NextResponse.json(results);
}
