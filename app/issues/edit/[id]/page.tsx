import { prisma } from '@/prisma/client';
import { notFound, redirect } from 'next/navigation';
import IssueForm from '../../_components/IssueForm';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/auth/authOptions';

interface Props {
  params: { id: string };
}

const EditIssuePage = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');

  const { id } = await params;
  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(id) },
  });

  if (!issue) notFound();

  return <IssueForm issue={issue} />;
};

export default EditIssuePage;
