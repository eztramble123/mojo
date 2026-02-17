import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") || 20), 100);

  const where: Record<string, unknown> = {};
  if (status !== null && status !== "") {
    where.status = Number(status);
  }

  const sessions = await prisma.session.findMany({
    where,
    orderBy: { id: "desc" },
    take: limit,
  });

  return NextResponse.json(sessions);
}
