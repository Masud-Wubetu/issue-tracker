import { prisma } from "@/prisma/client";
import { Box, Card, Flex, Grid, Heading, Text, Table, Button } from "@radix-ui/themes";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { redirect } from "next/navigation";
import { DownloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import IssueChart from "../IssueChart";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return (
      <Flex direction="column" align="center" justify="center" mt="9">
        <Heading color="red">Access Denied</Heading>
        <Text>You do not have permission to view advanced reports.</Text>
      </Flex>
    );
  }

  const [usersWithCounts, projectsWithCounts, globalStats] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { assignedIssues: true },
        },
      },
      orderBy: { assignedIssues: { _count: 'desc' } },
      take: 10,
    }),
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { issues: true } },
        issues: {
          select: { status: true }
        }
      },
    }),
    prisma.issue.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ]);

  const statsMap = Object.fromEntries(globalStats.map(s => [s.status, s._count.id]));
  const open = statsMap['OPEN'] || 0;
  const inProgress = (statsMap['IN_PROGRESS'] || 0) + (statsMap['IN_REVIEW'] || 0);
  const closed = (statsMap['CLOSED'] || 0) + (statsMap['RESOLVED'] || 0);

  return (
    <Box>
      <Flex justify="between" align="end" mb="6">
        <Box>
          <Heading size="8" mb="1">Advanced Reporting</Heading>
          <Text color="gray">Insightful metrics and data exports.</Text>
        </Box>
        <Button color="violet" asChild>
          <a href="/api/issues/export" download>
            <DownloadIcon /> Export All to CSV
          </a>
        </Button>
      </Flex>

      <Grid columns={{ initial: "1", md: "2" }} gap="6" mb="6">
        <Card>
          <Heading size="4" mb="4">Issue Status Distribution</Heading>
          <IssueChart open={open} inProgress={inProgress} closed={closed} />
        </Card>

        <Card>
          <Heading size="4" mb="4">Top Assignees</Heading>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Assigned Issues</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {usersWithCounts.map(user => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <Text size="2" weight="medium">{user.name || user.email}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{user._count.assignedIssues}</Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card>
      </Grid>

      <Heading size="4" mb="3">Project Progress</Heading>
      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
        {projectsWithCounts.map(project => {
          const total = project._count.issues;
          const resolved = project.issues.filter(i => ["RESOLVED", "CLOSED"].includes(i.status)).length;
          const percentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
          
          return (
            <Card key={project.id}>
              <Flex direction="column" gap="2">
                <Heading size="3">{project.name}</Heading>
                <Flex justify="between" align="end">
                  <Box>
                    <Text size="1" color="gray">Progress</Text>
                    <Text size="5" weight="bold" as="div">{percentage}%</Text>
                  </Box>
                  <Box style={{ textAlign: 'right' }}>
                    <Text size="1" color="gray">Issues</Text>
                    <Text size="2" as="div">{resolved} / {total}</Text>
                  </Box>
                </Flex>
                <Box 
                  style={{ 
                    height: '8px', 
                    width: '100%', 
                    backgroundColor: 'var(--gray-4)', 
                    borderRadius: '4px',
                    overflow: 'hidden' 
                  }}
                >
                  <Box 
                    style={{ 
                      height: '100%', 
                      width: `${percentage}%`, 
                      backgroundColor: percentage === 100 ? 'var(--green-9)' : 'var(--violet-9)',
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </Box>
              </Flex>
            </Card>
          );
        })}
      </Grid>
    </Box>
  );
}

export const dynamic = 'force-dynamic';
