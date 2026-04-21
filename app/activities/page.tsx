import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { prisma } from "@/prisma/client";
import { Avatar, Box, Card, Flex, Heading, Text, Badge, Container, Button } from "@radix-ui/themes";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GlobalActivitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const role = (session.user as any)?.role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return (
      <Container size="2">
        <Flex direction="column" align="center" justify="center" mt="9" gap="4">
          <Heading size="8" color="red">Access Denied</Heading>
          <Text size="4" color="gray">Only Admins and Managers can view the global audit trail.</Text>
          <Button variant="soft" color="violet" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </Flex>
      </Container>
    );
  }

  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, image: true, role: true } },
      issue: { select: { title: true, id: true } },
    },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return (
    <Container size="3">
      <Box mb="6">
        <Heading size="8" mb="1">Audit Trail</Heading>
        <Text color="gray">Tracking system-wide actions and updates for transparency.</Text>
      </Box>

      <Flex direction="column" gap="4">
        {logs.length === 0 ? (
          <Card>
            <Flex align="center" justify="center" p="8">
              <Text color="gray">No activity logs found yet.</Text>
            </Flex>
          </Card>
        ) : (
          logs.map((log) => {
            const userName = log.user?.name || "Unknown User";
            const initials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            
            return (
              <Card key={log.id} variant="surface">
                <Flex gap="4" align="start">
                  <Avatar 
                    src={log.user?.image ?? undefined} 
                    fallback={initials} 
                    size="3" 
                    radius="full" 
                    color="violet" 
                  />
                  <Box style={{ flex: 1 }}>
                    <Flex justify="between" align="center" mb="1">
                      <Flex gap="2" align="center">
                        <Text size="2" weight="bold">{userName}</Text>
                        <Badge size="1" variant="soft" color="violet">{log.user?.role}</Badge>
                      </Flex>
                      <Text size="1" color="gray">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </Text>
                    </Flex>
                    <Text size="2" color="gray" mb="1">
                      {log.action}
                    </Text>
                    <Link 
                      href={`/issues/${log.issueId}`} 
                      style={{ 
                        display: 'inline-block',
                        color: 'var(--violet-11)', 
                        fontWeight: 600,
                        fontSize: 'var(--font-size-2)',
                        textDecoration: 'none'
                      }}
                      className="hover:underline"
                    >
                      #{log.issueId}: {log.issue?.title || "Deleted Issue"}
                    </Link>
                  </Box>
                </Flex>
              </Card>
            );
          })
        )}
      </Flex>
    </Container>
  );
}

export const dynamic = 'force-dynamic';
