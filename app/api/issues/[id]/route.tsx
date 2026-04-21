import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = patchIssueSchema.safeParse(body);
  if (!validation.success) {
    console.error("Validation error:", validation.error.format());
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const { assigneeId, title, description, status, priority, type, dueDate, projectId } = validation.data;

  if (assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!user) return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  const id = parseInt(idParam);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        type,
        assigneeId,
        ...(projectId ? { projectId } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
      },
    });

    // Log activity for significant changes
    if (status) {
        await prisma.activityLog.create({
            data: {
                action: `Changed status to ${status}`,
                issueId: id,
                userId: (session.user as any).id,
            }
        });
    }

    if (assigneeId !== undefined) {
        await prisma.activityLog.create({
            data: {
                action: assigneeId ? "Assigned the issue" : "Unassigned the issue",
                issueId: id,
                userId: (session.user as any).id,
            }
        });
    }

    return NextResponse.json(updatedIssue);

  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "MANAGER")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });


  const issue = await prisma.issue.findUnique({ where: { id: parseInt(idParam) } });
  if (!issue) return NextResponse.json({ error: "Invalid issue" }, { status: 404 });

  await prisma.issue.delete({ where: { id: issue.id } });
  return NextResponse.json({});
}
