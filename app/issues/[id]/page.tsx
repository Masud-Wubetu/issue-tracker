import IssueStatusBadge from '@/app/component/IssueStatusBadge';
import IssuePriorityBadge from '@/app/component/IssuePriorityBadge';
import IssueTypeBadge from '@/app/component/IssueTypeBadge';
import { prisma } from '@/prisma/client';
import { Box, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import DeleteIssueButton from './DeleteIssueButton';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/auth/authOptions';
import AssigneeSelect from './AssigneeSelect';

interface Props { 
    params: { id: string }
}

const IssueDetailpage = async ({ params }: Props) => {
    let session = null;
    try {
        session = await getServerSession(authOptions);
    } catch (error) {
        console.error("Auth session error:", error);
    }

    const { id } = await params;

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(id) }
    });

    if (!issue) notFound();

    return (
        <Grid columns={{ initial: '1', sm: '5' }} gap="5">
          <Box className='md:col-span-4'>
            <IssueDetails issue={issue} />
          </Box>
          {session && (
            <Box>
              <Flex direction="column" gap="4">
                <AssigneeSelect issue={issue} />
                <EditIssueButton issueId={issue.id} />
                <DeleteIssueButton issueId={issue.id} />
              </Flex>
            </Box>
          )}
        </Grid>
    )
}

export default IssueDetailpage