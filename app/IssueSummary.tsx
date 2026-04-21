import { Status } from '@prisma/client';
import { Card, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import React from 'react';

interface Props {
  open: number;
  inProgress: number;
  closed: number;
}

const IssueSummary = ({ open, inProgress, closed }: Props) => {
  const containers: {
    label: string;
    value: number;
    status: Status;
  }[] = [
    { label: 'Open Issues', value: open, status: 'OPEN' },
    {
      label: 'In-progress Issues',
      value: inProgress,
      status: 'IN_PROGRESS',
    },
    { label: 'Closed Issues', value: closed, status: 'CLOSED' },
  ];

  return (
    <Flex gap="6">
      {containers.map((container) => (
        <Card key={container.label} variant="ghost" className="flex-1 p-0">
          <Flex direction="column" gap="2">
            <Link href={`/issues?status=${container.status}`}>
              <Text size="2" weight="bold" color="gray" className="uppercase tracking-widest hover:text-violet-600 transition-colors">
                {container.label}
              </Text>
            </Link>
            <Text size="9" weight="bold" className="tracking-tighter">
              {container.value}
            </Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};

export default IssueSummary;
