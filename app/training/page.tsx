import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import TrainingClient from '@/components/TrainingClient';

export default async function TrainingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <TrainingClient />;
}
