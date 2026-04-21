import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { prisma } from "@/prisma/client";
import { Avatar, Box, Card, Flex, Heading, Text, Badge } from "@radix-ui/themes";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GlobalActivitiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return (
      <Flex direction="column" align="center" justify="center" mt="9">
        <Heading color="red">Access Denied</Heading>
        <Text>Only Admins and Managers can view the global audit trail.</Text>
      </Flex>
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
    <Box maxW="800px" mx="auto">
      <Heading size="8" mb="2">Audit Trail</Heading>
      <Text color="gray" mb="6">Track system-wide actions and updates.</Text>

      <Flex direction="column" gap="4">
        {logs.map((log) => {
          const initials = (log.user.name || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
          return (
            <Card key={log.id}>
              <Flex gap="3" align="start">
                <Avatar src={log.user.image ?? undefined} fallback={initials} size="2" radius="full" color="violet" />
                <Box style={{ flex: 1 }}>
                  <Flex justify="between" align="center" mb="1">
                    <Flex gap="2" align="center">
                      <Text size="2" weight="bold">{log.user.name}</Text>
                      <Badge size="1" color="gray">{log.user.role}</Badge>
                    </Flex>
                    <Text size="1" color="gray">
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </Flex>
                  <Text size="2">
                    {log.action} on <Link href={`/issues/${log.issueId}`} style={{ color: 'var(--violet-11)', fontWeight: 500 }}>
                      #{log.issueId}: {log.issue.title}
                    </Link>
                  </Text>
                </Box>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Box>
  );
}

export const dynamic = 'force-dynamic';
