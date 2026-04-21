import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/prisma/client";
import { Avatar, Badge, Box, Button, Card, Flex, Grid, Heading, Table, Text } from "@radix-ui/themes";
import { IssueStatusBadge, IssuePriorityBadge } from "@/app/component";
import Link from "next/link";
import { ArrowLeftIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Metadata } from "next";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await prisma.project.findUnique({ where: { id: parseInt(params.id) }, select: { name: true } });
  return { title: project?.name ?? "Project" };
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <Card>
    <Flex direction="column" gap="1" p="1">
      <Text size="1" color="gray" weight="medium">{label}</Text>
      <Text size="7" weight="bold" style={{ color }}>{value}</Text>
    </Flex>
  </Card>
);

export default async function ProjectDashboardPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [project, issueStats] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        members: { select: { id: true, name: true, email: true, image: true, role: true } },
        issues: {
          select: { id: true, title: true, status: true, priority: true, type: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { issues: true, members: true } },
      },
    }),
    prisma.issue.groupBy({
      by: ["status"],
      where: { projectId: id },
      _count: { id: true },
    }),
  ]);

  if (!project) notFound();

  const stats: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, IN_REVIEW: 0, RESOLVED: 0, CLOSED: 0 };
  issueStats.forEach(({ status, _count }) => { stats[status] = _count.id; });

  const role = (session.user as any).role;
  const canManage = ["ADMIN", "MANAGER"].includes(role);

  return (
    <Box>
      {/* Header */}
      <Flex justify="between" align="start" mb="6">
        <Flex direction="column" gap="2">
          <Button variant="ghost" size="1" asChild>
            <Link href="/projects"><ArrowLeftIcon /> All Projects</Link>
          </Button>
          <Heading size="7">{project.name}</Heading>
          {project.description && <Text color="gray">{project.description}</Text>}
        </Flex>
        {canManage && (
          <Button variant="soft" color="violet" asChild>
            <Link href={`/projects/${id}/edit`}><Pencil1Icon /> Edit Project</Link>
          </Button>
        )}
      </Flex>

      {/* Issue Stats */}
      <Heading size="3" mb="3">Issue Overview</Heading>
      <Grid columns={{ initial: "2", sm: "3", md: "6" }} gap="3" mb="6">
        <StatCard label="Total" value={project._count.issues} color="var(--violet-11)" />
        <StatCard label="Open" value={stats.OPEN} color="var(--red-11)" />
        <StatCard label="In Progress" value={stats.IN_PROGRESS} color="var(--violet-11)" />
        <StatCard label="In Review" value={stats.IN_REVIEW} color="var(--blue-11)" />
        <StatCard label="Resolved" value={stats.RESOLVED} color="var(--green-11)" />
        <StatCard label="Closed" value={stats.CLOSED} color="var(--gray-11)" />
      </Grid>

      <Grid columns={{ initial: "1", md: "3" }} gap="5">
        {/* Recent Issues */}
        <Box style={{ gridColumn: "span 2" }}>
          <Flex justify="between" align="center" mb="3">
            <Heading size="3">Recent Issues</Heading>
            <Button size="1" variant="soft" asChild>
              <Link href={`/issues?projectId=${id}`}>View All</Link>
            </Button>
          </Flex>
          <Card>
            {project.issues.length === 0 ? (
              <Flex align="center" justify="center" p="6">
                <Text color="gray">No issues yet.</Text>
              </Flex>
            ) : (
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Priority</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {project.issues.map(issue => (
                    <Table.Row key={issue.id}>
                      <Table.Cell>
                        <Link href={`/issues/${issue.id}`} className="hover:text-violet-600 transition-colors">
                          <Text size="2">{issue.title}</Text>
                        </Link>
                      </Table.Cell>
                      <Table.Cell><IssueStatusBadge status={issue.status} /></Table.Cell>
                      <Table.Cell><IssuePriorityBadge priority={issue.priority} /></Table.Cell>
                      <Table.Cell>
                        <Text size="1" color="gray">{new Date(issue.createdAt).toLocaleDateString()}</Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card>
        </Box>

        {/* Team Members */}
        <Box>
          <Heading size="3" mb="3">Team ({project._count.members})</Heading>
          <Card>
            {project.members.length === 0 ? (
              <Flex align="center" justify="center" p="6">
                <Text color="gray">No members assigned.</Text>
              </Flex>
            ) : (
              <Flex direction="column" gap="3" p="1">
                {project.members.map(m => {
                  const initials = (m.name || m.email || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <Flex key={m.id} align="center" gap="3">
                      <Avatar src={m.image ?? undefined} fallback={initials} size="2" radius="full" color="violet" />
                      <Box>
                        <Text as="p" size="2" weight="medium">{m.name}</Text>
                        <Badge size="1" color="gray">{m.role}</Badge>
                      </Box>
                    </Flex>
                  );
                })}
              </Flex>
            )}
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}
