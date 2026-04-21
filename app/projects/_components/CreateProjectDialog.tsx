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
        <Dialog.Description size="2" color="gray" mb="5">
          Start a new project to group and track related issues effectively.
        </Dialog.Description>
        
        {error && (
          <Callout.Root color="red" mb="4" variant="soft">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">Project Name</Text>
              <TextField.Root placeholder="e.g. Mobile App Redesign" size="3" {...register('name')} />
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            </Box>
            
            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">
                Description <Text color="gray" weight="regular">(optional)</Text>
              </Text>
              <TextArea size="3" rows={4} placeholder="Briefly describe the project goals…" {...register('description')} />
            </Box>
          </Flex>
          
          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" size="3" type="button">Cancel</Button>
            </Dialog.Close>
            <Button type="submit" color="violet" size="3" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner /> Creating…</> : 'Create Project'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
