import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Dashboard() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch session history for the user
  const userSessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      certificate: true,
    },
  });

  const totalSessions = userSessions.length;
  const totalCorrect = userSessions.reduce((acc, s) => acc + s.score, 0);
  const totalScenarios = userSessions.reduce((acc, s) => acc + s.totalScenarios, 0);
  const averageAccuracy = totalScenarios > 0 ? Math.round((totalCorrect / totalScenarios) * 100) : 0;

  return (
    <div className="flex-1 bg-canvas py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="border-b-2 border-ink pb-6 mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-link font-sans block mb-1">
              Defender Command // Overview
            </span>
            <h1 className="font-display text-4xl font-light uppercase tracking-tight text-ink">
              Training Dashboard
            </h1>
          </div>
          <Link
            href="/training"
            className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-8 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-200 text-center"
          >
            Start New training Session
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="border border-hairline p-8 flex flex-col justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-body font-sans">
              Phishing Detection Index
            </span>
            <div className="my-6">
              <span className="font-display text-5xl md:text-6xl font-light">{averageAccuracy}%</span>
            </div>
            <p className="text-xs text-body font-sans leading-relaxed">
              Your overall detection accuracy across all evaluated communication elements.
            </p>
          </div>

          <div className="border border-hairline p-8 flex flex-col justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-body font-sans">
              Completed Trials
            </span>
            <div className="my-6">
              <span className="font-display text-5xl md:text-6xl font-light">{totalSessions}</span>
            </div>
            <p className="text-xs text-body font-sans leading-relaxed">
              Total simulation runs completed (3-4 phishing/legitimate scenarios per run).
            </p>
          </div>

          <div className="border border-hairline p-8 flex flex-col justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-body font-sans">
              Threats Evaluated
            </span>
            <div className="my-6">
              <span className="font-display text-5xl md:text-6xl font-light">{totalScenarios}</span>
            </div>
            <p className="text-xs text-body font-sans leading-relaxed">
              Total number of communication headers, links, and forms checked.
            </p>
          </div>
        </div>

        {/* History & Certificates split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* History (Col Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl uppercase tracking-wider text-ink border-b border-hairline pb-3 mb-6">
              Evaluation History
            </h3>
            
            {userSessions.length === 0 ? (
              <div className="border border-hairline border-dashed p-12 text-center text-body font-sans text-sm">
                No evaluation trials completed yet. Start a new session above to test your skills.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink uppercase font-bold tracking-wider text-body">
                      <th className="pb-3 pr-4">Session Date</th>
                      <th className="pb-3 px-4">Correct Answers</th>
                      <th className="pb-3 px-4">Accuracy</th>
                      <th className="pb-3 pl-4 text-right">Certificate Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSessions.map((session) => {
                      const pct = Math.round((session.score / session.totalScenarios) * 100);
                      return (
                        <tr key={session.id} className="border-b border-hairline hover:bg-canvas-soft group transition-colors duration-150">
                          <td className="py-4 pr-4 font-mono">
                            {new Date(session.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 px-4">
                            {session.score} / {session.totalScenarios}
                          </td>
                          <td className="py-4 px-4 font-bold">
                            {pct}%
                          </td>
                          <td className="py-4 pl-4 text-right">
                            {session.certificate ? (
                              <Link
                                href={`/certificate/${session.certificate.certificateCode}`}
                                className="text-link font-bold hover:underline group-hover:text-ink transition-colors"
                              >
                                {session.certificate.level} →
                              </Link>
                            ) : (
                              <span className="text-body font-mono">None (Score &lt; 70%)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Certificates */}
          <div>
            <h3 className="font-display text-xl uppercase tracking-wider text-ink border-b border-hairline pb-3 mb-6">
              Security Credentials
            </h3>
            
            {userSessions.filter(s => s.certificate).length === 0 ? (
              <div className="border border-hairline border-dashed p-8 text-center text-body font-sans text-xs">
                Complete a training session with at least 70% accuracy to earn a certificate.
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                {userSessions
                  .filter(s => s.certificate)
                  .map((session) => (
                    <div
                      key={session.certificate!.id}
                      className="border border-ink p-4 flex flex-col justify-between bg-canvas-soft hover:bg-canvas transition-colors duration-150"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-widest font-mono text-body">
                            ID: {session.certificate!.certificateCode}
                          </span>
                          <span className="text-[10px] bg-ink text-canvas font-bold px-2 py-0.5 uppercase tracking-wide">
                            Active
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold mb-1">
                          {session.certificate!.level}
                        </h4>
                        <p className="text-[11px] text-body mb-4">
                          Phishing Awareness Certification
                        </p>
                      </div>
                      <Link
                        href={`/certificate/${session.certificate!.certificateCode}`}
                        className="text-xs font-bold uppercase tracking-wider text-link hover:text-ink transition-colors self-start"
                      >
                        View Certificate →
                      </Link>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
