import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="flex-1 bg-canvas flex flex-col">
      {/* Editorial Hero Block */}
      <section className="border-b border-hairline py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Cover Story (Col Span 2) */}
          <div className="lg:col-span-2 flex flex-col justify-between border-r border-hairline pr-0 lg:pr-12">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-link font-sans mb-3 block">
                Threat Vectors // Edition 2026
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-light tracking-tight leading-none mb-6">
                The Art of Deception: Why Humans Remain the Weakest Link in Digital Defense
              </h1>
              <p className="font-serif text-lg md:text-xl text-ink-soft leading-relaxed mb-8">
                Phishing campaigns have evolved beyond simple typo-squatted emails. Attackers now leverage AI-generated copywriting, spear-phishing structures, and complex single-use login screens. Our interactive portal lets you safely test your detection skills against real-world scenarios.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-8 py-4 font-sans font-bold uppercase tracking-wider text-sm transition-colors duration-200"
                >
                  Access Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-8 py-4 font-sans font-bold uppercase tracking-wider text-sm transition-colors duration-200"
                  >
                    Start Training Now
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="border border-hairline text-ink hover:border-ink px-8 py-4 font-sans font-bold uppercase tracking-wider text-sm transition-colors duration-200"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Editorial Sidebar */}
          <div className="flex flex-col justify-between pl-0 lg:pl-4">
            <div className="border-b border-hairline pb-6 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-body font-sans block mb-1">
                Data Index
              </span>
              <h3 className="font-display text-2xl font-normal leading-tight mb-2">
                91% of cyber attacks start with email spoofing
              </h3>
              <p className="text-xs text-body font-sans leading-relaxed">
                Source: Cybersecurity Infrastructure & Security Agency (CISA) reports show employee action is the primary initial entry point.
              </p>
            </div>

            <div className="border-b border-hairline pb-6 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-body font-sans block mb-1">
                Mechanism
              </span>
              <h3 className="font-display text-2xl font-normal leading-tight mb-2">
                Interactive Target Inspections
              </h3>
              <p className="text-xs text-body font-sans leading-relaxed">
                Rather than basic multiple-choice quizzes, click directly on headers, URL links, and file attachments to flag anomalies.
              </p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-body font-sans block mb-1">
                Reward
              </span>
              <h3 className="font-display text-2xl font-normal leading-tight mb-2">
                Verifiable Certificate
              </h3>
              <p className="text-xs text-body font-sans leading-relaxed">
                Earn a printable digital certificate displaying your Phishing Detection Index (PDI) and custom security recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Row Grid (3 Column) */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-hairline p-6 bg-canvas-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink block mb-2">01 // Identify</span>
              <h4 className="font-display text-xl font-normal mb-3">Spoofed Domains & Urgency</h4>
              <p className="text-xs text-body font-sans leading-relaxed mb-6">
                Learn to check behind the anchor texts. Detect lookalike domain extensions and stressful commands urging actions.
              </p>
            </div>
            <div className="border-t border-hairline pt-4 text-xs font-bold uppercase">
              Email Scenarios
            </div>
          </div>

          <div className="border border-hairline p-6 bg-canvas-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink block mb-2">02 // Inspect</span>
              <h4 className="font-display text-xl font-normal mb-3">Cloned Web Interfaces</h4>
              <p className="text-xs text-body font-sans leading-relaxed mb-6">
                Observe URL structures and secure sockets. Spot misaligned frames and unusual authentication prompts.
              </p>
            </div>
            <div className="border-t border-hairline pt-4 text-xs font-bold uppercase">
              Webpage Portals
            </div>
          </div>

          <div className="border border-hairline p-6 bg-canvas-soft flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-ink block mb-2">03 // Rectify</span>
              <h4 className="font-display text-xl font-normal mb-3">Detailed Explanations</h4>
              <p className="text-xs text-body font-sans leading-relaxed mb-6">
                Get immediate breakdowns on every mistake. Build your personalized profile outlining exact vulnerabilities.
              </p>
            </div>
            <div className="border-t border-hairline pt-4 text-xs font-bold uppercase">
              Personal Feedback
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
