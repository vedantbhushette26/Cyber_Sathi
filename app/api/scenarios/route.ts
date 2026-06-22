import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'all' or 'random'
    const limit = parseInt(searchParams.get('limit') || '3');

    if (mode === 'random') {
      const count = await prisma.scenario.count();
      if (count === 0) return NextResponse.json([]);

      // Fetch all IDs, select random ones, then fetch details
      const scenarios = await prisma.scenario.findMany({
        select: { id: true }
      });
      
      const shuffled = scenarios.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, Math.min(limit, count)).map(s => s.id);

      const randomScenarios = await prisma.scenario.findMany({
        where: { id: { in: selectedIds } }
      });

      return NextResponse.json(randomScenarios);
    }

    // Default to admin mode (must be ADMIN to view all scenarios)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allScenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(allScenarios);
  } catch (error) {
    console.error('Fetch scenarios error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, type, difficulty, isPhishing, content, explanation, suspiciousElements } = await req.json();

    if (!title || !type || !difficulty || isPhishing === undefined || !content || !explanation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newScenario = await prisma.scenario.create({
      data: {
        title,
        type,
        difficulty,
        isPhishing,
        content,
        explanation,
        suspiciousElements: suspiciousElements || [],
      },
    });

    return NextResponse.json(newScenario);
  } catch (error) {
    console.error('Create scenario error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
