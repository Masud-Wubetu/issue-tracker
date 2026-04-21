import { Button, Flex } from '@radix-ui/themes'
import Link from 'next/link'
import React from 'react'
import IssueFilters from './IssueFilters'

interface Props {
  projects: { id: number; name: string }[];
  users: { id: string; name: string | null }[];
}

const IssueActions = ({ projects, users }: Props) => {
  return (
    <Flex mb="5" justify="between" align="end" gap="4">
      <IssueFilters projects={projects} users={users} />
      <Button color="violet">
        <Link href="/issues/new">New Issue</Link>
      </Button>
    </Flex>
  )
}

export default IssueActions