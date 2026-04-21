
import React from 'react'
import { Table, Flex } from '@radix-ui/themes'
import Link from '@/app/component/Link'
import NextLink from 'next/link';
import { prisma } from '@/prisma/client'
import { IssueStatusBadge, IssuePriorityBadge, IssueTypeBadge, Pagination } from '../component'
import IssueActions from './IssueActions'
import { Status, Issue } from '@prisma/client'
import { ArrowUpIcon } from '@radix-ui/react-icons';

interface Props {
  searchParams: { 
    status: Status, 
    orderBy: keyof Issue,
    page: string 
  }
}

const IssuesPage = async ({ searchParams }: Props) => {
  const { status, orderBy, page } = await searchParams;

  const statuses = Object.values(Status);
  const filterStatus = statuses.includes(status) ? status : undefined;
  const where = { status: filterStatus };

  const columns: { 
    label: string; 
    value: keyof Issue; 
    className?: string 
  }[] = [
    { label: 'Issue', value: 'title' },
    { label: 'Type', value: 'type', className: 'hidden md:table-cell' },
    { label: 'Priority', value: 'priority', className: 'hidden md:table-cell' },
    { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
    { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' },
  ];

  const orderByField = columns
    .map(column => column.value)
    .includes(orderBy)
    ? { [orderBy]: 'asc' }
    : undefined;

  const currentPage = parseInt(page) || 1;
  const pageSize = 10;

  const issues = await prisma.issue.findMany({
    where,
    orderBy: orderByField,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const issueCount = await prisma.issue.count({ where });

  return (
    <Flex direction="column" gap="3">
      <IssueActions />
      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            {columns.map(column => (
              <Table.ColumnHeaderCell key={column.value} className={column.className}>
                <NextLink href={{
                  query: { ...searchParams, orderBy: column.value }
                }}>
                  {column.label}
                </NextLink>
                {column.value === orderBy && <ArrowUpIcon className='inline' />}
              </Table.ColumnHeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {issues.map(issue => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Link href={`/issues/${issue.id}`}>
                  {issue.title}
                </Link>
                <div className='flex md:hidden gap-2 mt-1'>
                  <IssueTypeBadge type={issue.type} />
                  <IssueStatusBadge status={issue.status} />
                </div>
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
              <Table.Cell className='hidden md:table-cell'>{issue.createdAt.toDateString()}</Table.Cell>
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