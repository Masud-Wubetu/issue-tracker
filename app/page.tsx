import { prisma } from "@/prisma/client";
import IssueSummary from "./IssueSummary";
import LatestIssues from "./LatestIssues";
import IssueChart from "./IssueChart";
import { Flex, Grid, Heading, Text, Box, Card, Button } from "@radix-ui/themes";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import authOptions from "./auth/authOptions";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) return (
    <Flex mt="9" align="center" direction="column">
      <Heading size="8" mb="4">Welcome to Issue Tracker</Heading>
      <Text size="5" color="gray" mb="6">Streamline your project management with ease and clarity.</Text>
      <Flex gap="3" justify="center">
        <Button size="3" variant="solid" color="violet" asChild>
          <Link href="/auth/register">Get Started</Link>
        </Button>
        <Button size="3" variant="outline" color="violet" asChild>
          <Link href="/api/auth/signin">Log In</Link>
        </Button>
      </Flex>
    </Flex>
  );


  const role = (session.user as any).role;
  const userName = session.user?.name || 'User';

  const open = await prisma.issue.count({ where: { status: 'OPEN' } });
  const inProgress = await prisma.issue.count({ where: { status: 'IN_PROGRESS' } });
  const closed = await prisma.issue.count({ where: { status: 'CLOSED' } });

  return (
    <Box>
      <Flex justify="between" align="end" mb="5">
        <Box>
           <Heading size="6">Hello, {userName} 👋</Heading>
           <Text color="gray">Role: {role}</Text>
        </Box>
        {role === 'ADMIN' && <Button variant="soft">System Logs</Button>}
        {role === 'MANAGER' && <Button color="green">New Project</Button>}
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap="5">
        <Flex direction="column" gap="5">
          <Card>
             <Heading size="3" mb="3">Overview</Heading>
             <IssueSummary open={open} inProgress={inProgress} closed={closed} />
          </Card>
          <Card>
             <Heading size="3" mb="3">Analytics</Heading>
             <IssueChart open={open} inProgress={inProgress} closed={closed} />
          </Card>
        </Flex>
        
        <Box>
          <Heading size="3" mb="3">Recent Activity</Heading>
          <LatestIssues />
          {role === 'DEVELOPER' && (
             <Button mt="4" className="w-full" variant="outline">View My Assigned Tasks</Button>
          )}
        </Box>
      </Grid>
    </Box>
  );
}


export const metadata: Metadata = {
  title: 'Issue Tracker - Dashboard',
  description: 'View a summary of project issues'
};

