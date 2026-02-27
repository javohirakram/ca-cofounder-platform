import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { locale: string };
}

export default function TermsPage({ params: { locale } }: PageProps) {
  return (
    <div className="space-y-6 text-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Terms of Service</h2>
        <p className="text-xs text-muted-foreground">Last updated: February 2026</p>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          By using CoFound CA, you agree to use the platform respectfully and in good faith.
          This platform is designed to help entrepreneurs in Central Asia connect with
          potential co-founders.
        </p>
        <p>
          <strong className="text-foreground">Acceptable use.</strong> You may not use this
          platform to harass, spam, or deceive other users. All information in your profile
          must be accurate and truthful.
        </p>
        <p>
          <strong className="text-foreground">Content.</strong> You retain ownership of any
          content you post. By posting, you grant CoFound CA a license to display it on the
          platform.
        </p>
        <p>
          <strong className="text-foreground">Account.</strong> You are responsible for
          maintaining the security of your account. Notify us immediately of any unauthorized
          access.
        </p>
        <p>
          <strong className="text-foreground">Termination.</strong> We reserve the right to
          suspend accounts that violate these terms.
        </p>
        <p>
          <strong className="text-foreground">Contact.</strong> For questions about these
          terms, contact us through the platform.
        </p>
      </div>

      <Link
        href={`/${locale}/register`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Register
      </Link>
    </div>
  );
}
