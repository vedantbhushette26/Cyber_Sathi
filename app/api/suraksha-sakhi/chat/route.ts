import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function getSystemPrompt(userData: {
  name: string;
  latestScore: number;
  weakAreas: string[];
  strongAreas: string[];
  previousScores: { percentage: number; date: Date }[];
  certificates: { level: string }[];
}) {
  const scoreContext = userData.previousScores.length > 0
    ? `Previous scores: ${userData.previousScores.map(s => s.percentage + '%').join(', ')}`
    : 'No previous assessments completed yet.';

  const certContext = userData.certificates.length > 0
    ? `Certificates earned: ${userData.certificates.map(c => c.level).join(', ')}`
    : 'No certificates earned yet.';

  return `You are Suraksha Sakhi, an AI Cybersecurity Mentor. You are NOT a generic chatbot — you are a personalized cybersecurity mentor for this specific user.

USER PROFILE:
- Name: ${userData.name}
- Latest Assessment Score: ${userData.latestScore}%
- ${scoreContext}
- Weak Areas: ${userData.weakAreas.join(', ')}
- Strong Areas: ${userData.strongAreas.join(', ')}
- ${certContext}

YOUR ROLE:
1. Provide personalized cybersecurity guidance based on the user's assessment performance
2. Explain why they got specific questions wrong using real-world examples
3. Create personalized improvement plans targeting their weak areas
4. Answer cybersecurity questions in simple, beginner-friendly language
5. Reference real cyber incidents when explaining concepts
6. Always be encouraging but honest about areas needing improvement

RESPONSE RULES:
- Always personalize responses using the user's actual data
- Reference their specific weak and strong areas
- Use simple language — avoid jargon unless explaining it
- When explaining mistakes, show the exact indicators they missed
- When creating learning plans, focus on their weak areas first
- Include real-world examples and incidents when relevant
- Never behave like a generic chatbot — always reference their profile
- Keep responses concise but informative (2-4 paragraphs max)
- Use a warm, mentoring tone

CATEGORIES OF EXPERTISE:
- Domain Spoofing: Fake URLs and sender addresses
- Sender Verification: Checking email authenticity
- OTP Scam: SMS-based attacks and verification fraud
- Suspicious Links: Identifying malicious URLs
- Fake Attachments: Malicious file detection
- Fake Ads: Fraudulent advertisements
- Credential Theft: Password and login security
- Phishing Email: Email-based attacks
- SMS Phishing: Text message attacks`;
}

function getActionPrompt(action: string, userData: {
  name: string;
  latestScore: number;
  weakAreas: string[];
  strongAreas: string[];
  previousScores: { percentage: number }[];
}) {
  const weakAreasList = userData.weakAreas.join('\n- ');
  const strongAreasList = userData.strongAreas.join('\n- ');

  switch (action) {
    case 'explain_mistakes':
      return `The user wants to understand their mistakes. 

Based on their weak areas:
- ${weakAreasList}

Explain in detail:
1. What concepts they struggle with
2. Common mistakes made in these areas
3. What indicators they should look for
4. Step-by-step how to identify these threats correctly
5. A real-world example of each type of attack

Use their latest score of ${userData.latestScore}% to provide context.`;

    case 'real_incidents':
      return `The user wants to see real cybersecurity incidents.

Based on their weak areas (${weakAreasList}), explain 2-3 real incidents that are relevant to their weaknesses. For each incident:
1. What happened (title and year)
2. How the attack succeeded
3. What the user should learn from it
4. How to prevent similar attacks

Make it engaging and educational.`;

    case 'learning_plan':
      return `The user wants a personalized improvement plan.

Their weak areas are:
- ${weakAreasList}

Their strong areas are:
- ${strongAreasList}

Current score: ${userData.latestScore}%

Generate a 5-day learning plan:
- Day 1-2: Focus on their weakest areas
- Day 3: Practice identification skills
- Day 4: Learn about their other weak areas
- Day 5: Review and retake assessment

For each day, provide:
1. What to learn
2. Specific examples to study
3. A practice exercise
4. Expected outcome

Make it actionable and realistic.`;

    case 'tips':
      return `The user wants cybersecurity tips.

Based on their profile (score: ${userData.latestScore}%, weak areas: ${weakAreasList}), provide 5 personalized tips:
1. One tip for each of their weak areas
2. One general security best practice
3. One tip based on their strong areas to build confidence

Make each tip specific, actionable, and relevant to their situation.`;

    default:
      return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, action, history } = await req.json();

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        sessions: {
          orderBy: { createdAt: 'desc' },
          include: {
            feedback: { include: { scenario: true } },
            certificate: true
          }
        },
        certificates: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const sessions = userData.sessions;
    const latestSession = sessions[0];
    const latestScore = latestSession
      ? Math.round((latestSession.score / latestSession.totalScenarios) * 100)
      : 0;

    const previousScores = sessions.map(s => ({
      percentage: Math.round((s.score / s.totalScenarios) * 100),
      date: s.createdAt
    }));

    const categoryStats: Record<string, { correct: number; total: number }> = {};
    for (const session of sessions) {
      for (const feedback of session.feedback) {
        const category = getScenarioCategory(feedback.scenario);
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
    for (const [cat, stats] of Object.entries(categoryStats)) {
      const accuracy = stats.correct / stats.total;
      if (accuracy < 0.6) weakAreas.push(cat);
      else if (accuracy >= 0.8) strongAreas.push(cat);
    }

    if (weakAreas.length === 0 && sessions.length > 0) weakAreas.push('None identified');
    if (strongAreas.length === 0 && sessions.length > 0) strongAreas.push('None identified');

    const userProfile = {
      name: userData.name || userData.email.split('@')[0],
      latestScore,
      weakAreas: weakAreas.length > 0 ? weakAreas : ['No data yet'],
      strongAreas: strongAreas.length > 0 ? strongAreas : ['No data yet'],
      previousScores,
      certificates: userData.certificates.map(c => ({ level: c.level, date: c.issuedAt }))
    };

    // Build messages
    const systemPrompt = await getSystemPrompt(userProfile);
    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

    // Add action prompt if applicable
    if (action) {
      const actionPrompt = getActionPrompt(action, userProfile);
      if (actionPrompt) {
        messages.push({ role: 'user', content: actionPrompt });
      }
    }

    // Add chat history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current message
    if (message) {
      messages.push({ role: 'user', content: message });
    }

    // Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Suraksha Sakhi chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getScenarioCategory(scenario: { title: string; type: string }): string {
  const title = scenario.title.toLowerCase();
  if (title.includes('domain') || title.includes('spoof')) return 'Domain Spoofing';
  if (title.includes('otp') || title.includes('sms')) return 'OTP Scam';
  if (title.includes('link') || title.includes('url')) return 'Suspicious Links';
  if (title.includes('attachment') || title.includes('zip')) return 'Fake Attachments';
  if (title.includes('ad') || title.includes('advertisement') || title.includes('flash sale')) return 'Fake Ads';
  if (title.includes('login') || title.includes('password')) return 'Credential Theft';
  if (scenario.type === 'EMAIL') return 'Phishing Email';
  if (scenario.type === 'SMS') return 'SMS Phishing';
  if (scenario.type === 'FAKE_AD') return 'Fake Ads';
  return 'General Security';
}
