import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const fighter = await prisma.fighter.findUnique({
    where: { address: address.toLowerCase() },
  });

  if (!fighter) {
    return NextResponse.json({ error: "Fighter not found" }, { status: 404 });
  }

  return NextResponse.json(fighter);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const body = await request.json();
  const { username } = body;

  if (!username || typeof username !== "string" || username.length > 32) {
    return NextResponse.json(
      { error: "Username must be a string of 32 characters or less" },
      { status: 400 }
    );
  }

  const fighter = await prisma.fighter.update({
    where: { address: address.toLowerCase() },
    data: { username },
  });

  return NextResponse.json(fighter);
}
