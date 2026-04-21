import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { z } from "zod";

const projectInclude = {
  members: { select: { id: true, name: true, email: true, image: true, role: true } },
  _count: { select: { issues: true, members: true } },
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "MANAGER"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const validation = createSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const { name, description, memberIds } = validation.data;
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ...(memberIds?.length ? { members: { connect: memberIds.map(id => ({ id })) } } : {}),
    },
    include: projectInclude,
  });
  return NextResponse.json(project, { status: 201 });
}
