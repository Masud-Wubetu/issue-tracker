import { IssueType } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
import React from 'react'

const typeMap: Record<IssueType, { label: string, color: 'red' | 'indigo' | 'cyan' | 'orange' }> = {
    BUG: { label: 'Bug', color: 'red' },
    FEATURE: { label: 'Feature', color: 'indigo' },
    TASK: { label: 'Task', color: 'cyan' },
    IMPROVEMENT: { label: 'Improvement', color: 'orange' },
};

const IssueTypeBadge = ({ type }: { type: IssueType }) => {
  return (
    <Badge color={typeMap[type].color} variant="outline">
        {typeMap[type].label}
    </Badge>
  )
}

export default IssueTypeBadge
