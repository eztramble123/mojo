import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runIndexer } from "@/lib/indexer";

export async function POST() {
  try {
    await runIndexer(prisma);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
