'use client'

import { Button, Callout, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import SimpleEditor from './SimpleEditor'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface IssueForm {
  title: string
  description: string
}

export default function NewIssueForm() {
  const { register, handleSubmit, control } = useForm<IssueForm>()
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
        
        {/* ✅ Correct way with Radix */}
        <TextField.Root placeholder='Title' {...register('title')}>
        </TextField.Root>

        <SimpleEditor  control={control}/>

        <Button type="submit">Submit New Issue</Button>
      </form>
    </div>
  )
}