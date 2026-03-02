import { NextResponse } from "next/server";
import { getStack } from "@/lib/stacks";
import { allocatePorts, getPortsForStack } from "@/lib/ports";
import { ensureEnvFile, startStack, getDockerStatus } from "@/lib/docker";
import type { StartResponse } from "@/lib/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const meta = getStack(name);
  if (!meta) {
    return NextResponse.json({ ok: false, message: "Stack not found" }, { status: 404 });
  }

  try {
    // Check if already running
    const existing = await getPortsForStack(name);
    if (existing) {
      const dockerState = await getDockerStatus(meta);
      if (dockerState.running) {
        const body: StartResponse = { ok: true, message: "Already running", ports: existing };
        return NextResponse.json(body);
      }
    }

    await ensureEnvFile(meta.stackDir);
    const ports = await allocatePorts(name, meta.isUnified);
    await startStack(meta, ports);

    const body: StartResponse = { ok: true, message: "Stack starting", ports };
    return NextResponse.json(body, { status: 202 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
