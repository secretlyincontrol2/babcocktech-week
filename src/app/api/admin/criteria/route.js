import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "JUDGE")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const criteria = await prisma.criterion.findMany();
  return NextResponse.json(criteria);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, maxScore } = await req.json();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const criterion = await prisma.criterion.create({
    data: { name, maxScore: parseInt(maxScore) || 10 },
  });

  await prisma.log.create({
    data: {
      action: "CREATE_CRITERION",
      details: `Created criterion: ${name}`,
      userId: session.user.id,
    }
  });

  return NextResponse.json(criterion);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing criterion ID" }, { status: 400 });

    // Delete related ratings first, then the criterion
    await prisma.rating.deleteMany({ where: { criterionId: id } });
    await prisma.criterion.delete({ where: { id } });

    await prisma.log.create({
      data: {
        action: "DELETE_CRITERION",
        details: `Deleted criterion: ${id}`,
        userId: session.user.id,
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
