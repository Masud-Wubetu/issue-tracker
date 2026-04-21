"use client";

import { Button, Callout, Text, TextField, Grid, Flex, Select } from '@radix-ui/themes'
import { useForm, Controller } from 'react-hook-form'
import "easymde/dist/easymde.min.css"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createIssueSchema } from '@/app/validationSchemas'
import { z } from 'zod' 
import dynamic from "next/dynamic";
import { ErrorMessage, Spinner } from '@/app/component';
import { Issue } from '@prisma/client';

const SimpleMDE = dynamic(
  () => import("react-simplemde-editor"),
  { ssr: false }
);

type IssueFormData = z.infer<typeof createIssueSchema>;

interface Props {
    issue?: Issue;
}

export default function IssueForm({ issue }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<IssueFormData>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: issue?.title,
      description: issue?.description,
      priority: issue?.priority || 'MEDIUM',
      type: issue?.type || 'BUG'
    }
  });
  const router = useRouter();
  const [error, setError] = useState('');
  const [ isSubmitting, setSubmitting ] = useState(false);
  
  const onSubmit = handleSubmit(async (data) => {
        try {
          setSubmitting(true);
          if (issue)
            await axios.patch('/api/issues/' + issue.id, data);
          else
            await axios.post('/api/issues', data);
          
          router.push('/issues');
          router.refresh();
        } catch (error) {
          setError('An Unexpected error occured.');
          setSubmitting(false);
        }
      })

  return (
    <div className="max-w-xl">
      { error && <Callout.Root color="red" className="mb-5 ">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>}
      <form onSubmit={onSubmit} className='space-y-3'>
        
        <TextField.Root placeholder='Title' {...register('title')}>
        </TextField.Root>
        <ErrorMessage>
          {errors.title?.message}
        </ErrorMessage>

        <Grid columns={{ initial: "1", sm: "2" }} gap="3">
          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">Type</Text>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                  <Select.Trigger placeholder="Select Type..." />
                  <Select.Content>
                    <Select.Item value="BUG">Bug</Select.Item>
                    <Select.Item value="FEATURE">Feature</Select.Item>
                    <Select.Item value="TASK">Task</Select.Item>
                    <Select.Item value="IMPROVEMENT">Improvement</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>

          <Flex direction="column" gap="1">
            <Text size="2" weight="bold">Priority</Text>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select.Root onValueChange={field.onChange} defaultValue={field.value}>
                  <Select.Trigger placeholder="Select Priority..." />
                  <Select.Content>
                    <Select.Item value="LOW">Low</Select.Item>
                    <Select.Item value="MEDIUM">Medium</Select.Item>
                    <Select.Item value="HIGH">High</Select.Item>
                    <Select.Item value="CRITICAL">Critical</Select.Item>
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>
        </Grid>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <SimpleMDE {...field} />
          )}
        />
        <ErrorMessage>
          {errors.description?.message}
        </ErrorMessage>

        <Button disabled={isSubmitting}>
            {issue ? 'Update Issue' : 'Submit New Issue'} 
            { isSubmitting && <Spinner/> }
        </Button>
      </form>
    </div>
  )
}