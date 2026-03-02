import { NextResponse } from "next/server";
import { getStack } from "@/lib/stacks";
import { releasePorts } from "@/lib/ports";
import { stopStack } from "@/lib/docker";
import type { StopResponse } from "@/lib/types";

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
    await stopStack(meta);
    await releasePorts(name);

    const body: StopResponse = { ok: true, message: "Stack stopped" };
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
