import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const issues = await prisma.issue.findMany({
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true, email: true } },
      reporter: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID", "Title", "Project", "Type", "Priority", "Status", 
    "Assignee Name", "Assignee Email", "Reporter Name", "Due Date", "Created At"
  ];

  const rows = issues.map(issue => [
    issue.id,
    `"${issue.title.replace(/"/g, '""')}"`,
    `"${issue.project.name}"`,
    issue.type,
    issue.priority,
    issue.status,
    `"${issue.assignee?.name || 'Unassigned'}"`,
    `"${issue.assignee?.email || ''}"`,
    `"${issue.reporter.name}"`,
    issue.dueDate ? issue.dueDate.toISOString().split('T')[0] : "",
    issue.createdAt.toISOString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="issue_report_${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
