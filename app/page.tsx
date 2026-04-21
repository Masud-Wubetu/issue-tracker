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
      <Flex justify="between" align="center" mb="9">
        <Box>
           <Text className="text-hero block mb-2">Hello, {userName} 👋</Text>
           <Text color="gray" size="6" weight="medium">Your grand dashboard for project management.</Text>
        </Box>
        <Flex gap="6">
          {role === 'MANAGER' && (
            <Button color="violet" size="3" variant="soft" asChild>
              <Link href="/projects">Manage Projects</Link>
            </Button>
          )}
          <Button size="3" color="violet">New Issue</Button>
        </Flex>
      </Flex>

      <Grid columns={{ initial: '1', md: '2' }} gap="9">
        <Flex direction="column" gap="9">
          <Card className="card-premium">
             <Heading size="7" mb="8" className="tracking-tight">Issue Overview</Heading>
             <IssueSummary open={open} inProgress={inProgress} closed={closed} />
          </Card>
          <Card className="card-premium">
             <Heading size="7" mb="8" className="tracking-tight">Status Analytics</Heading>
             <IssueChart open={open} inProgress={inProgress} closed={closed} />
          </Card>
        </Flex>
        
        <Box>
          <Card className="card-premium">
            <Heading size="7" mb="8" className="tracking-tight">Latest Activity</Heading>
            <LatestIssues />
            {role === 'DEVELOPER' && (
               <Button mt="8" className="w-full" variant="outline" size="3">View My Tasks</Button>
            )}
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}


export const metadata: Metadata = {
  title: 'Issue Tracker - Dashboard',
  description: 'View a summary of project issues'
};

