import { getServerSession } from 'next-auth';
import authOptions from '@/app/auth/authOptions';
import { redirect } from 'next/navigation';
import IssueForm from '../_components/IssueForm';

const NewIssuePage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');

  return <IssueForm />
}

export default NewIssuePage