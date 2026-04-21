import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(projects);
}
