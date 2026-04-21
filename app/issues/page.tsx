
import React from 'react'
import { Table, Flex, Text, Button } from '@radix-ui/themes'
import Link from '@/app/component/Link'
import NextLink from 'next/link';
import { prisma } from '@/prisma/client'
import { IssueStatusBadge, IssuePriorityBadge, IssueTypeBadge, Pagination } from '../component'
import IssueActions from './IssueActions'
import { Status, Issue, Priority } from '@prisma/client'
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

interface Props {
  searchParams: Promise<{ 
    status?: Status; 
    priority?: Priority;
    assigneeId?: string;
    projectId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    orderBy?: keyof Issue;
    sortOrder?: 'asc' | 'desc';
    page?: string;
  }>
}

const IssuesPage = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const { 
    status, priority, assigneeId, projectId, search, 
    startDate, endDate, orderBy, sortOrder, page 
  } = resolvedSearchParams;

  const where = {
    status: status || undefined,
    priority: priority || undefined,
    assigneeId: assigneeId || undefined,
    projectId: projectId ? parseInt(projectId) : undefined,
    AND: [
        search ? {
            OR: [
                { title: { contains: search } },
                { description: { contains: search } }
            ]
        } : {},
        startDate ? { createdAt: { gte: new Date(startDate) } } : {},
        endDate ? { createdAt: { lte: new Date(endDate) } } : {},
    ]
  };

  const columns: { 
    label: string; 
    value: keyof Issue | 'project' | 'actions'; 
    className?: string 
  }[] = [
    { label: 'Issue', value: 'title' },
    { label: 'Project', value: 'project', className: 'hidden md:table-cell' },
    { label: 'Type', value: 'type', className: 'hidden md:table-cell' },
    { label: 'Priority', value: 'priority', className: 'hidden md:table-cell' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' },
    { label: '', value: 'actions' },
  ];

  const validOrderBy = columns
    .map(c => c.value)
    .filter(v => v !== 'project' && v !== 'actions')
    .includes(orderBy as any) ? orderBy : 'createdAt';

  const finalSortOrder = sortOrder || (validOrderBy === 'createdAt' ? 'desc' : 'asc');

  const currentPage = parseInt(page || '1');
  const pageSize = 10;

  const issues = await prisma.issue.findMany({
    where,
    include: { project: true },
    orderBy: { [validOrderBy as any]: finalSortOrder },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const issueCount = await prisma.issue.count({ where });

  const [projects, users] = await Promise.all([
    prisma.project.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ select: { id: true, name: true } })
  ]);

  return (
    <Flex direction="column" gap="3">
      <IssueActions projects={projects} users={users} />
      <Table.Root variant='surface'>

        <Table.Header>
          <Table.Row>
            {columns.map(column => (
              <Table.ColumnHeaderCell key={column.value} className={column.className}>
                {column.value !== 'project' && column.value !== 'actions' ? (
                  <NextLink href={{
                    query: { 
                        ...resolvedSearchParams, 
                        orderBy: column.value,
                        sortOrder: orderBy === column.value && sortOrder === 'asc' ? 'desc' : 'asc'
                    }
                  }}>
                    {column.label}
                    {column.value === orderBy && (
                        sortOrder === 'asc' ? <ArrowUpIcon className='inline ml-1' /> : <ArrowDownIcon className='inline ml-1' />
                    )}
                  </NextLink>
                ) : (
                  column.label
                )}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {issues.map(issue => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Link href={`/issues/${issue.id}`} className="text-2xl font-black">
                  {issue.title}
                </Link>
                <div className='flex md:hidden flex-wrap gap-4 mt-3'>
                  <span className="text-base font-bold text-muted">{issue.project.name}</span>
                  <IssueTypeBadge type={issue.type} />
                  <IssueStatusBadge status={issue.status} />
                </div>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <Text size="5" weight="bold">{issue.project.name}</Text>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssueTypeBadge type={issue.type} />
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssuePriorityBadge priority={issue.priority} />
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssueStatusBadge status={issue.status} />
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <Text size="5">{issue.createdAt.toDateString()}</Text>
              </Table.Cell>
              <Table.Cell>
                <Button variant="soft" size="3" color="gray" asChild>
                  <NextLink href={`/issues/${issue.id}`}>Manage</NextLink>
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Pagination 
        pageSize={pageSize}
        currentPage={currentPage}
        itemCount={issueCount}
      />
    </Flex>
  )
}

export const dynamic = 'force-dynamic';

export default IssuesPage