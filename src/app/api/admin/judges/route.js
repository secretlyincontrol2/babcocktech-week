import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const judges = await prisma.user.findMany({
    where: { role: "JUDGE" },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(judges);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const judge = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "JUDGE",
    },
  });

  await prisma.log.create({
    data: {
      action: "CREATE_JUDGE",
      details: `Created judge: ${email}`,
      userId: session.user.id,
    }
  });

  return NextResponse.json({ id: judge.id, name: judge.name, email: judge.email });
}
