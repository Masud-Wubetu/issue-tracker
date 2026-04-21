"use client";

import { Button, Callout, Text, TextField, Grid, Flex, Select, Box } from '@radix-ui/themes'
import { useForm, Controller } from 'react-hook-form'
import "easymde/dist/easymde.min.css"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createIssueSchema } from '@/app/validationSchemas'
import { z } from 'zod'
import dynamic from "next/dynamic";
import { ErrorMessage, Spinner } from '@/app/component';
import { Issue } from '@prisma/client';

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

type IssueFormData = z.infer<typeof createIssueSchema>;
type Project = { id: number; name: string };
type User = { id: string; name: string | null };

interface Props { issue?: Issue & { dueDate?: Date | null } }

export default function IssueForm({ issue }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: issue?.title,
      description: issue?.description,
      priority: issue?.priority || 'MEDIUM',
      type: issue?.type || 'BUG',
      projectId: issue?.projectId,
      assigneeId: issue?.assigneeId,
      dueDate: issue?.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : undefined,
    }
  });
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios.get<Project[]>('/api/projects').then(r => setProjects(r.data)).catch(() => {});
    axios.get<User[]>('/api/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);
      if (issue)
        await axios.patch('/api/issues/' + issue.id, data);
      else
        await axios.post('/api/issues', data);
      router.push('/issues');
      router.refresh();
    } catch {
      setError('An unexpected error occurred.');
      setSubmitting(false);
    }
  });

  return (
    <div className="max-w-2xl">
      {error && <Callout.Root color="red" className="mb-5"><Callout.Text>{error}</Callout.Text></Callout.Root>}
      <form onSubmit={onSubmit} className='space-y-4'>
        <Box>
          <Text size="2" weight="bold" as="p" mb="1">Title <Text color="red">*</Text></Text>
          <TextField.Root placeholder='Issue title' {...register('title')} />
          <ErrorMessage>{errors.title?.message}</ErrorMessage>
        </Box>

        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Box>
            <Text size="2" weight="bold" as="p" mb="1">Type</Text>
            <Controller name="type" control={control} render={({ field }) => (
              <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                <Select.Trigger className="w-full" />
                <Select.Content>
                  <Select.Item value="BUG">🐛 Bug</Select.Item>
                  <Select.Item value="FEATURE">✨ Feature</Select.Item>
                  <Select.Item value="TASK">📋 Task</Select.Item>
                  <Select.Item value="IMPROVEMENT">⚡ Improvement</Select.Item>
                </Select.Content>
              </Select.Root>
            )} />
          </Box>

          <Box>
            <Text size="2" weight="bold" as="p" mb="1">Priority</Text>
            <Controller name="priority" control={control} render={({ field }) => (
              <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                <Select.Trigger className="w-full" />
                <Select.Content>
                  <Select.Item value="LOW">🟢 Low</Select.Item>
                  <Select.Item value="MEDIUM">🟡 Medium</Select.Item>
                  <Select.Item value="HIGH">🟠 High</Select.Item>
                  <Select.Item value="CRITICAL">🔴 Critical</Select.Item>
                </Select.Content>
              </Select.Root>
            )} />
          </Box>

          <Box>
            <Text size="2" weight="bold" as="p" mb="1">Project <Text color="red">*</Text></Text>
            <Controller name="projectId" control={control} render={({ field }) => (
              <Select.Root
                onValueChange={(v) => field.onChange(parseInt(v))}
                defaultValue={field.value ? String(field.value) : undefined}
              >
                <Select.Trigger placeholder="Select project…" className="w-full" />
                <Select.Content>
                  {projects.map(p => <Select.Item key={p.id} value={String(p.id)}>{p.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            )} />
            <ErrorMessage>{errors.projectId?.message}</ErrorMessage>
          </Box>

          <Box>
            <Text size="2" weight="bold" as="p" mb="1">Assignee</Text>
            <Controller name="assigneeId" control={control} render={({ field }) => (
              <Select.Root
                onValueChange={(v) => field.onChange(v === 'unassigned' ? null : v)}
                defaultValue={field.value || 'unassigned'}
              >
                <Select.Trigger placeholder="Unassigned" className="w-full" />
                <Select.Content>
                  <Select.Item value="unassigned">Unassigned</Select.Item>
                  {users.map(u => <Select.Item key={u.id} value={u.id}>{u.name}</Select.Item>)}
                </Select.Content>
              </Select.Root>
            )} />
          </Box>

          <Box>
            <Text size="2" weight="bold" as="p" mb="1">Due Date</Text>
            <TextField.Root type="date" {...register('dueDate')} />
          </Box>
        </Grid>

        <Box>
          <Text size="2" weight="bold" as="p" mb="1">Description</Text>
          <Controller name="description" control={control} render={({ field }) => (
            <SimpleMDE {...field} />
          )} />
          <ErrorMessage>{errors.description?.message}</ErrorMessage>
        </Box>

        <Button disabled={isSubmitting} color="violet" size="3">
          {issue ? 'Update Issue' : 'Create Issue'}
          {isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  )
}