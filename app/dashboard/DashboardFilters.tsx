'use client';

import { Flex, Select, Text } from '@radix-ui/themes';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface Props {
  projects: { id: number; name: string }[];
}

const DashboardFilters = ({ projects }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'ALL') params.delete(key);
    else params.set(key, value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Flex gap="3" mb="4" wrap="wrap">
      <Box>
        <Text size="1" color="gray" mb="1" as="div">Project</Text>
        <Select.Root 
          defaultValue={searchParams.get('projectId') || 'ALL'} 
          onValueChange={(val) => updateFilter('projectId', val)}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ALL">All Projects</Select.Item>
            {projects.map(p => (
              <Select.Item key={p.id} value={p.id.toString()}>{p.name}</Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box>
        <Text size="1" color="gray" mb="1" as="div">Status</Text>
        <Select.Root 
          defaultValue={searchParams.get('status') || 'ALL'} 
          onValueChange={(val) => updateFilter('status', val)}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ALL">All Statuses</Select.Item>
            <Select.Item value="OPEN">Open</Select.Item>
            <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
            <Select.Item value="RESOLVED">Resolved</Select.Item>
            <Select.Item value="CLOSED">Closed</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>

      <Box>
        <Text size="1" color="gray" mb="1" as="div">Priority</Text>
        <Select.Root 
          defaultValue={searchParams.get('priority') || 'ALL'} 
          onValueChange={(val) => updateFilter('priority', val)}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ALL">All Priorities</Select.Item>
            <Select.Item value="LOW">Low</Select.Item>
            <Select.Item value="MEDIUM">Medium</Select.Item>
            <Select.Item value="HIGH">High</Select.Item>
            <Select.Item value="CRITICAL">Critical</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
    </Flex>
  );
};

import { Box } from '@radix-ui/themes';

export default DashboardFilters;
