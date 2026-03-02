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
  console.log(`\n[START] ▶ POST /api/stacks/${name}/start`);

  const meta = getStack(name);
  if (!meta) {
    console.log(`[START] ✗ Stack not found: ${name}`);
    return NextResponse.json({ ok: false, message: "Stack not found" }, { status: 404 });
  }

  console.log(`[START] stack=${name} | stackDir=${meta.stackDir} | isUnified=${meta.isUnified}`);

  try {
    // Check if already running
    console.log(`[START] → checking existing port allocation for ${name}`);
    const existing = await getPortsForStack(name);
    if (existing) {
      console.log(`[START] existing ports: backend=${existing.backendPort} frontend=${existing.frontendPort}`);
      const dockerState = await getDockerStatus(meta);
      console.log(`[START] docker state: running=${dockerState.running} status=${dockerState.status}`);
      if (dockerState.running) {
        console.log(`[START] ✓ Already running — returning early`);
        const body: StartResponse = { ok: true, message: "Already running", ports: existing };
        return NextResponse.json(body);
      }
    } else {
      console.log(`[START] no existing port allocation`);
    }

    console.log(`[START] → ensureEnvFile(${meta.stackDir})`);
    await ensureEnvFile(meta.stackDir);
    console.log(`[START] ✓ .env ready`);

    console.log(`[START] → allocatePorts(${name}, isUnified=${meta.isUnified})`);
    const ports = await allocatePorts(name, meta.isUnified);
    console.log(`[START] ✓ ports allocated: backend=${ports.backendPort} frontend=${ports.frontendPort}`);

    console.log(`[START] → startStack(${name})`);
    await startStack(meta, ports);
    console.log(`[START] ✓ docker compose up -d --build completed`);

    const body: StartResponse = { ok: true, message: "Stack starting", ports };
    console.log(`[START] ✓ returning 202 Accepted`);
    return NextResponse.json(body, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[START] ✗ ERROR for ${name}:`, message);
    if (err instanceof Error && err.stack) {
      console.error(`[START] stack trace:`, err.stack);
    }
    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}
