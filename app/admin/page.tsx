import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex-1 bg-canvas py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="border-b-2 border-ink pb-6 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-link font-sans block mb-1">
            System Administration // Controls
          </span>
          <h1 className="font-display text-4xl font-light uppercase tracking-tight text-ink">
            Scenario Administrator Panel
          </h1>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
