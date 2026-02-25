import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface PageProps {
  params: { locale: string };
}

export default async function LocaleRootPage({ params: { locale } }: PageProps) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${locale}/discover`);
  } else {
    redirect(`/${locale}/login`);
  }
}
