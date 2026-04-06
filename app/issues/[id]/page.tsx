import IssueStatusBadge from '@/app/component/IssueStatusBadge';
import { prisma } from '@/prisma/client'
import { Card, Flex, Heading, Text } from '@radix-ui/themes';
import { notFound } from 'next/navigation';
import React from 'react'

interface Props {
    params: { id: string }
}

const IssueDetailpage = async ({ params }: Props ) => {
   
    
    const { id } = await params;

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(id) }
    });

    if (!issue) notFound();

  return (
    <div>
        <Heading>{issue.title}</Heading>
        <Flex className='space-x-5' my='5'>
            <IssueStatusBadge status={issue.status}/>
            <Text>{issue.createdAt.toDateString()}</Text>
        </Flex>
        <Card>
            <p>{issue.description}</p>
        </Card>
        
       
    </div>
  )
}

export default IssueDetailpage