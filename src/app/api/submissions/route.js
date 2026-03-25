import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { teamName, projectTitle, description, githubUrl, demoUrl } = await req.json();

  if (!teamName || !projectTitle || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      ownerName: teamName,
      title: projectTitle,
      description,
      githubUrl,
      demoUrl,
    },
  });

  return NextResponse.json(submission);
}

export async function GET() {
  const submissions = await prisma.submission.findMany({
    include: {
      ratings: {
        select: {
          id: true,
          score: true,
          userId: true,
          criterionId: true,
        }
      }
    }
  });
  return NextResponse.json(submissions);
}
