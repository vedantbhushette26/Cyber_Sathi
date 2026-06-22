'use client';

import { useState, useEffect } from 'react';

interface SuspiciousElement {
  id: string;
  target: string;
  label: string;
  explanation: string;
}

interface Scenario {
  id: string;
  title: string;
  type: 'EMAIL' | 'WEBPAGE' | 'SMS' | 'FAKE_AD';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isPhishing: boolean;
  explanation: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'EMAIL' | 'WEBPAGE' | 'SMS' | 'FAKE_AD'>('EMAIL');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [isPhishing, setIsPhishing] = useState(true);
  const [explanation, setExplanation] = useState('');

  // Email content state
  const [emailSender, setEmailSender] = useState('');
  const [emailSenderName, setEmailSenderName] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Webpage content state
  const [webUrl, setWebUrl] = useState('');
  const [webTitle, setWebTitle] = useState('');
  const [webCompany, setWebCompany] = useState('');
  const [webBodyHtml, setWebBodyHtml] = useState('');

  // SMS content state
  const [smsSenderPhone, setSmsSenderPhone] = useState('');
  const [smsRecipientPhone, setSmsRecipientPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Fake Ad content state
  const [adHeadline, setAdHeadline] = useState('');
  const [adBody, setAdBody] = useState('');
  const [adCTA, setAdCTA] = useState('');
  const [adSource, setAdSource] = useState('');
  const [adPrice, setAdPrice] = useState('');

  // Suspicious Elements
  const [elements, setElements] = useState<SuspiciousElement[]>([]);
  const [elTarget, setElTarget] = useState('');
  const [elLabel, setElLabel] = useState('');
  const [elExplanation, setElExplanation] = useState('');

  const fetchScenarios = async () => {
    try {
      const res = await fetch('/api/scenarios');
      const data = await res.json();
      if (res.ok) {
        setScenarios(data);
      } else {
        setError(data.error || 'Failed to fetch scenarios');
      }
    } catch (err) {
      setError('An error occurred while loading scenarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const addElement = () => {
    if (!elTarget || !elLabel || !elExplanation) return;
    const newElement: SuspiciousElement = {
      id: `el_${Date.now()}`,
      target: elTarget,
      label: elLabel,
      explanation: elExplanation,
    };
    setElements([...elements, newElement]);
    setElTarget('');
    setElLabel('');
    setElExplanation('');
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setScenarios(scenarios.filter((s) => s.id !== id));
        setSuccess('Scenario deleted successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete scenario');
      }
    } catch (err) {
      setError('Failed to delete scenario');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let content: Record<string, unknown> = {};

    if (type === 'EMAIL') {
      content = {
        sender: emailSender,
        senderName: emailSenderName,
        recipient: emailRecipient,
        subject: emailSubject,
        body: emailBody,
        date: new Date().toLocaleString(),
      };
    } else if (type === 'WEBPAGE') {
      content = {
        url: webUrl,
        pageTitle: webTitle,
        company: webCompany,
        bodyHtml: webBodyHtml || `<div class="login-box p-6 bg-white border border-zinc-200 w-80"><h3>Sign In to ${webCompany}</h3><input type="password" placeholder="Password" class="p-2 border my-2 w-full"><button class="bg-blue-600 text-white w-full p-2">Submit</button></div>`,
      };
    } else if (type === 'SMS') {
      content = {
        senderPhone: smsSenderPhone,
        recipientPhone: smsRecipientPhone,
        message: smsMessage,
        date: new Date().toLocaleString(),
      };
    } else if (type === 'FAKE_AD') {
      content = {
        adSource: adSource,
        adHeadline: adHeadline,
        adBody: adBody,
        adCTA: adCTA || 'Learn More',
        adPrice: adPrice || '',
      };
    }

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          difficulty,
          isPhishing,
          content,
          explanation,
          suspiciousElements: elements,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Scenario uploaded successfully!');
        setScenarios([data, ...scenarios]);
        // Reset form
        setTitle('');
        setExplanation('');
        setEmailSender('');
        setEmailSenderName('');
        setEmailRecipient('');
        setEmailSubject('');
        setEmailBody('');
        setWebUrl('');
        setWebTitle('');
        setWebCompany('');
        setWebBodyHtml('');
        setSmsSenderPhone('');
        setSmsRecipientPhone('');
        setSmsMessage('');
        setAdHeadline('');
        setAdBody('');
        setAdCTA('');
        setAdSource('');
        setAdPrice('');
        setElements([]);
      } else {
        setError(data.error || 'Failed to upload scenario');
      }
    } catch (err) {
      setError('An error occurred during submission');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 font-sans">
      
      {/* Scenario List (Left, col-span-1) */}
      <div className="lg:col-span-1 border-r border-hairline pr-0 lg:pr-6">
        <h3 className="font-display text-xl uppercase tracking-wider text-ink border-b border-hairline pb-3 mb-6">
          Existing Scenarios ({scenarios.length})
        </h3>

        {loading ? (
          <p className="text-sm text-body">Loading scenarios...</p>
        ) : scenarios.length === 0 ? (
          <p className="text-sm text-body">No scenarios in databank.</p>
        ) : (
          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border border-hairline p-4 flex flex-col justify-between hover:bg-canvas-soft transition-colors duration-150 bg-canvas"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-wider bg-canvas-soft text-body font-mono px-2 py-0.5 border border-hairline">
                      {scenario.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                        scenario.isPhishing
                          ? 'border-red-200 text-red-700 bg-red-50'
                          : 'border-green-200 text-green-700 bg-green-50'
                      }`}
                    >
                      {scenario.isPhishing ? 'Phishing' : 'Legit'}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-ink mb-1">
                    {scenario.title}
                  </h4>
                  <p className="text-[11px] text-body mb-3">
                    Difficulty: <span className="font-bold">{scenario.difficulty}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(scenario.id)}
                  className="text-xs uppercase font-bold text-red-600 hover:text-red-800 transition-colors text-left self-start cursor-pointer mt-2"
                >
                  Delete Scenario
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form (Right, col-span-2) */}
      <div className="lg:col-span-2">
        <h3 className="font-display text-xl uppercase tracking-wider text-ink border-b border-hairline pb-3 mb-6">
          Upload New Scenario
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 text-xs mb-6">
            <strong>ERROR:</strong> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 border border-green-200 p-4 text-xs mb-6">
            <strong>SUCCESS:</strong> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          
          {/* General Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                Scenario Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unusual Paypal Sign-in Attempt"
                className="w-full bg-canvas text-ink border border-hairline hover:border-ink focus:border-ink outline-none px-4 py-2 rounded-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'EMAIL' | 'WEBPAGE' | 'SMS' | 'FAKE_AD')}
                  className="w-full bg-canvas text-ink border border-hairline px-2 py-2 rounded-none outline-none focus:border-ink"
                >
                  <option value="EMAIL">Email</option>
                  <option value="WEBPAGE">Webpage</option>
                  <option value="SMS">SMS / Text Message</option>
                  <option value="FAKE_AD">Fake Advertisement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}
                  className="w-full bg-canvas text-ink border border-hairline px-2 py-2 rounded-none outline-none focus:border-ink"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Classification
                </label>
                <select
                  value={isPhishing ? 'phishing' : 'legitimate'}
                  onChange={(e) => setIsPhishing(e.target.value === 'phishing')}
                  className="w-full bg-canvas text-ink border border-hairline px-2 py-2 rounded-none outline-none focus:border-ink"
                >
                  <option value="phishing">Phishing</option>
                  <option value="legitimate">Legitimate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Content Inputs */}
          {type === 'EMAIL' && (
            <div className="border border-hairline p-6 space-y-4 bg-canvas-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-body border-b border-hairline pb-2 mb-4">
                Email Content Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSenderName}
                    onChange={(e) => setEmailSenderName(e.target.value)}
                    placeholder="e.g. PayPal Support"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    placeholder="e.g. support@paypa1-security.com"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="e.g. victim@company.com"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. URGENT: Verification Required"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Email Body Text
                </label>
                <textarea
                  required
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Dear customer, please click the link..."
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink font-serif text-sm"
                />
              </div>
            </div>
          )}

          {type === 'WEBPAGE' && (
            <div className="border border-hairline p-6 space-y-4 bg-canvas-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-body border-b border-hairline pb-2 mb-4">
                Webpage Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Target URL Address
                  </label>
                  <input
                    type="text"
                    required
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="e.g. http://microsoft-login.verify-azure-portal.com"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Company / Target Name
                  </label>
                  <input
                    type="text"
                    required
                    value={webCompany}
                    onChange={(e) => setWebCompany(e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  required
                  value={webTitle}
                  onChange={(e) => setWebTitle(e.target.value)}
                  placeholder="e.g. Sign in to your account"
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Web Login Form HTML (Optional simulated box)
                </label>
                <textarea
                  rows={4}
                  value={webBodyHtml}
                  onChange={(e) => setWebBodyHtml(e.target.value)}
                  placeholder="HTML elements showing fake sign in fields..."
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink font-mono text-xs"
                />
              </div>
            </div>
          )}

          {type === 'SMS' && (
            <div className="border border-hairline p-6 space-y-4 bg-canvas-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-body border-b border-hairline pb-2 mb-4">
                SMS / Text Message Content Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Sender Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={smsSenderPhone}
                    onChange={(e) => setSmsSenderPhone(e.target.value)}
                    placeholder="e.g. +1-800-555-0199"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Recipient Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={smsRecipientPhone}
                    onChange={(e) => setSmsRecipientPhone(e.target.value)}
                    placeholder="e.g. +1-555-123-4567"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  SMS Message Body
                </label>
                <textarea
                  required
                  rows={5}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="e.g. Your bank account has been locked. Verify now: https://..."
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink font-sans text-sm"
                />
              </div>
            </div>
          )}

          {type === 'FAKE_AD' && (
            <div className="border border-hairline p-6 space-y-4 bg-canvas-soft">
              <h4 className="font-bold text-xs uppercase tracking-wider text-body border-b border-hairline pb-2 mb-4">
                Fake Advertisement Content Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Claimed Source / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adSource}
                    onChange={(e) => setAdSource(e.target.value)}
                    placeholder="e.g. Apple Official Store"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={adPrice}
                    onChange={(e) => setAdPrice(e.target.value)}
                    placeholder="e.g. $299.99"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Ad Headline
                </label>
                <input
                  type="text"
                  required
                  value={adHeadline}
                  onChange={(e) => setAdHeadline(e.target.value)}
                  placeholder="e.g. FLASH SALE: iPhone 16 Pro Max - 75% OFF!"
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Ad Body Text
                </label>
                <textarea
                  required
                  rows={4}
                  value={adBody}
                  onChange={(e) => setAdBody(e.target.value)}
                  placeholder="e.g. Limited time offer! Get the latest iPhone at an unbelievable price..."
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink font-serif text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Call-to-Action Button Text
                </label>
                <input
                  type="text"
                  value={adCTA}
                  onChange={(e) => setAdCTA(e.target.value)}
                  placeholder="e.g. Buy Now - Limited Stock"
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                />
              </div>
            </div>
          )}

          {/* Suspicious Elements Setup */}
          {isPhishing && (
            <div className="border border-hairline p-6 space-y-4 bg-red-50/20">
              <h4 className="font-bold text-xs uppercase tracking-wider text-red-600 border-b border-red-200 pb-2 mb-4">
                Define Suspicious Elements (Phishing Targets)
              </h4>

              {/* Elements List */}
              {elements.length > 0 && (
                <div className="space-y-2 mb-4">
                  {elements.map((el) => (
                    <div key={el.id} className="bg-canvas border border-hairline p-3 flex justify-between items-start">
                      <div className="text-xs">
                        <span className="font-bold block text-ink">{el.label}</span>
                        <span className="text-[10px] text-body block font-mono">Target text: "{el.target}"</span>
                        <p className="text-[11px] text-body mt-1">{el.explanation}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeElement(el.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Anomalous Target Text (Exact substring)
                  </label>
                  <input
                    type="text"
                    value={elTarget}
                    onChange={(e) => setElTarget(e.target.value)}
                    placeholder="e.g. support@paypa1-security.com"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                    Error Category / Label
                  </label>
                  <input
                    type="text"
                    value={elLabel}
                    onChange={(e) => setElLabel(e.target.value)}
                    placeholder="e.g. Typo-squatted sender domain"
                    className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
                  Why is this element suspicious? (User explanation)
                </label>
                <textarea
                  rows={2}
                  value={elExplanation}
                  onChange={(e) => setElExplanation(e.target.value)}
                  placeholder="Explain why this exact text suggests phishing..."
                  className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink"
                />
              </div>

              <button
                type="button"
                onClick={addElement}
                className="bg-canvas border border-ink px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-ink hover:text-canvas transition-colors duration-150 cursor-pointer"
              >
                Add Suspicious Element Target
              </button>
            </div>
          )}

          {/* Post-Trial Explanation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
              General Explanation & Learning Review
            </label>
            <textarea
              required
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide a comprehensive explanation to teach the user after they complete this scenario..."
              className="w-full bg-canvas text-ink border border-hairline px-3 py-2 outline-none focus:border-ink font-serif"
            />
          </div>

          <button
            type="submit"
            className="bg-ink text-canvas hover:bg-canvas hover:text-ink border border-ink px-8 py-3 font-sans font-bold uppercase tracking-wider text-xs transition-colors duration-200 cursor-pointer"
          >
            Upload Scenario to Databank
          </button>
        </form>
      </div>

    </div>
  );
}
