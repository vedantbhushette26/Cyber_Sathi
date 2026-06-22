'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShieldCheck, ArrowRight, Check, X, ShieldAlert } from 'lucide-react';

interface SuspiciousElement {
  id: string;
  target: string;
  label: string;
  explanation: string;
}

interface ScenarioContent {
  sender?: string;
  senderName?: string;
  recipient?: string;
  subject?: string;
  date?: string;
  body?: string;
  url?: string;
  pageTitle?: string;
  company?: string;
  bodyHtml?: string;
  senderPhone?: string;
  recipientPhone?: string;
  message?: string;
  adHeadline?: string;
  adBody?: string;
  adCTA?: string;
  adImage?: string;
  adSource?: string;
  adPrice?: string;
}

interface Scenario {
  id: string;
  title: string;
  type: 'EMAIL' | 'WEBPAGE' | 'SMS' | 'FAKE_AD';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isPhishing: boolean;
  explanation: string;
  content: ScenarioContent;
  suspiciousElements: SuspiciousElement[];
}

export default function TrainingClient() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Attempt states
  const [flaggedElements, setFlaggedElements] = useState<string[]>([]);
  const [userClassification, setUserClassification] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  
  // Session completion state
  const [submittingSession, setSubmittingSession] = useState(false);

  useEffect(() => {
    // Fetch all 8 scenarios per training session
    const loadScenarios = async () => {
      try {
        const res = await fetch('/api/scenarios?mode=random&limit=8');
        if (res.ok) {
          const data = await res.json();
          setScenarios(data);
        }
      } catch (err) {
        console.error('Error loading training scenarios:', err);
      } finally {
        setLoading(false);
      }
    };
    loadScenarios();
  }, []);

  const toggleFlag = (id: string) => {
    if (flaggedElements.includes(id)) {
      setFlaggedElements(flaggedElements.filter(item => item !== id));
    } else {
      setFlaggedElements([...flaggedElements, id]);
    }
  };

  const handleNext = () => {
    const currentScenario = scenarios[currentIndex];
    
    // Save response details
    const currentResult = {
      scenarioId: currentScenario.id,
      userClassification: userClassification!,
      flaggedElements: flaggedElements,
    };
    
    const updatedResults = [...sessionResults, currentResult];
    setSessionResults(updatedResults);

    if (currentIndex + 1 < scenarios.length) {
      // Go to next
      setCurrentIndex(currentIndex + 1);
      setFlaggedElements([]);
      setUserClassification(null);
      setSubmitted(false);
    } else {
      // Submit session results to backend
      submitSession(updatedResults);
    }
  };

  const submitSession = async (results: any[]) => {
    setSubmittingSession(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.certificateCode) {
          router.push(`/certificate/${data.certificateCode}`);
        } else {
          router.push('/dashboard?msg=complete_no_cert');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Submit session error:', err);
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-canvas font-sans">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ink border-t-transparent animate-spin mx-auto mb-6"></div>
          <h2 className="font-display text-xl uppercase tracking-wider">Synchronizing Scenarios...</h2>
          <p className="text-xs text-body mt-2">Loading interactive modules from cybersecurity databank.</p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 bg-canvas text-center px-6">
        <ShieldAlert className="w-16 h-16 text-body mb-6" />
        <h2 className="font-display text-2xl uppercase tracking-wider mb-2">No Scenarios Available</h2>
        <p className="text-sm text-body max-w-md mx-auto mb-6">
          The threat databank is currently empty. Ask an administrator to upload scenarios or seed the database.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-ink hover:text-canvas transition-colors duration-150"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const scenario = scenarios[currentIndex];
  const isCorrectClassification = userClassification === scenario.isPhishing;

  // Split texts by targets to make them interactive clickable inline spans
  const parseAndHighlight = (
    text: string,
    elementsList: SuspiciousElement[],
    textClass: string = "font-serif"
  ) => {
    if (!text || elementsList.length === 0) return <span className={textClass}>{text}</span>;

    // Sort by target string length descending to avoid sub-string replacement conflict
    const sortedEls = [...elementsList].sort((a, b) => b.target.length - a.target.length);
    
    let textParts = [{ text, isTarget: false, id: '', label: '', explanation: '' }];

    sortedEls.forEach(el => {
      const newParts: typeof textParts = [];
      textParts.forEach(part => {
        if (part.isTarget) {
          newParts.push(part);
          return;
        }

        const index = part.text.indexOf(el.target);
        if (index === -1) {
          newParts.push(part);
        } else {
          if (index > 0) {
            newParts.push({ text: part.text.substring(0, index), isTarget: false, id: '', label: '', explanation: '' });
          }
          newParts.push({
            text: el.target,
            isTarget: true,
            id: el.id,
            label: el.label,
            explanation: el.explanation
          });
          if (index + el.target.length < part.text.length) {
            newParts.push({ text: part.text.substring(index + el.target.length), isTarget: false, id: '', label: '', explanation: '' });
          }
        }
      });
      textParts = newParts;
    });

    return (
      <span className={textClass}>
        {textParts.map((part, idx) => {
          if (part.isTarget) {
            const isFlagged = flaggedElements.includes(part.id);
            const isAnomalous = scenario.isPhishing;
            
            let classes = "phishing-highlight-target";
            if (isFlagged) classes += " flagged";
            
            if (submitted) {
              if (isAnomalous) {
                classes += " reveal-correct";
              } else {
                classes += " reveal-missed";
              }
            }

            return (
              <span
                key={idx}
                onClick={() => !submitted && toggleFlag(part.id)}
                className={classes}
                title={submitted ? `${part.label}: ${part.explanation}` : "Click to flag as suspicious"}
              >
                {part.text}
              </span>
            );
          }
          return <span key={idx}>{part.text}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-canvas flex flex-col">
      
      {/* Session Progress Header */}
      <div className="border-b border-hairline py-4 px-6 bg-canvas-soft flex items-center justify-between text-xs font-bold font-sans uppercase">
        <div className="flex items-center gap-2">
          <span className="bg-ink text-canvas px-2 py-0.5 font-mono">
            {currentIndex + 1} / {scenarios.length}
          </span>
          <span>Threat Evaluation Session</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Difficulty: <span className="font-mono text-link">{scenario.difficulty}</span></span>
          <span>Vector: <span className="font-mono text-link">{scenario.type}</span></span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto w-full">
        
        {/* Scenario Simulator View (Left, col-span-2) */}
        <div className="lg:col-span-2 border-r border-hairline p-6 flex flex-col justify-center">
          
          {scenario.type === 'EMAIL' ? (
            /* Email client simulator */
            <div className="border border-ink bg-canvas w-full max-w-4xl mx-auto shadow-none">
              
              {/* Mail client toolbar */}
              <div className="bg-canvas-soft border-b border-ink px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="text-[10px] uppercase font-mono tracking-widest text-body ml-4">
                  Incoming Mail Gateway // Secure Connection
                </div>
              </div>

              {/* Mail Headers */}
              <div className="border-b border-hairline p-4 space-y-2 text-xs font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-20 font-bold uppercase tracking-wider text-body">From:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-ink">{scenario.content.senderName}</span>
                    {parseAndHighlight(
                      `<${scenario.content.sender}>`,
                      scenario.suspiciousElements,
                      "text-body font-mono text-[11px]"
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-20 font-bold uppercase tracking-wider text-body">To:</span>
                  <span className="text-body font-mono">{scenario.content.recipient}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-20 font-bold uppercase tracking-wider text-body">Date:</span>
                  <span className="text-body font-mono">{scenario.content.date}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center border-t border-hairline pt-2 mt-2">
                  <span className="w-20 font-bold uppercase tracking-wider text-body">Subject:</span>
                  {parseAndHighlight(
                    scenario.content.subject || '',
                    scenario.suspiciousElements,
                    "font-bold text-ink text-sm"
                  )}
                </div>
              </div>

              {/* Mail Body */}
              <div className="p-6 bg-canvas max-h-[400px] overflow-y-auto">
                {parseAndHighlight(
                  scenario.content.body || '',
                  scenario.suspiciousElements,
                  "whitespace-pre-line font-serif text-[15px] text-ink-soft leading-relaxed"
                )}
              </div>

            </div>
          ) : scenario.type === 'SMS' ? (
            /* SMS / Mobile Message simulator */
            <div className="border border-ink bg-canvas w-full max-w-sm mx-auto shadow-none">
              
              {/* Phone status bar */}
              <div className="bg-canvas-soft border-b border-ink px-4 py-2 flex items-center justify-between text-[10px] font-mono text-body">
                <span>9:41 AM</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Messages</span>
                <div className="flex items-center gap-1.5">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Message header */}
              <div className="bg-canvas-soft border-b border-ink px-4 py-3 text-center">
                <span className="text-xs font-bold font-mono text-ink">{scenario.content.senderPhone}</span>
              </div>

              {/* Message thread */}
              <div className="p-4 space-y-3 min-h-[320px] bg-canvas">
                
                {/* Date stamp */}
                <div className="text-center">
                  <span className="text-[9px] text-body font-mono uppercase tracking-wider">Today, {scenario.content.date || 'Now'}</span>
                </div>

                {/* Received SMS bubble */}
                <div className="flex justify-start">
                  <div className="bg-canvas-soft border border-hairline px-4 py-3 max-w-[85%] font-sans">
                    <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                      {parseAndHighlight(
                        scenario.content.message || '',
                        scenario.suspiciousElements,
                        "text-sm"
                      )}
                    </p>
                  </div>
                </div>

              </div>

              {/* SMS input bar (visual only) */}
              <div className="border-t border-ink px-4 py-3 flex items-center gap-3 bg-canvas-soft">
                <div className="flex-1 bg-canvas border border-hairline px-3 py-2 text-xs text-body font-sans rounded-none">
                  Text Message
                </div>
                <div className="w-16 h-8 bg-canvas-soft border border-hairline flex items-center justify-center">
                  <span className="text-[10px] font-bold text-body uppercase">Send</span>
                </div>
              </div>

            </div>

          ) : scenario.type === 'FAKE_AD' ? (
            /* Fake Advertisement / Sponsored Post simulator */
            <div className="border border-ink bg-canvas w-full max-w-lg mx-auto shadow-none">
              
              {/* Ad platform header */}
              <div className="bg-canvas-soft border-b border-ink px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-body">Sponsored Content</span>
                <span className="text-[10px] text-body">···</span>
              </div>

              {/* Ad Card */}
              <div className="p-4">
                
                {/* Source / Branding */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-canvas-soft border border-hairline flex items-center justify-center text-[10px] font-bold text-body uppercase">
                    {scenario.content.adSource ? scenario.content.adSource.charAt(0) : 'A'}
                  </div>
                  <div>
                    {parseAndHighlight(
                      scenario.content.adSource || '',
                      scenario.suspiciousElements,
                      "text-xs font-bold text-ink block"
                    )}
                    <span className="text-[10px] text-body font-sans">Sponsored</span>
                  </div>
                </div>

                {/* Ad Image placeholder */}
                <div className="bg-canvas-soft border border-hairline h-48 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">📦</span>
                    <span className="text-[10px] text-body font-sans uppercase tracking-wider">Ad Image</span>
                  </div>
                </div>

                {/* Ad Headline */}
                <h3 className="font-bold text-ink text-base mb-2 leading-snug">
                  {parseAndHighlight(
                    scenario.content.adHeadline || '',
                    scenario.suspiciousElements,
                    "text-base font-bold"
                  )}
                </h3>

                {/* Ad Body */}
                <p className="text-xs text-body mb-4 font-serif leading-relaxed">
                  {parseAndHighlight(
                    scenario.content.adBody || '',
                    scenario.suspiciousElements,
                    "text-xs font-serif"
                  )}
                </p>

                {/* Price */}
                {scenario.content.adPrice && (
                  <p className="text-xl font-bold text-link mb-4 font-sans">
                    {parseAndHighlight(
                      scenario.content.adPrice,
                      scenario.suspiciousElements,
                      "text-xl font-bold text-link"
                    )}
                  </p>
                )}

                {/* CTA Button */}
                <button
                  type="button"
                  className="w-full bg-[#1877f2] text-white py-3 text-xs font-bold uppercase tracking-wider rounded-none cursor-not-allowed opacity-90"
                >
                  {scenario.content.adCTA || 'Learn More'}
                </button>

              </div>

            </div>

          ) : (
            /* Webpage portal simulator */
            <div className="border border-ink bg-canvas w-full max-w-4xl mx-auto shadow-none">
              
              {/* Browser chrome header */}
              <div className="bg-canvas-soft border-b border-ink px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink">
                    {scenario.content.pageTitle}
                  </div>
                  <div className="w-4"></div>
                </div>

                {/* Address bar */}
                <div className="flex items-center bg-canvas border border-hairline px-3 py-1 text-xs font-mono w-full">
                  <span className="text-green-600 mr-1.5">🔒</span>
                  {parseAndHighlight(
                    scenario.content.url || '',
                    scenario.suspiciousElements,
                    "text-ink text-[11px] truncate flex-1"
                  )}
                </div>
              </div>

              {/* Web Content Render (rendered inside container) */}
              <div className="bg-canvas-soft p-12 flex justify-center items-center min-h-[300px]">
                <div
                  className="bg-canvas p-8 border border-hairline shadow-none w-full max-w-sm font-sans"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('phishing-highlight-target')) {
                      // Clicked inside HTML, handled manually
                    }
                  }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                    alt="Microsoft logo"
                    className="h-5 mb-6"
                  />
                  <h2 className="text-xl font-bold text-ink mb-1">Sign In</h2>
                  <p className="text-xs text-body mb-6">
                    to access shared document{" "}
                    {parseAndHighlight(
                      "Q4_Financial_Report.xlsx",
                      scenario.suspiciousElements,
                      "font-bold text-link font-sans"
                    )}
                  </p>
                  <input
                    type="email"
                    value="john.doe@corporate.com"
                    readOnly
                    className="w-full p-2 border border-hairline mb-3 bg-canvas-soft text-body rounded-none text-xs"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    disabled
                    className="w-full p-2 border border-hairline mb-4 bg-canvas-soft rounded-none text-xs"
                  />
                  <button
                    type="button"
                    disabled
                    className="w-full bg-[#0067b8] text-white p-2.5 text-xs font-bold uppercase tracking-wider rounded-none opacity-90 cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          )}

          <p className="text-[11px] text-body font-sans mt-4 text-center">
            💡 <em>Click directly on headers, links, address bars, or phrases to toggle suspicious flags.</em>
          </p>
        </div>

        {/* Panel controls (Right, col-span-1) */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            
            {/* Classification decision panel */}
            {!submitted ? (
              <div className="space-y-6">
                <div className="border-b border-hairline pb-4 mb-4">
                  <h3 className="font-display text-lg uppercase tracking-wider text-ink mb-1">
                    Classification
                  </h3>
                  <p className="text-xs text-body font-sans leading-relaxed">
                    Evaluate this scenario. Is this communication a phishing attempt?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserClassification(true)}
                    className={`py-4 border text-xs font-bold uppercase tracking-wider font-sans rounded-none transition-colors duration-200 cursor-pointer ${
                      userClassification === true
                        ? 'bg-red-600 text-canvas border-red-600'
                        : 'border-hairline text-ink hover:border-red-600'
                    }`}
                  >
                    ⚠️ Phishing
                  </button>

                  <button
                    onClick={() => setUserClassification(false)}
                    className={`py-4 border text-xs font-bold uppercase tracking-wider font-sans rounded-none transition-colors duration-200 cursor-pointer ${
                      userClassification === false
                        ? 'bg-green-600 text-canvas border-green-600'
                        : 'border-hairline text-ink hover:border-green-600'
                    }`}
                  >
                    🛡️ Legitimate
                  </button>
                </div>

                <div className="bg-canvas-soft p-4 border border-hairline">
                  <span className="text-[10px] font-bold uppercase text-body block mb-1">Anomalies Flagged</span>
                  <div className="flex flex-wrap gap-1.5">
                    {flaggedElements.length === 0 ? (
                      <span className="text-xs text-body italic font-sans">No elements flagged. Click inside the content window to flag anomalies.</span>
                    ) : (
                      flaggedElements.map(elId => {
                        const match = scenario.suspiciousElements.find(el => el.id === elId);
                        return (
                          <span key={elId} className="text-[9px] bg-red-100 text-red-700 font-mono px-2 py-0.5 border border-red-200 uppercase">
                            {match ? match.label : 'Anomaly'}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                <button
                  onClick={() => userClassification !== null && setSubmitted(true)}
                  disabled={userClassification === null}
                  className="w-full bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink py-4 text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Submit Check
                </button>
              </div>
            ) : (
              /* Submission feedback panel */
              <div className="space-y-6">
                
                {/* Accuracy Status Box */}
                <div className={`p-4 border rounded-none flex items-start gap-3 ${
                  isCorrectClassification
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : 'border-red-300 bg-red-50 text-red-800'
                }`}>
                  {isCorrectClassification ? (
                    <ShieldCheck className="w-8 h-8 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wide">
                      {isCorrectClassification ? 'Correct Classification' : 'Incorrect Classification'}
                    </h4>
                    <p className="text-xs mt-1">
                      {scenario.isPhishing
                        ? 'This is indeed a Phishing attempt.'
                        : 'This is a Legitimate communication.'}
                    </p>
                  </div>
                </div>

                {/* Checklist of Anomalies */}
                {scenario.isPhishing && (
                  <div className="border border-hairline p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-body block mb-3 border-b border-hairline pb-1">
                      Phishing Anomaly Checklist
                    </span>
                    <div className="space-y-3 font-sans text-xs">
                      {scenario.suspiciousElements.map((el) => {
                        const wasFound = flaggedElements.includes(el.id);
                        return (
                          <div key={el.id} className="flex gap-2">
                            <div className="mt-0.5">
                              {wasFound ? (
                                <span className="text-green-600 font-bold bg-green-100 px-1 py-0.2 font-mono text-[9px] border border-green-300">FOUND</span>
                              ) : (
                                <span className="text-orange-600 font-bold bg-orange-100 px-1 py-0.2 font-mono text-[9px] border border-orange-300">MISSED</span>
                              )}
                            </div>
                            <div>
                              <strong className="text-ink">{el.label}</strong>
                              <p className="text-[11px] text-body mt-0.5 leading-relaxed">{el.explanation}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation text */}
                <div className="border-t border-hairline pt-4 font-serif text-sm text-ink-soft leading-relaxed">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-body font-sans block mb-2">
                    Learning Review & Briefing
                  </span>
                  {scenario.explanation}
                </div>

              </div>
            )}

          </div>

          {/* Action button to continue */}
          {submitted && (
            <button
              onClick={handleNext}
              disabled={submittingSession}
              className="w-full bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink py-4 text-xs font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {submittingSession ? (
                'Analyzing Results...'
              ) : currentIndex + 1 < scenarios.length ? (
                <>
                  Continue Scenario <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Complete Session & Generate Cert <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
