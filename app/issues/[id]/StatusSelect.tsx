'use client';

import { Status } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface Props {
  issueId: number;
  status: Status;
}

const statusOptions: { label: string; value: Status }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const StatusSelect = ({ issueId, status }: Props) => {
  const router = useRouter();

  const changeStatus = async (newStatus: Status) => {
    try {
      await axios.patch(`/api/issues/${issueId}`, { status: newStatus });
      router.refresh();
      toast.success('Status updated!');
    } catch {
      toast.error('Could not update status.');
    }
  };

  return (
    <>
      <Select.Root defaultValue={status} onValueChange={changeStatus}>
        <Select.Trigger placeholder="Change status..." />
        <Select.Content>
          <Select.Group>
            <Select.Label>Status</Select.Label>
            {statusOptions.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Toaster />
    </>
  );
};

export default StatusSelect;
