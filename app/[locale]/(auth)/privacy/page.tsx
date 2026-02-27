import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: { locale: string };
}

export default function PrivacyPage({ params: { locale } }: PageProps) {
  return (
    <div className="space-y-6 text-sm">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Privacy Policy</h2>
        <p className="text-xs text-muted-foreground">Last updated: February 2026</p>
      </div>

      <div className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          CoFound CA collects and uses your information to help you connect with potential
          co-founders. We are committed to protecting your privacy.
        </p>
        <p>
          <strong className="text-foreground">Information we collect.</strong> We collect
          information you provide when creating your profile (name, email, skills, background),
          and usage data to improve the platform.
        </p>
        <p>
          <strong className="text-foreground">How we use it.</strong> Your profile information
          is used to match you with other founders and is visible to other registered users on
          the platform. We do not sell your data to third parties.
        </p>
        <p>
          <strong className="text-foreground">Telegram.</strong> If you connect your Telegram
          account, your Telegram ID is used solely to send you platform notifications. We do
          not access your Telegram messages.
        </p>
        <p>
          <strong className="text-foreground">Data security.</strong> We use industry-standard
          security measures to protect your data. Your password is never stored in plain text.
        </p>
        <p>
          <strong className="text-foreground">Your rights.</strong> You can delete your account
          and all associated data at any time from Settings → Danger Zone.
        </p>
        <p>
          <strong className="text-foreground">Contact.</strong> For privacy-related questions,
          contact us through the platform.
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
