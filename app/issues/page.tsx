
import React from 'react'
import { Table } from '@radix-ui/themes'
import Link from '@/app/component/Link'
import { prisma } from '@/prisma/client'
import IssueStatusBadge from '../component/IssueStatusBadge'
import IssuePriorityBadge from '../component/IssuePriorityBadge'
import IssueTypeBadge from '../component/IssueTypeBadge'
import IssueActions from './IssueActions'

const IssuesPage = async () => {
  const issues = await prisma.issue.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <IssueActions/>
      <Table.Root variant='surface'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Issue</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='hidden md:table-cell'>Type</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='hidden md:table-cell'>Priority</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='hidden md:table-cell'>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='hidden md:table-cell'>Created</Table.ColumnHeaderCell>
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
                  <IssueTypeBadge type={issue.type}/>
                  <IssueStatusBadge status={issue.status}/>
                </div>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssueTypeBadge type={issue.type}/>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssuePriorityBadge priority={issue.priority}/>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>
                <IssueStatusBadge status={issue.status}/>
              </Table.Cell>
              <Table.Cell className='hidden md:table-cell'>{issue.createdAt.toDateString()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  )
}

export default IssuesPage