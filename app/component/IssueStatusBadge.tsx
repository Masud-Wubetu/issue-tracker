import { Status } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
const statusMap: Record<Status, { label: string, color: 'red' | 'violet' | 'green' | 'blue' | 'gray'}> = {
    OPEN: { label: 'Open', color: 'red' },
    IN_PROGRESS: { label: 'In Progress', color: 'violet' },
    IN_REVIEW: { label: 'In Review', color: 'blue' },
    RESOLVED: { label: 'Resolved', color: 'green' },
    CLOSED: { label: 'Closed', color: 'gray' },
};

const IssueStatusBadge = ({ status }: { status: Status }) => {
  return (
    <Badge color={statusMap[status].color}>
        {statusMap[status].label}
    </Badge>
  )
}

export default IssueStatusBadge