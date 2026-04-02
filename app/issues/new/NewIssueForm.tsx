'use client'

import { Button, TextField } from '@radix-ui/themes'
import { useForm } from 'react-hook-form'
import SimpleEditor from './SimpleEditor'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface IssueForm {
  title: string
  description: string
}

export default function NewIssueForm() {
  const { register, handleSubmit, control } = useForm<IssueForm>()
  const router = useRouter();
  

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await axios.post('/api/issues', data);
      router.push('/issues')
    })} className='max-w-xl space-y-3'>
      
      {/* ✅ Correct way with Radix */}
      <TextField.Root placeholder='Title' {...register('title')}>
      </TextField.Root>

      <SimpleEditor  control={control}/>

      <Button type="submit">Submit New Issue</Button>
    </form>
  )
}