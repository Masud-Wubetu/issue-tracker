import { prisma } from '@/prisma/client';
import { Box, Flex, Grid } from '@radix-ui/themes';
import { notFound } from 'next/navigation';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';
import DeleteIssueButton from './DeleteIssueButton';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/auth/authOptions';
import AssigneeSelect from './AssigneeSelect';
import AttachmentSection from './AttachmentSection';

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
        where: { id: parseInt(id) },
        include: {
            project: true,
            reporter: true,
            attachments: true,
        }
    });

    if (!issue) notFound();

    return (
        <Grid columns={{ initial: '1', sm: '5' }} gap="5">
          <Box className='md:col-span-4'>
            <IssueDetails issue={issue} />
            <AttachmentSection issueId={issue.id} attachments={issue.attachments} />
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