import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    include: {
      ratings: {
        include: { user: { select: { name: true } } }
      }
    }
  });

  return NextResponse.json(submissions);
}
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
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

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Delete ratings first
    await prisma.rating.deleteMany({ where: { submissionId: id } });
    
    // Delete submission
    const deleted = await prisma.submission.delete({
      where: { id }
    });

    await prisma.log.create({
      data: {
        action: "DELETE_SUBMISSION",
        details: `Deleted project: ${deleted.title}`,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
