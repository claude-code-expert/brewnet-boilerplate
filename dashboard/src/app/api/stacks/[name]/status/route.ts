import { NextResponse } from "next/server";
import { getStack } from "@/lib/stacks";
import { getPortsForStack } from "@/lib/ports";
import { getDockerStatus, checkHealth } from "@/lib/docker";
import type { StatusResponse, StackStatus } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const meta = getStack(name);
  if (!meta) {
    return NextResponse.json({ ok: false, message: "Stack not found" }, { status: 404 });
  }

  try {
    const ports = await getPortsForStack(name);
    if (!ports) {
      const body: StatusResponse = { status: "stopped", ports: null, healthy: false, errorMessage: null };
      return NextResponse.json(body);
    }

    const dockerState = await getDockerStatus(meta);
    if (!dockerState.running) {
      const body: StatusResponse = { status: "stopped", ports, healthy: false, errorMessage: null };
      return NextResponse.json(body);
    }

    const health = await checkHealth(ports, meta.isUnified);
    const status: StackStatus = health.healthy ? "running" : "starting";
    const body: StatusResponse = { status, ports, healthy: health.healthy, errorMessage: null };
    return NextResponse.json(body);
  } catch (err) {
    const body: StatusResponse = {
      status: "error",
      ports: null,
      healthy: false,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
    return NextResponse.json(body);
  }
}
