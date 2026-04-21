import authOptions from "@/app/auth/authOptions";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const patchCommentSchema = z.object({
  content: z.string().min(1).max(65535),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = patchCommentSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  // Only owner or Admin can edit
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (comment.userId !== userId && role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updatedComment = await prisma.comment.update({
    where: { id: comment.id },
    data: { content: body.content },
    include: {
      user: { select: { id: true, name: true, image: true, role: true } },
    },
  });

  return NextResponse.json(updatedComment);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  // Only owner or Admin/Manager can delete
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (comment.userId !== userId && !["ADMIN", "MANAGER"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.delete({ where: { id: comment.id } });
  return NextResponse.json({});
}
