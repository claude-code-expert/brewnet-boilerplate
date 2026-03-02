import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getStack } from "@/lib/stacks";

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
    const readmePath = path.join(meta.stackDir, "README.md");
    const content = await fs.readFile(readmePath, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { ok: false, message: "README.md not found" },
      { status: 404 }
    );
  }
}
