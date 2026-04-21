import { IssueStatusBadge, IssuePriorityBadge, IssueTypeBadge } from '@/app/component';
import { Issue, Project, User } from '@prisma/client';
import { Card, Flex, Heading, Text, Box, Badge } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';

interface Props {
  issue: Issue & { project: Project; reporter: User };
}

const IssueDetails = ({ issue }: Props) => {
  return (
    <>
      <Heading>{issue.title}</Heading>
      <Flex gap="3" my="2" align="center" wrap="wrap">
        <IssueStatusBadge status={issue.status} />
        <IssuePriorityBadge priority={issue.priority} />
        <IssueTypeBadge type={issue.type} />
        <Text color="gray" size="2">
          Created: {issue.createdAt.toDateString()}
        </Text>
        {issue.dueDate && (
          <Badge color="orange">
            Due: {new Date(issue.dueDate).toDateString()}
          </Badge>
        )}
      </Flex>
      
      <Flex direction="column" gap="1" mb="4">
        <Text size="2">
          <Text weight="bold">Project:</Text> {issue.project.name}
        </Text>
        <Text size="2">
          <Text weight="bold">Reporter:</Text> {issue.reporter.name || issue.reporter.email}
        </Text>
      </Flex>

      <Card className="prose max-w-full" mt="4">
        <ReactMarkdown>{issue.description}</ReactMarkdown>
      </Card>
    </>
  );
};

export default IssueDetails;

