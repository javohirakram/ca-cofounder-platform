import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Lightbulb,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface PageProps {
  params: { locale: string };
}

export default async function LandingPage({ params: { locale } }: PageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${locale}/discover`);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <Logo size="md" showText />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/login`}>Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/${locale}/register`}>Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" />
              Central Asia&apos;s Co-Founder Network
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Find Your{' '}
              <span className="text-primary">Co-Founder</span>
              <br />
              in Central Asia
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
              Connect with driven entrepreneurs across Kazakhstan, Kyrgyzstan,
              Uzbekistan, Tajikistan, and Turkmenistan. Share ideas, get
              matched by skills, and build the future together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-11 px-7 text-base" asChild>
                <Link href={`/${locale}/register`}>
                  Join for Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 px-7 text-base" asChild>
                <Link href={`/${locale}/login`}>Sign In</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground/60">
              Free to join · No credit card required
            </p>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '500+', label: 'Founders' },
                { value: '5', label: 'Countries' },
                { value: '300+', label: 'Connections Made' },
                { value: '150+', label: 'Ideas Shared' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything you need to find your co-founder
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for the Central Asian startup ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                color: 'text-violet-500 bg-violet-500/10',
                title: 'Smart Matching',
                desc: 'Our algorithm scores compatibility across roles, industries, commitment level, and location — so you connect with founders who actually complement you.',
              },
              {
                icon: Lightbulb,
                color: 'text-amber-500 bg-amber-500/10',
                title: 'Startup Ideas',
                desc: 'Post your startup ideas, browse what others are building, and find collaborators who share your vision before you even start coding.',
              },
              {
                icon: MapPin,
                color: 'text-emerald-500 bg-emerald-500/10',
                title: 'Region-Focused',
                desc: 'Filter by country, language, and ecosystem. Whether you\'re in Almaty, Tashkent, or Bishkek — find the right people in your market.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-border/50 bg-card p-6 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-muted/20 border-y border-border/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Up and running in minutes
              </h2>
              <p className="text-muted-foreground">
                Three simple steps to find your perfect co-founder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border/60" />

              {[
                {
                  step: '01',
                  icon: Users,
                  title: 'Create your profile',
                  desc: 'Tell us about your skills, background, industries you care about, and what kind of co-founder you\'re looking for.',
                },
                {
                  step: '02',
                  icon: Sparkles,
                  title: 'Get matched',
                  desc: 'We surface your top matches daily — scored by role complementarity, shared interests, and commitment level.',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Connect & build',
                  desc: 'Send a connection request with a personal note. Once accepted, start a conversation and start building together.',
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="relative flex flex-col items-center text-center gap-4">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-background shadow-sm">
                    <Icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {step.replace('0', '')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Countries ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium uppercase tracking-wider">
            Serving founders across
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { flag: '🇰🇿', name: 'Kazakhstan' },
              { flag: '🇰🇬', name: 'Kyrgyzstan' },
              { flag: '🇺🇿', name: 'Uzbekistan' },
              { flag: '🇹🇯', name: 'Tajikistan' },
              { flag: '🇹🇲', name: 'Turkmenistan' },
            ].map(({ flag, name }) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                <span className="text-base">{flag}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-primary/5 px-8 py-14 text-center">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to find your co-founder?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join hundreds of founders already building in Central Asia. It&apos;s free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Button size="lg" className="w-full sm:w-auto gap-2 h-11 px-8 text-base" asChild>
                <Link href={`/${locale}/register`}>
                  Create your profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {['Free to join', 'No credit card', '2 min setup'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" showText />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href={`/${locale}/login`} className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href={`/${locale}/register`} className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} CoFound CA
          </p>
        </div>
      </footer>

    </div>
  );
}
