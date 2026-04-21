import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { prisma } from "@/prisma/client";
import { Box, Card, Flex, Grid, Heading, Table, Text, Button } from "@radix-ui/themes";
import { IssueStatusBadge, IssuePriorityBadge } from "@/app/component";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardFilters from "./DashboardFilters";
import { Status, Priority } from "@prisma/client";

interface Props {
  searchParams: Promise<{
    status?: Status;
    priority?: Priority;
    projectId?: string;
  }>;
}

export default async function UserDashboard({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const userId = (session.user as any).id;
  const resolvedParams = await searchParams;

  const filterWhere = {
    assigneeId: userId,
    ...(resolvedParams.status ? { status: resolvedParams.status } : {}),
    ...(resolvedParams.priority ? { priority: resolvedParams.priority } : {}),
    ...(resolvedParams.projectId ? { projectId: parseInt(resolvedParams.projectId) } : {}),
  };

  const [assignedIssues, reportedIssues, activityLogs, projects] = await Promise.all([
    prisma.issue.findMany({
      where: filterWhere,
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.issue.findMany({
      where: { reporterId: userId },
      include: { project: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      where: { userId },
      include: { issue: true },
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
    prisma.project.findMany({
        select: { id: true, name: true }
    })
  ]);

  const overdueCount = await prisma.issue.count({
    where: {
      assigneeId: userId,
      status: { not: "CLOSED" },
      dueDate: { lt: new Date() },
    },
  });

  const openCount = await prisma.issue.count({
    where: { assigneeId: userId, status: "OPEN" },
  });

  return (
    <Box>
      <Flex justify="between" align="end" mb="5">
        <Box>
            <Heading size="8" mb="1">My Dashboard</Heading>
            <Text color="gray">Personal workspace for {session.user?.name}</Text>
        </Box>
        <Button color="violet" asChild>
            <Link href="/issues/new">Create Issue</Link>
        </Button>
      </Flex>

      {/* Summary Cards */}
      <Grid columns={{ initial: "1", sm: "3" }} gap="4" mb="6">
        <Card size="2">
          <Flex direction="column" gap="1">
            <Text size="2" color="gray" weight="medium">Total Assigned</Text>
            <Text size="8" weight="bold">{assignedIssues.length}</Text>
          </Flex>
        </Card>
        <Card size="2" variant="surface" style={{ backgroundColor: 'var(--blue-2)' }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray" weight="medium">Open Tasks</Text>
            <Text size="8" weight="bold" color="blue">{openCount}</Text>
          </Flex>
        </Card>
        <Card size="2" variant="surface" style={{ backgroundColor: overdueCount > 0 ? 'var(--red-2)' : 'var(--green-2)' }}>
          <Flex direction="column" gap="1">
            <Text size="2" color="gray" weight="medium">Overdue</Text>
            <Text size="8" weight="bold" color={overdueCount > 0 ? "red" : "green"}>{overdueCount}</Text>
          </Flex>
        </Card>
      </Grid>

      <DashboardFilters projects={projects} />

      <Grid columns={{ initial: "1", md: "3" }} gap="6">
        {/* Assigned Issues */}
        <Box style={{ gridColumn: "span 2" }}>
          <Flex justify="between" align="center" mb="3">
            <Heading size="4">Assigned to Me</Heading>
            <Button variant="ghost" size="1" asChild>
                <Link href={`/issues?assigneeId=${userId}`}>View All</Link>
            </Button>
          </Flex>
          <Card>
            {assignedIssues.length === 0 ? (
                <Text color="gray" className="p-4 block text-center">No issues matching filters.</Text>
            ) : (
                <Table.Root>
                <Table.Header>
                    <Table.Row>
                    <Table.ColumnHeaderCell>Issue</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Priority</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {assignedIssues.map(issue => (
                    <Table.Row key={issue.id}>
                        <Table.Cell>
                        <Link href={`/issues/${issue.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Text size="2" weight="medium" className="hover:text-violet-600 cursor-pointer">
                            {issue.title}
                            </Text>
                        </Link>
                        <Text as="p" size="1" color="gray">{issue.project.name}</Text>
                        </Table.Cell>
                        <Table.Cell><IssueStatusBadge status={issue.status} /></Table.Cell>
                        <Table.Cell><IssuePriorityBadge priority={issue.priority} /></Table.Cell>
                        <Table.Cell>
                        {issue.dueDate ? (
                            <Text size="1" color={new Date(issue.dueDate) < new Date() ? "red" : "gray"}>
                            {new Date(issue.dueDate).toLocaleDateString()}
                            </Text>
                        ) : "—"}
                        </Table.Cell>
                    </Table.Row>
                    ))}
                </Table.Body>
                </Table.Root>
            )}
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Heading size="4" mb="3">My Activity</Heading>
          <Card>
            <Flex direction="column" gap="4">
              {activityLogs.length === 0 ? (
                <Text color="gray" className="p-4 block text-center">No recent activity.</Text>
              ) : (
                activityLogs.map(log => (
                  <Flex key={log.id} gap="3" align="start">
                    <Box mt="1">
                        <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--violet-9)' }} />
                    </Box>
                    <Box>
                      <Text size="2">
                        {log.action} <Link href={`/issues/${log.issueId}`} style={{ color: 'var(--violet-11)', fontWeight: 500 }}>
                          #{log.issueId}
                        </Link>
                      </Text>
                      <Text size="1" color="gray" as="p">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Box>
                  </Flex>
                ))
              )}
            </Flex>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}

export const dynamic = 'force-dynamic';
