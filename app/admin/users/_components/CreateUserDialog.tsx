'use client';

import { useState } from 'react';
import {
  Box, Button, Callout, Dialog, Flex, Select, Text, TextField
} from '@radix-ui/themes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { ErrorMessage, Spinner } from '@/app/component';

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email.'),
  password: z.string().min(5, 'Min 5 characters.'),
  role: z.enum(['ADMIN', 'MANAGER', 'DEVELOPER', 'QA', 'VIEWER']),
});
type FormData = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; onCreated: () => void; }

export default function CreateUserDialog({ open, onClose, onCreated }: Props) {
  const [error, setError] = useState('');
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'DEVELOPER' } });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError('');
      await axios.post('/api/users', data);
      reset();
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.error || 'An unexpected error occurred.');
    }
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { reset(); setError(''); onClose(); } }}>
      <Dialog.Content maxWidth="440px">
        <Dialog.Title>Create New User</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="5">
          Invite a new team member to collaborate on your projects.
        </Dialog.Description>

        {error && (
          <Callout.Root color="red" mb="4" variant="soft">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">Full Name</Text>
              <TextField.Root placeholder="e.g. Jane Smith" size="3" {...register('name')} />
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            </Box>
            
            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">Email Address</Text>
              <TextField.Root type="email" placeholder="jane@example.com" size="3" {...register('email')} />
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">System Role</Text>
              <Controller name="role" control={control} render={({ field }) => (
                <Select.Root onValueChange={field.onChange} defaultValue={field.value} size="3">
                  <Select.Trigger className="w-full" />
                  <Select.Content position="popper">
                    <Select.Item value="ADMIN">Administrator</Select.Item>
                    <Select.Item value="MANAGER">Project Manager</Select.Item>
                    <Select.Item value="DEVELOPER">Developer</Select.Item>
                    <Select.Item value="QA">QA / Tester</Select.Item>
                    <Select.Item value="VIEWER">Viewer</Select.Item>
                  </Select.Content>
                </Select.Root>
              )} />
              <ErrorMessage>{errors.role?.message}</ErrorMessage>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" mb="1" className="block">Initial Password</Text>
              <TextField.Root type="password" placeholder="Min. 5 characters" size="3" {...register('password')} />
              <ErrorMessage>{errors.password?.message}</ErrorMessage>
            </Box>
          </Flex>

          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" size="3" type="button">Cancel</Button>
            </Dialog.Close>
            <Button type="submit" color="violet" size="3" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner /> Creating…</> : 'Create User'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
