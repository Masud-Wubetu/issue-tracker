import IssueStatusBadge from '@/app/component/IssueStatusBadge';
import IssuePriorityBadge from '@/app/component/IssuePriorityBadge';
import IssueTypeBadge from '@/app/component/IssueTypeBadge';
import { prisma } from '@/prisma/client';
import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';


interface Props { 
    params: { id: string }
}

const IssueDetailpage = async ({ params }: Props) => {
    const { id } = await params;

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(id) }
    });

    if (!issue) notFound();

    return (
        <div>
            <Heading>{issue.title}</Heading>
            <Flex className='gap-3' my='5' align="center">
                <IssueTypeBadge type={issue.type} />
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge priority={issue.priority} />
                <Text size="2" color="gray">{issue.createdAt.toDateString()}</Text>
            </Flex>
            <Card className='prose !max-w-2xl' mt='4'>
                <ReactMarkdown>{issue.description}</ReactMarkdown>
            </Card>
        </div>
    )
}

export default IssueDetailpage