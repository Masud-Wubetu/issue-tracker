'use client';

import { useState } from 'react';
import { Box, Button, Callout, Dialog, Flex, Text, TextField, TextArea } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { ErrorMessage, Spinner } from '@/app/component';

const schema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; onCreated: () => void; }

export default function CreateProjectDialog({ open, onClose, onCreated }: Props) {
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError('');
      await axios.post('/api/projects', data);
      reset(); onCreated(); onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || 'An unexpected error occurred.');
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { reset(); setError(''); onClose(); } }}>
      <Dialog.Content maxWidth="460px">
        <Dialog.Title>Create New Project</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Start a new project to group and track related issues.
        </Dialog.Description>
        {error && <Callout.Root color="red" mb="3"><Callout.Text>{error}</Callout.Text></Callout.Root>}
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="medium">Project Name</Text>
              <TextField.Root mt="1" placeholder="e.g. Mobile App Redesign" {...register('name')} />
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            </Box>
            <Box>
              <Text as="label" size="2" weight="medium">Description <Text color="gray">(optional)</Text></Text>
              <TextArea mt="1" rows={3} placeholder="Brief description of the project…" {...register('description')} />
            </Box>
          </Flex>
          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close><Button variant="soft" color="gray" type="button">Cancel</Button></Dialog.Close>
            <Button type="submit" color="violet" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner /> Creating…</> : 'Create Project'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
