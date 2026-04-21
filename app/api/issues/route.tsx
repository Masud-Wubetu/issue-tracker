import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/prisma/client';
import { createIssueSchema } from "../../validationSchemas";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session)
        return NextResponse.json({}, { status: 401 });

    const body = await request.json();
    const validation = createIssueSchema.safeParse(body);
    if (!validation.success)
        return NextResponse.json(validation.error.format(), { status: 400 });

    // For now, we take the first project. In a real app, this would come from the body or URL.
    const project = await prisma.project.findFirst();
    if (!project)
        return NextResponse.json({ error: 'No project found' }, { status: 404 });

    const newIssue = await prisma.issue.create({
        data: {
            title: body.title,
            description: body.description,
            priority: body.priority,
            type: body.type,
            projectId: project.id,
            reporterId: (session.user as any).id
        }
    });

    return NextResponse.json(newIssue, { status: 201 });
}


