import { prisma } from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import bcrypt from "bcrypt";
import { z } from "zod";

const userSelect = {
  id: true, name: true, email: true, role: true,
  isActive: true, image: true, createdAt: true,
  projects: { select: { id: true, name: true } },
  _count: { select: { assignedIssues: true, reportedIssues: true } },
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as any } : {}),
      ...(isActive !== null ? { isActive: isActive === "true" } : {}),
    },
    select: userSelect,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(5),
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "QA", "VIEWER"]).default("DEVELOPER"),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const validation = createSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing)
    return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });

  const hashedPassword = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: { name: body.name, email: body.email, password: hashedPassword, role: body.role },
    select: userSelect,
  });
  return NextResponse.json(user, { status: 201 });
}
