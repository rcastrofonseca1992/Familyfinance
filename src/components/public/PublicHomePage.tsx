import React, { useEffect } from 'react';
import { ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useIsPWA } from '../utils/useIsPWA';

const primaryColor = '#6FA8D4';

const navigationLinkClasses =
  'text-sm font-medium text-gray-800 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6FA8D4]';

const buttonBase =
  'inline-flex items-center justify-center rounded-lg px-5 h-11 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6FA8D4]';

export const PublicHomePage: React.FC = () => {
  const isPWA = useIsPWA();

  useEffect(() => {
    if (!isPWA) return;

    const redirect = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const target = token ? '/dashboard' : '/login';
      window.location.replace(target);
    };

    redirect();
  }, [isPWA]);

  if (isPWA) return null;

  return (
    <div
      className="public-homepage relative min-h-screen bg-gradient-to-b from-white via-[#f7fbff] to-[#eef5fb] text-gray-900"
      aria-label="FamilyFinance public home page"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-[#6FA8D4]/20 blur-3xl" />
        <div className="absolute bottom-0 right-[-80px] h-56 w-56 rounded-full bg-[#6FA8D4]/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur" role="banner">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2" aria-label="FamilyFinance logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${primaryColor}1a` }}>
              <span className="text-xl font-black" style={{ color: primaryColor }}>FF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-tight" style={{ color: primaryColor }}>
                FamilyFinance
              </span>
              <span className="text-xs text-gray-600">Plan. Save. Grow.</span>
            </div>
          </div>
          <nav className="flex items-center gap-3" aria-label="Primary">
            <a
              className={`${buttonBase} border border-[#6FA8D4] text-[#6FA8D4] hover:bg-[#6FA8D4]/10`}
              href="/login"
            >
              Login
            </a>
            <a
              className={`${buttonBase} bg-[#6FA8D4] text-white hover:bg-[#5f94bd]`}
              href="/signup"
            >
              Create Account
            </a>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8" role="main">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" aria-labelledby="hero-heading">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200">
              Built for EU families
              <span className="inline-flex items-center gap-1 text-[#2f855a]">
                <CheckCircle2 aria-hidden className="h-4 w-4" />
                GDPR-ready
              </span>
            </p>
            <div className="space-y-5">
              <h1 id="hero-heading" className="text-4xl font-black leading-[1.1] text-gray-900 sm:text-5xl">
                Your Family’s Finances, Simplified.
              </h1>
              <p className="max-w-2xl text-lg text-gray-700">
                Track accounts, income, debts, and fixed costs in one secure place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3" aria-label="Primary calls to action">
              <a
                className={`${buttonBase} bg-[#6FA8D4] text-white hover:bg-[#5f94bd]`}
                href="/signup"
              >
                Start for Free
                <ArrowRight aria-hidden className="ml-2 h-5 w-5" />
              </a>
              <a
                className={`${buttonBase} border border-[#6FA8D4] text-[#6FA8D4] hover:bg-[#6FA8D4]/10`}
                href="/login"
              >
                Login
              </a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Benefits">
              {["Unified household view", "Fast onboarding", "Dark & light modes", "Works offline as PWA"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-base text-gray-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6FA8D4]/15 text-[#6FA8D4]">
                    <CheckCircle2 aria-hidden className="h-4 w-4" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-xl" aria-label="Feature preview">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6FA8D4]/10 via-transparent to-white" aria-hidden />
            <div className="relative rounded-xl bg-white/70 p-6 ring-1 ring-gray-100 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                  <span>Household Balance</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-[#2f855a] shadow-sm ring-1 ring-[#2f855a]/15">Up to date</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-600">Accounts</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">€25,430</p>
                    <p className="text-sm text-gray-600">Checking, savings, investments</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-600">Monthly income</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">€4,800</p>
                    <p className="text-sm text-gray-600">Two earners</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-600">Debts</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">€92,000</p>
                    <p className="text-sm text-gray-600">Mortgage + car</p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <p className="text-sm font-medium text-gray-600">Fixed costs</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">€1,430</p>
                    <p className="text-sm text-gray-600">Rent, utilities, subscriptions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16" aria-labelledby="features-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="features-heading" className="text-3xl font-bold text-gray-900">
                Everything your household needs
              </h2>
              <p className="text-base text-gray-700">Stay organized with compact, focused tools.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="Feature cards">
            {[{ title: 'Accounts', description: 'Track balances across checking, savings, and investments.' }, { title: 'Income', description: 'Monitor paychecks and side income with clarity.' }, { title: 'Debts', description: 'Stay on top of mortgages, cards, and loans.' }, { title: 'Fixed Costs', description: 'Keep subscriptions and bills under control.' }].map((feature) => (
              <article key={feature.title} className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#6FA8D4]" aria-label={feature.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#6FA8D4]/15 text-[#6FA8D4]">
                  <Shield aria-hidden className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg" aria-labelledby="privacy-heading">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6FA8D4]">Privacy &amp; Security</p>
              <h2 id="privacy-heading" className="mt-2 text-3xl font-bold text-gray-900">Built for trust and control</h2>
              <p className="mt-3 max-w-2xl text-base text-gray-700">
                We respect your household’s privacy. No ads or trackers—just the tools you need to plan confidently.
              </p>
            </div>
            <div className="w-full max-w-xl">
              <ul className="grid gap-3 sm:grid-cols-2" aria-label="Privacy highlights">
                {['No ads, no trackers', 'EU-based infrastructure', 'User-controlled encryption available', 'Export/delete your data anytime'].map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-lg bg-[#6FA8D4]/10 px-4 py-3 text-sm text-gray-900 ring-1 ring-[#6FA8D4]/20">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6FA8D4] shadow-sm ring-1 ring-[#6FA8D4]/30">
                      <CheckCircle2 aria-hidden className="h-4 w-4" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3" aria-label="Legal links">
            <a className={navigationLinkClasses} href="/privacy">Privacy Policy</a>
            <a className={navigationLinkClasses} href="/terms">Terms</a>
            <a className={navigationLinkClasses} href="mailto:hello@familyfinance.app">Contact</a>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} FamilyFinance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHomePage;
