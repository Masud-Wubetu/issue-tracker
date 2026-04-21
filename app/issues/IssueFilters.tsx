'use client';

import { Status, Priority } from '@prisma/client';
import { Box, Flex, Select, TextField } from '@radix-ui/themes';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useDebounce } from 'use-debounce';

interface Props {
  projects: { id: number; name: string }[];
  users: { id: string; name: string | null }[];
}

const statusOptions: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const priorityOptions: { label: string; value: string }[] = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const IssueFilters = ({ projects, users }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    params.delete('page'); // Reset pagination on search
    router.push(`/issues?${params.toString()}`);
  }, [debouncedSearch]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'ALL') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/issues?${params.toString()}`);
  };

  return (
    <Flex gap="3" wrap="wrap" align="end">
      <Box style={{ width: '250px' }}>
        <TextField.Root
          placeholder="Search title/description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Box>
        <Select.Root 
          defaultValue={searchParams.get('status') || 'ALL'} 
          onValueChange={(val) => updateFilter('status', val)}
        >
          <Select.Trigger placeholder="Status" />
          <Select.Content>
            {statusOptions.map(opt => <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>)}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box>
        <Select.Root 
          defaultValue={searchParams.get('priority') || 'ALL'} 
          onValueChange={(val) => updateFilter('priority', val)}
        >
          <Select.Trigger placeholder="Priority" />
          <Select.Content>
            {priorityOptions.map(opt => <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>)}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box>
        <Select.Root 
          defaultValue={searchParams.get('projectId') || 'ALL'} 
          onValueChange={(val) => updateFilter('projectId', val)}
        >
          <Select.Trigger placeholder="Project" />
          <Select.Content>
            <Select.Item value="ALL">All Projects</Select.Item>
            {projects.map(p => <Select.Item key={p.id} value={p.id.toString()}>{p.name}</Select.Item>)}
          </Select.Content>
        </Select.Root>
      </Box>

      <Box>
        <Select.Root 
          defaultValue={searchParams.get('assigneeId') || 'ALL'} 
          onValueChange={(val) => updateFilter('assigneeId', val)}
        >
          <Select.Trigger placeholder="Assignee" />
          <Select.Content>
            <Select.Item value="ALL">All Assignees</Select.Item>
            {users.map(u => <Select.Item key={u.id} value={u.id}>{u.name || 'Unknown'}</Select.Item>)}
          </Select.Content>
        </Select.Root>
      </Box>

      <Flex gap="2">
        <Box>
            <input 
                type="date" 
                className="radix-themes-date-input"
                defaultValue={searchParams.get('startDate') || ''}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                style={{ height: '32px', borderRadius: 'var(--radius-2)', border: '1px solid var(--gray-7)', padding: '0 8px' }}
            />
        </Box>
        <Box>
            <input 
                type="date" 
                className="radix-themes-date-input"
                defaultValue={searchParams.get('endDate') || ''}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                style={{ height: '32px', borderRadius: 'var(--radius-2)', border: '1px solid var(--gray-7)', padding: '0 8px' }}
            />
        </Box>
      </Flex>
    </Flex>
  );
};

export default IssueFilters;
