import { NextResponse } from "next/server";
import { getStack } from "@/lib/stacks";
import { getPortsForStack } from "@/lib/ports";
import type { ProxyRequest, ProxyResponse } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const meta = getStack(name);
  if (!meta) {
    return NextResponse.json({ ok: false, message: "Stack not found" }, { status: 404 });
  }

  const ports = await getPortsForStack(name);
  if (!ports) {
    return NextResponse.json({ ok: false, message: "Stack not running" }, { status: 503 });
  }

  const { endpoint, method, body }: ProxyRequest = await req.json();
  const port = meta.isUnified ? ports.frontendPort : ports.backendPort;
  const url = `http://localhost:${port}${endpoint}`;

  const start = Date.now();
  try {
    const fetchOptions: RequestInit = {
      method,
      signal: AbortSignal.timeout(10000),
    };
    if (body && method !== "GET" && method !== "HEAD") {
      fetchOptions.headers = { "Content-Type": "application/json" };
      fetchOptions.body = body;
    }

    const res = await fetch(url, fetchOptions);
    const durationMs = Date.now() - start;

    let data: unknown;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    const responseBody: ProxyResponse = { ok: res.ok, status: res.status, data, durationMs };
    return NextResponse.json(responseBody);
  } catch (err) {
    const durationMs = Date.now() - start;
    const responseBody: ProxyResponse = {
      ok: false,
      status: 0,
      data: null,
      durationMs,
      error: err instanceof Error ? err.message : String(err),
    };
    return NextResponse.json(responseBody, { status: 502 });
  }
}
