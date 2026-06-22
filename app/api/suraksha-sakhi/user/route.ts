import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user with sessions and feedback
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          include: {
            feedback: {
              include: { scenario: true }
            },
            certificate: true
          }
        },
        certificates: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate scores and categories
    const sessions = userData.sessions;
    const latestSession = sessions[0];
    const previousScores = sessions.map(s => ({
      score: s.score,
      total: s.totalScenarios,
      percentage: Math.round((s.score / s.totalScenarios) * 100),
      date: s.createdAt
    }));

    const latestScore = latestSession
      ? Math.round((latestSession.score / latestSession.totalScenarios) * 100)
      : 0;

    // Analyze weak and strong areas from feedback
    const categoryStats: Record<string, { correct: number; total: number }> = {};

    for (const session of sessions) {
      for (const feedback of session.feedback) {
        const scenario = feedback.scenario;
        const category = getScenarioCategory(scenario);

        if (!categoryStats[category]) {
          categoryStats[category] = { correct: 0, total: 0 };
        }
        categoryStats[category].total++;
        if (feedback.isCorrect) {
          categoryStats[category].correct++;
        }
      }
    }

    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    for (const [category, stats] of Object.entries(categoryStats)) {
      const accuracy = stats.correct / stats.total;
      if (accuracy < 0.6) {
        weakAreas.push(category);
      } else if (accuracy >= 0.8) {
        strongAreas.push(category);
      }
    }

    // Fetch cyber incidents
    const incidents = await prisma.cyberIncident.findMany({
      orderBy: { year: 'desc' }
    });

    return NextResponse.json({
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      latestScore,
      previousScores,
      weakAreas: weakAreas.length > 0 ? weakAreas : ['No weak areas identified yet'],
      strongAreas: strongAreas.length > 0 ? strongAreas : ['No strong areas identified yet'],
      certificates: userData.certificates.map(c => ({
        level: c.level,
        code: c.certificateCode,
        issuedAt: c.issuedAt
      })),
      totalSessions: sessions.length,
      incidents
    });
  } catch (error) {
    console.error('Suraksha Sakhi user data error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getScenarioCategory(scenario: { title: string; type: string }): string {
  const title = scenario.title.toLowerCase();
  const type = scenario.type;

  if (title.includes('domain') || title.includes('spoof')) return 'Domain Spoofing';
  if (title.includes('sender') || title.includes('email') && title.includes('verification')) return 'Sender Verification';
  if (title.includes('otp') || title.includes('sms') || title.includes('text message')) return 'OTP Scam';
  if (title.includes('link') || title.includes('url') || title.includes('hyperlink')) return 'Suspicious Links';
  if (title.includes('attachment') || title.includes('zip') || title.includes('file')) return 'Fake Attachments';
  if (title.includes('ad') || title.includes('advertisement') || title.includes('flash sale')) return 'Fake Ads';
  if (title.includes('login') || title.includes('password') || title.includes('credential')) return 'Credential Theft';
  if (type === 'EMAIL') return 'Phishing Email';
  if (type === 'SMS') return 'SMS Phishing';
  if (type === 'FAKE_AD') return 'Fake Ads';
  return 'General Security';
}
