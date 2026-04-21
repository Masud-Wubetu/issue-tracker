import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { z } from "zod";

const userSelect = {
  id: true, name: true, email: true, role: true,
  isActive: true, image: true, createdAt: true,
  projects: { select: { id: true, name: true } },
  _count: { select: { assignedIssues: true, reportedIssues: true } },
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: params.id }, select: userSelect });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

const updateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "QA", "VIEWER"]).optional(),
  isActive: z.boolean().optional(),
  projectIds: z.array(z.number()).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const validation = updateSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const { role, isActive, projectIds } = validation.data;
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(role !== undefined ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(projectIds !== undefined ? { projects: { set: projectIds.map(id => ({ id })) } } : {}),
    },
    select: userSelect,
  });
  return NextResponse.json(user);
}
