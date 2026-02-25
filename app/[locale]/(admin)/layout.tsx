import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Navbar } from '@/components/layout/navbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AdminLayout({
  children,
  params: { locale },
}: AdminLayoutProps) {
  const supabase = createServerSupabaseClient();

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Check admin status from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as { data: { is_admin: boolean } | null, error: any };

  if (!profile?.is_admin) {
    redirect(`/${locale}/discover`);
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      {/* Admin sidebar - desktop only */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top navbar */}
        <Navbar />

        {/* Admin page content */}
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
