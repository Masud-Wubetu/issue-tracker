import { prisma } from '@/prisma/client';
import { Avatar, Card, Flex, Heading, Table } from '@radix-ui/themes';
import React from 'react';
import { IssueStatusBadge } from './component';
import Link from 'next/link';

const LatestIssues = async () => {
  const issues = await prisma.issue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      assignee: true,
    },
  });

  return (
    <Card>
      <Heading size="4" mb="5">Latest Issues</Heading>
      <Table.Root>
        <Table.Body>
          {issues.map((issue) => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Flex justify="between">
                  <Flex direction="column" align="start" gap="2">
                    <Link href={`/issues/${issue.id}`} className='hover:underline font-medium'>
                      {issue.title}
                    </Link>
                    <IssueStatusBadge status={issue.status} />
                  </Flex>
                  {issue.assignee && (
                    <Avatar
                      src={(issue.assignee as any).image}
                      fallback="?"
                      size="2"
                      radius="full"
                    />
                  )}


                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
};

export default LatestIssues;
