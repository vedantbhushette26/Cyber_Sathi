'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertTriangle, BookOpen, TrendingUp, Lightbulb, RotateCcw } from 'lucide-react';

interface UserData {
  name: string;
  latestScore: number;
  weakAreas: string[];
  strongAreas: string[];
  previousScores: { percentage: number; date: string }[];
  certificates: { level: string; code: string; issuedAt: string }[];
  totalSessions: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
}

const quickActions: QuickAction[] = [
  { id: 'explain_mistakes', label: 'Explain My Mistakes', icon: <AlertTriangle className="w-4 h-4" />, action: 'explain_mistakes' },
  { id: 'real_incidents', label: 'Show Real Incidents', icon: <BookOpen className="w-4 h-4" />, action: 'real_incidents' },
  { id: 'learning_plan', label: 'Generate Learning Plan', icon: <TrendingUp className="w-4 h-4" />, action: 'learning_plan' },
  { id: 'tips', label: 'Cybersecurity Tips', icon: <Lightbulb className="w-4 h-4" />, action: 'tips' },
  { id: 'retake', label: 'Retake Assessment', icon: <RotateCcw className="w-4 h-4" />, action: 'retake' },
];

export default function SurakshaSakhiPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user data and generate welcome message
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/suraksha-sakhi/user');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);

          // Generate personalized welcome message
          const welcomeMessage = generateWelcomeMessage(data);
          setMessages([{ role: 'assistant', content: welcomeMessage }]);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateWelcomeMessage = (data: UserData): string => {
    const scoreComment = data.latestScore >= 80
      ? 'Excellent performance!'
      : data.latestScore >= 60
      ? 'Good effort, but there\'s room for improvement.'
      : 'You have significant areas to work on.';

    const weakList = data.weakAreas.filter(a => a !== 'No data yet' && a !== 'None identified');
    const strongList = data.strongAreas.filter(a => a !== 'No data yet' && a !== 'None identified');

    let weakSection = '';
    if (weakList.length > 0) {
      weakSection = `\n\nHowever, I noticed you struggled with:\n${weakList.map(a => `- ${a}`).join('\n')}`;
    }

    let strongSection = '';
    if (strongList.length > 0) {
      strongSection = `\n\nYour strengths include:\n${strongList.map(a => `- ${a}`).join('\n')}`;
    }

    let certSection = '';
    if (data.certificates.length > 0) {
      certSection = `\n\nYou've earned ${data.certificates.length} certificate(s): ${data.certificates.map(c => c.level).join(', ')}.`;
    }

    return `Hello ${data.name}! 👋

I'm Suraksha Sakhi, your personal cybersecurity mentor.

I reviewed your latest cybersecurity assessment. You scored ${data.latestScore}%. ${scoreComment}
${strongSection}${weakSection}${certSection}

How can I help you today? You can ask me to explain your mistakes, show real-world incidents, create a learning plan, or answer any cybersecurity questions.`;
  };

  const handleSendMessage = async (message: string, action?: string) => {
    if (!message.trim() && !action) return;

    const userMessage: ChatMessage = { role: 'user', content: message || action || '' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch('/api/suraksha-sakhi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || undefined,
          action: action || undefined,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      if (res.ok && data.message) {
        // Simulate typing delay
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
          setIsTyping(false);
        }, 500);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.'
        }]);
        setIsTyping(false);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I could not connect to the AI service. Please try again later.'
      }]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.action === 'retake') {
      router.push('/training');
      return;
    }
    handleSendMessage(action.label, action.action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex-1 bg-canvas flex flex-col">
      {/* Header */}
      <div className="border-b border-hairline bg-canvas-soft">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ink text-canvas flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold uppercase tracking-wider text-ink">
                Suraksha Sakhi
              </h1>
              <p className="text-[10px] text-body font-sans uppercase tracking-wider">
                AI Cybersecurity Mentor
              </p>
            </div>
          </div>
          {userData && (
            <div className="hidden md:flex items-center gap-4 text-xs font-sans">
              <div className="text-right">
                <span className="text-body block">Latest Score</span>
                <span className="font-bold text-ink font-mono">{userData.latestScore}%</span>
              </div>
              <div className="w-px h-8 bg-hairline"></div>
              <div className="text-right">
                <span className="text-body block">Sessions</span>
                <span className="font-bold text-ink font-mono">{userData.totalSessions}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Stats Bar */}
      {userData && (
        <div className="border-b border-hairline bg-canvas">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto text-xs font-sans">
            {userData.weakAreas.filter(a => a !== 'No data yet' && a !== 'None identified').length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-body uppercase tracking-wider font-bold text-[10px]">Weak:</span>
                {userData.weakAreas.filter(a => a !== 'No data yet' && a !== 'None identified').map(area => (
                  <span key={area} className="bg-red-100 text-red-700 px-2 py-0.5 border border-red-200 text-[10px] font-mono">
                    {area}
                  </span>
                ))}
              </div>
            )}
            {userData.strongAreas.filter(a => a !== 'No data yet' && a !== 'None identified').length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-body uppercase tracking-wider font-bold text-[10px]">Strong:</span>
                {userData.strongAreas.filter(a => a !== 'No data yet' && a !== 'None identified').map(area => (
                  <span key={area} className="bg-green-100 text-green-700 px-2 py-0.5 border border-green-200 text-[10px] font-mono">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-b border-hairline bg-canvas-soft">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 border border-hairline bg-canvas text-xs font-bold uppercase tracking-wider text-ink hover:bg-ink hover:text-canvas transition-colors duration-200 cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-ink text-canvas flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm font-sans leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-ink text-canvas'
                      : 'bg-canvas-soft border border-hairline text-ink'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-canvas-soft border border-hairline text-ink flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-ink text-canvas flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-canvas-soft border border-hairline px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-body rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-body rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-body rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-hairline bg-canvas">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about cybersecurity, your assessment, or request a learning plan..."
              disabled={isLoading}
              className="flex-1 bg-canvas-soft border border-hairline px-4 py-3 text-sm font-sans text-ink placeholder:text-body outline-none focus:border-ink transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="bg-ink text-canvas px-6 py-3 font-sans font-bold uppercase tracking-wider text-xs hover:bg-canvas hover:text-ink border border-ink transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-body mt-2 font-sans text-center">
            Suraksha Sakhi uses AI to provide personalized guidance. Responses are based on your assessment data.
          </p>
        </div>
      </div>
    </div>
  );
}
