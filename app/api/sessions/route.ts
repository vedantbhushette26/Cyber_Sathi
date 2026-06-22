import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

function generateCertCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let segment1 = '';
  let segment2 = '';
  for (let i = 0; i < 4; i++) {
    segment1 += chars.charAt(Math.floor(Math.random() * chars.length));
    segment2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CERT-${segment1}-${segment2}`;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { results } = await req.json(); // Array of { scenarioId, userClassification, flaggedElements }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'Invalid results payload' }, { status: 400 });
    }

    const scenarioIds = results.map(r => r.scenarioId);
    const dbScenarios = await prisma.scenario.findMany({
      where: { id: { in: scenarioIds } }
    });

    const scenarioMap = new Map(dbScenarios.map(s => [s.id, s]));

    let score = 0;
    const feedbackData: {
      scenarioId: string;
      userClassification: boolean;
      isCorrect: boolean;
      flaggedElements: string[];
    }[] = [];

    for (const result of results) {
      const scenario = scenarioMap.get(result.scenarioId);
      if (!scenario) continue;

      const isCorrect = result.userClassification === scenario.isPhishing;
      if (isCorrect) {
        score++;
      }

      feedbackData.push({
        scenarioId: scenario.id,
        userClassification: result.userClassification,
        isCorrect,
        flaggedElements: result.flaggedElements || [],
      });
    }

    const totalScenarios = results.length;
    
    // Database Transaction to ensure consistency
    const session = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.session.create({
        data: {
          userId: user.id,
          score,
          totalScenarios,
          scenarioIds,
        }
      });

      await Promise.all(feedbackData.map(f => 
        tx.feedback.create({
          data: {
            sessionId: createdSession.id,
            scenarioId: f.scenarioId,
            userClassification: f.userClassification,
            isCorrect: f.isCorrect,
            flaggedElements: f.flaggedElements,
          }
        })
      ));

      return createdSession;
    });

    const accuracy = score / totalScenarios;
    let certificateCode = generateCertCode();
    let certificateLevel = '';

    if (accuracy === 1.0) {
      certificateLevel = 'Cyber Sentinel';
    } else if (accuracy >= 0.75) {
      certificateLevel = 'Cyber Defender';
    } else if (accuracy >= 0.5) {
      certificateLevel = 'Security Apprentice';
    } else {
      certificateLevel = 'Cyber Learner';
    }

    // Ensure code is unique
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.certificate.findUnique({
        where: { certificateCode }
      });
      if (!existing) {
        isUnique = true;
      } else {
        certificateCode = generateCertCode();
      }
    }

    await prisma.certificate.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        level: certificateLevel,
        certificateCode,
      }
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      score,
      totalScenarios,
      certificateCode,
      level: certificateLevel,
    });
  } catch (error) {
    console.error('Submit session error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
