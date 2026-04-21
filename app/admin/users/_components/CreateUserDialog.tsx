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
  role: z.enum(['ADMIN', 'MANAGER', 'DEVELOPER', 'QA', 'VIEWER']).default('DEVELOPER'),
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
        <Dialog.Description size="2" color="gray" mb="4">
          Add a new team member to the system.
        </Dialog.Description>

        {error && <Callout.Root color="red" mb="4"><Callout.Text>{error}</Callout.Text></Callout.Root>}

        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="medium">Full Name</Text>
              <TextField.Root mt="1" placeholder="Jane Smith" {...register('name')} />
              <ErrorMessage>{errors.name?.message}</ErrorMessage>
            </Box>
            <Box>
              <Text as="label" size="2" weight="medium">Email</Text>
              <TextField.Root mt="1" type="email" placeholder="jane@example.com" {...register('email')} />
              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            </Box>
            <Box>
              <Text as="label" size="2" weight="medium">Role</Text>
              <Controller name="role" control={control} render={({ field }) => (
                <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                  <Select.Trigger mt="1" className="w-full" />
                  <Select.Content>
                    <Select.Item value="ADMIN">Admin</Select.Item>
                    <Select.Item value="MANAGER">Manager</Select.Item>
                    <Select.Item value="DEVELOPER">Developer</Select.Item>
                    <Select.Item value="QA">QA / Tester</Select.Item>
                    <Select.Item value="VIEWER">Viewer</Select.Item>
                  </Select.Content>
                </Select.Root>
              )} />
              <ErrorMessage>{errors.role?.message}</ErrorMessage>
            </Box>
            <Box>
              <Text as="label" size="2" weight="medium">Password</Text>
              <TextField.Root mt="1" type="password" placeholder="Min. 5 characters" {...register('password')} />
              <ErrorMessage>{errors.password?.message}</ErrorMessage>
            </Box>
          </Flex>

          <Flex gap="3" mt="5" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" type="button">Cancel</Button>
            </Dialog.Close>
            <Button type="submit" color="violet" disabled={isSubmitting}>
              {isSubmitting ? <><Spinner /> Creating…</> : 'Create User'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
