import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { z } from "zod";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(idParam);
  const [project, issueStats] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        members: { select: { id: true, name: true, email: true, image: true, role: true } },
        issues: {
          select: { id: true, title: true, status: true, priority: true, type: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { issues: true, members: true } },
      },
    }),
    prisma.issue.groupBy({
      by: ["status"],
      where: { projectId: id },
      _count: { id: true },
    }),
  ]);

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stats: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, IN_REVIEW: 0, RESOLVED: 0, CLOSED: 0 };
  issueStats.forEach(({ status, _count }) => { stats[status] = _count.id; });

  return NextResponse.json({ ...project, stats });
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "MANAGER"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const { name, description, memberIds } = validation.data;
  const project = await prisma.project.update({
    where: { id: parseInt(id) },
    data: {
      ...(name ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(memberIds !== undefined ? { members: { set: memberIds.map(mid => ({ id: mid })) } } : {}),
    },
    include: {
      members: { select: { id: true, name: true, email: true, image: true, role: true } },
      _count: { select: { issues: true, members: true } },
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = parseInt(idParam);
  const count = await prisma.issue.count({ where: { projectId: id } });
  if (count > 0)
    return NextResponse.json(
      { error: `Cannot delete: this project has ${count} issue(s). Remove them first.` },
      { status: 400 }
    );

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
