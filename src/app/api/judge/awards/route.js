import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "JUDGE") {
    // If not a judge, unauthorized
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Judges can see submissions to award them
  const submissions = await prisma.submission.findMany({
    include: {
      ratings: true
    }
  });

  return NextResponse.json(submissions);
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "JUDGE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, winnerCategory } = await req.json();
    const updated = await prisma.submission.update({
      where: { id },
      data: { winnerCategory }
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
