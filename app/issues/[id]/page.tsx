import IssueStatusBadge from '@/app/component/IssueStatusBadge';
import { prisma } from '@/prisma/client'
import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
            <Flex className='space-x-5' my='5'>
                <IssueStatusBadge status={issue.status} />
                <Text>{issue.createdAt.toDateString()}</Text>
            </Flex>
            <div className='prose prose-slate max-w-none p-6 bg-white rounded-lg border'>
                <ReactMarkdown remarkPlugins={[remarkGfm as any]} rehypePlugins={[rehypeRaw as any]}>{issue.description}</ReactMarkdown>
            </div>
        </div>
    )
}

export default IssueDetailpage