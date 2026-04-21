import { IssueStatusBadge, IssuePriorityBadge, IssueTypeBadge } from '@/app/component';
import { Issue } from '@prisma/client';
import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';

const IssueDetails = ({ issue }: { issue: Issue }) => {
  return (
    <>
      <Heading>{issue.title}</Heading>
      <Flex gap="3" my="2" align="center">
        <IssueStatusBadge status={issue.status} />
        <IssuePriorityBadge priority={issue.priority} />
        <IssueTypeBadge type={issue.type} />
        <Text color="gray" size="2">
          {issue.createdAt.toDateString()}
        </Text>
      </Flex>
      <Card className="prose max-w-full" mt="4">
        <ReactMarkdown>{issue.description}</ReactMarkdown>
      </Card>
    </>
  );
};

export default IssueDetails;
