import { Priority } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
import React from 'react'

const priorityMap: Record<Priority, { label: string, color: 'gray' | 'blue' | 'orange' | 'red' }> = {
    LOW: { label: 'Low', color: 'gray' },
    MEDIUM: { label: 'Medium', color: 'blue' },
    HIGH: { label: 'High', color: 'orange' },
    CRITICAL: { label: 'Critical', color: 'red' },
};

const IssuePriorityBadge = ({ priority }: { priority: Priority }) => {
  return (
    <Badge color={priorityMap[priority].color}>
        {priorityMap[priority].label}
    </Badge>
  )
}

export default IssuePriorityBadge
