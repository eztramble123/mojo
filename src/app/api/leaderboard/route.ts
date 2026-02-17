import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "totalReps";
  const limit = Math.min(Number(searchParams.get("limit") || 20), 100);

  const validSorts = ["totalReps", "level", "wins", "strength", "agility", "endurance"];
  const orderField = validSorts.includes(sort) ? sort : "totalReps";

  const fighters = await prisma.fighter.findMany({
    orderBy: { [orderField]: "desc" },
    take: limit,
  });

  const ranked = fighters.map((f, i) => ({
    rank: i + 1,
    address: f.address,
    username: f.username,
    strength: f.strength,
    agility: f.agility,
    endurance: f.endurance,
    totalReps: f.totalReps,
    level: f.level,
    wins: f.wins,
    losses: f.losses,
    value: String(f[orderField as keyof typeof f] ?? 0),
    label: orderField,
  }));

  return NextResponse.json(ranked);
}
