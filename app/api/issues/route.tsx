import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/prisma/client';
import { createIssueSchema } from "../../validationSchemas";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    const issues = await prisma.issue.findMany({
        where: {
            ...(status ? { status: status as any } : {}),
            ...(projectId ? { projectId: parseInt(projectId) } : {}),
        },
        include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true, image: true } },
            reporter: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(issues);
}

export async function POST(request: NextRequest) {
    let session = null;
    try { session = await getServerSession(authOptions); } catch {}

    let reporterId: string;
    if (session) {
        reporterId = (session.user as any).id;
    } else {
        const visitor = await prisma.user.upsert({
            where: { email: 'visitor@issuetracker.com' },
            update: {},
            create: { email: 'visitor@issuetracker.com', name: 'Visitor', role: 'VIEWER' }
        });
        reporterId = visitor.id;
    }

    const body = await request.json();
    const validation = createIssueSchema.safeParse(body);
    if (!validation.success)
        return NextResponse.json(validation.error.format(), { status: 400 });

    const { title, description, priority, type, projectId, assigneeId, dueDate } = validation.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project)
        return NextResponse.json({ error: 'Project not found.' }, { status: 400 });

    const newIssue = await prisma.issue.create({
        data: {
            title,
            description: description || '',
            priority,
            type,
            projectId,
            reporterId,
            ...(assigneeId ? { assigneeId } : {}),
            ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        }
    });
    return NextResponse.json(newIssue, { status: 201 });
}
