"use client";

import { Button, Callout, Text, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import "easymde/dist/easymde.min.css"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { create } from 'node:domain'
import { createIssueSchema } from '@/app/validationSchemas'
import { z } from 'zod' 
import dynamic from "next/dynamic";
import ErrorMessage from '@/app/component/ErrorMessage';

const SimpleMDE = dynamic(
  () => import("react-simplemde-editor"),
  { ssr: false }
);

type IssueForm = z.infer<typeof createIssueSchema>;

export default function NewIssueForm() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<IssueForm>({
    resolver: zodResolver(createIssueSchema)
  });
  const router = useRouter();
  const [error, setError] = useState('');
  

  return (
    <div className="max-w-xl">
      { error && <Callout.Root color="red" className="mb-5 ">
        <Callout.Text>{error}</Callout.Text>
      </Callout.Root>}
      <form onSubmit={handleSubmit(async (data) => {
        try {
          await axios.post('/api/issues', data);
          router.push('/issues');
        } catch (error) {
          setError('An Unexpected error occured.');
        }
        
      })} className='space-y-3'>
        
        <TextField.Root placeholder='Title' {...register('title')}>
        </TextField.Root>
        <ErrorMessage>
          {errors.title?.message}
        </ErrorMessage>
        
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

        <Button type="submit">Submit New Issue</Button>
      </form>
    </div>
  )
}