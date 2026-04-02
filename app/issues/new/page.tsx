import { Button, TextField } from '@radix-ui/themes'
import SimpleEditor from './SimpleEditor'

const NewIssuePage = () => {
  return (
    <div className='max-w-xl space-y-3'>
      <TextField.Root placeholder='Title' />
      <SimpleEditor />
      <Button>Submit New Issue</Button>
    </div>
  )
}

export default NewIssuePage