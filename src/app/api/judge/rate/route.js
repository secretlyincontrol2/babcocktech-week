import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "JUDGE" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, criterionId, score, comment } = await req.json();

  if (!submissionId || !criterionId || score === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: {
      userId_submissionId_criterionId: {
        userId: session.user.id,
        submissionId,
        criterionId,
      },
    },
    update: { score: parseInt(score), comment },
    create: {
      userId: session.user.id,
      submissionId,
      criterionId,
      score: parseInt(score),
      comment,
    },
  });

  return NextResponse.json(rating);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "JUDGE" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    await prisma.rating.deleteMany({
      where: {
        userId: session.user.id,
        submissionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
