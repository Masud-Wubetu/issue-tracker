import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/prisma/client';
import { createIssueSchema } from "../../validationSchemas";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function POST(request: NextRequest) {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.error("Auth session error:", error);
    }
    
    // Determine reporter ID: either logged-in user or the default Visitor
    let reporterId: string;
    
    if (session) {
        reporterId = (session.user as any).id;
    } else {
        const visitor = await prisma.user.upsert({
            where: { email: 'visitor@issuetracker.com' },
            update: {},
            create: { 
                email: 'visitor@issuetracker.com', 
                name: 'Visitor', 
                role: 'VIEWER' 
            }
        });
        reporterId = visitor.id;
    }


    const body = await request.json();


    const validation = createIssueSchema.safeParse(body);
    if (!validation.success)
        return NextResponse.json(validation.error.format(), { status: 400 });

    // For now, we take the first project. In a real app, this would come from the body or URL.
    let project = await prisma.project.findFirst();
    if (!project) {
        project = await prisma.project.create({
            data: { name: 'Default Project', description: 'Internal Project' }
        });
    }


    const newIssue = await prisma.issue.create({
        data: {
            title: body.title,
            description: body.description,
            priority: body.priority,
            type: body.type,
            projectId: project.id,
            reporterId: reporterId
        }
    });

    return NextResponse.json(newIssue, { status: 201 });
}


