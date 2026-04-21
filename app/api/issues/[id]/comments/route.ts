import authOptions from "@/app/auth/authOptions";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1).max(65535),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { issueId: parseInt(id) },
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = createCommentSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(id) },
  });
  if (!issue)
    return NextResponse.json({ error: "Invalid issue" }, { status: 404 });

  const newComment = await prisma.comment.create({
    data: {
      content: body.content,
      issueId: issue.id,
      userId: (session.user as any).id,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true, role: true },
      },
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "Added a comment",
      issueId: issue.id,
      userId: (session.user as any).id,
    },
  });

  return NextResponse.json(newComment, { status: 201 });
}

