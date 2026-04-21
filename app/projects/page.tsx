import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import ProjectsClient from "./_components/ProjectsClient";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");
  const role = (session.user as any).role;
  return <ProjectsClient userRole={role} />;
}
