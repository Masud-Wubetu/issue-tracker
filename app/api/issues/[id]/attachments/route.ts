import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const issueId = parseInt(id);
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const attachment = await prisma.attachment.create({
        data: {
            filename: file.name,
            url: `/uploads/${uniqueName}`,
            size: file.size,
            mimeType: file.type,
            issueId,
        },
    });

    await prisma.activityLog.create({
        data: {
            action: `Uploaded attachment: ${file.name}`,
            issueId,
            userId: (session.user as any).id,
        }
    });

    return NextResponse.json(attachment, { status: 201 });
}


export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { attachmentId } = body;
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const filePath = path.join(process.cwd(), "public", attachment.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.activityLog.create({
        data: {
            action: `Deleted attachment: ${attachment.filename}`,
            issueId: attachment.issueId,
            userId: (session.user as any).id,
        }
    });

    await prisma.attachment.delete({ where: { id: attachmentId } });
    return NextResponse.json({ success: true });
}

