import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Award, Shield, ArrowLeft, CheckCircle2, ShieldCheck, Lock, Fingerprint } from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import CertificateAnimations from '@/components/CertificateAnimations';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { certificateCode: code },
    include: {
      user: {
        select: { name: true, email: true },
      },
      session: {
        include: {
          feedback: {
            include: {
              scenario: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const { user, session } = certificate;

  // Personalized Suggestions compilation based on mistakes
  const suggestions: { title: string; desc: string }[] = [];
  const incorrectFeedbacks = session.feedback.filter((f) => !f.isCorrect);

  if (incorrectFeedbacks.length === 0) {
    suggestions.push({
      title: 'Maintain Security Vigilance',
      desc: 'Congratulations on a perfect evaluation score! Continue to practice active caution by verifying email headers, checking SSL address locks, and checking for typo-squatted URLs before typing passwords.',
    });
  } else {
    // Audit what they got wrong
    let missedDomains = false;
    let missedGreetings = false;
    let missedLinks = false;
    let missedAttachments = false;
    let missedWebpages = false;

    incorrectFeedbacks.forEach((f) => {
      if (f.scenario.type === 'EMAIL') {
        const elements = f.scenario.suspiciousElements as any[];
        const userFlagged = f.flaggedElements as string[];
        
        elements.forEach((el) => {
          if (!userFlagged.includes(el.id)) {
            if (el.id === 'sender_domain') missedDomains = true;
            if (el.id === 'generic_greeting' || el.id === 'urgency_threat' || el.id === 'urgency') missedGreetings = true;
            if (el.id === 'link_destination') missedLinks = true;
            if (el.id === 'attachment_type') missedAttachments = true;
          }
        });
        
        // Also if they classified a phishing email as legitimate
        if (f.scenario.isPhishing && !f.userClassification) {
          missedDomains = true;
        }
      } else if (f.scenario.type === 'WEBPAGE') {
        missedWebpages = true;
      }
    });

    if (missedDomains) {
      suggestions.push({
        title: 'Verify Sender Domains Closely',
        desc: 'Review email addresses letter-by-letter. Attackers register domains with visual substitutes (e.g. "paypa1-security.com" with a number "1" instead of "l") to trick the eye.',
      });
    }

    if (missedGreetings) {
      suggestions.push({
        title: 'Identify Urgency & Salutation Patterns',
        desc: 'Be skeptical of salutations like "Dear Colleague" or "Dear Customer" instead of your full name. Also avoid reacting under high pressure (deadlines like "end of today" or "24 hours").',
      });
    }

    if (missedLinks) {
      suggestions.push({
        title: 'Inspect Hyperlink Destinations',
        desc: 'Never click on an anchor text blindly. Hover over links to reveal their actual routing URL. If the tooltip domain does not match the official landing page, do not proceed.',
      });
    }

    if (missedAttachments) {
      suggestions.push({
        title: 'Audit Attachment Extensions',
        desc: 'Avoid downloading or extracting ZIP containers or double-extension documents (.docx.exe, .zip) from external sources. These are prime mechanisms for ransomware delivery.',
      });
    }

    if (missedWebpages) {
      suggestions.push({
        title: 'Check SSL Sockets & Hostnames',
        desc: 'Confirm the address bar contains "https://" and matches the exact corporate domain (e.g. microsoft.com, not verify-azure-portal.com). Microsoft and PayPal never host login screens on third-party domains.',
      });
    }
  }

  return (
    <div className="flex-1 bg-canvas-soft py-12 px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, #suggestions-panel, #navigation-back, #certificate-stickers {
            display: none !important;
          }
          #certificate-print-card {
            border: 4px double #000000 !important;
            padding: 40px !important;
            margin: 0 !important;
            width: 100% !important;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.05);
            box-shadow: none !important;
          }
        }
      `}} />

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation Bar */}
        <div id="navigation-back" className="flex items-center justify-between border-b border-hairline pb-4 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink hover:text-link transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-mono text-body">Verified Code: {code}</span>
        </div>

        {/* Security Stickers Row */}
        <div id="certificate-stickers" className="flex justify-center gap-6">
          {[
            { icon: ShieldCheck, label: 'VERIFIED' },
            { icon: Lock, label: 'SECURED' },
            { icon: Fingerprint, label: 'AUTHENTIC' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 border border-hairline bg-canvas px-3 py-1.5 animate-cyber-float"
              style={{ animationDelay: `${['VERIFIED', 'SECURED', 'AUTHENTIC'].indexOf(label) * 200}ms` }}
            >
              <Icon size={12} className="text-link" strokeWidth={1.5} />
              <span className="text-[9px] font-sans font-bold tracking-widest text-body uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Certificate Card Container */}
        <div
          id="certificate-print-card"
          className="bg-canvas border-8 border-double border-ink p-8 md:p-16 flex flex-col justify-between items-center text-center shadow-none relative"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-ink"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-ink"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-ink"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-ink"></div>

          {/* Certificate Logo */}
          <div className="mb-6 flex flex-col items-center">
            <span className="font-display text-2xl font-extrabold tracking-tighter uppercase text-ink mb-1 select-none">
              CYBER·SECURE
            </span>
            <div className="text-[9px] uppercase font-mono tracking-widest text-body">
              Verification Authority // Established 2026
            </div>
          </div>

          {/* Animated Award Icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 border-2 border-link/20 rounded-full animate-ping"></div>
            <Award className="w-16 h-16 text-ink relative z-10" />
          </div>

          {/* Certificate Main Text */}
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-body font-sans block">
              Certificate of Achievement
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-light tracking-tight text-ink uppercase">
              Phishing Awareness & Defense
            </h2>
            <p className="text-xs font-mono text-body uppercase tracking-wider">
              This document officially certifies that
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-ink border-b border-ink pb-2 max-w-md mx-auto">
              {user.name}
            </h3>
            <p className="font-serif text-base text-ink-soft leading-relaxed max-w-xl mx-auto py-2">
              has completed the rigorous phishing simulation course, demonstrating a <strong className="font-sans font-bold">{certificate.level}</strong> level classification score of <strong className="font-sans font-bold">{session.score} of {session.totalScenarios}</strong> points.
            </p>
          </div>

          {/* Signature and Seal Blocks */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-hairline pt-8 mt-12">
            {/* Animated Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-2 border-ink flex items-center justify-center font-display text-xs font-extrabold uppercase p-1 relative">
                <div className="absolute inset-0 border border-dashed border-link/30 animate-spin-slow"></div>
                <div className="border border-ink border-dashed w-full h-full flex flex-col items-center justify-center p-0.5 relative z-10 bg-canvas">
                  <span className="text-[8px] tracking-tighter">SECURED</span>
                  <span className="text-[9px] font-bold">PORTAL</span>
                  <span className="text-[7px]">VERIFIED</span>
                </div>
              </div>
              <span className="text-[9px] uppercase font-mono text-body tracking-wider mt-2">Certified System Seal</span>
            </div>

            {/* Signature Block */}
            <div className="flex flex-col items-center">
              <span className="font-serif italic text-lg text-ink font-light select-none pb-1">
                SecOps Automated Agent
              </span>
              <div className="border-t border-ink w-44 pt-1">
                <span className="text-[9px] uppercase font-mono text-body tracking-wider">
                  Certification Authority
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel for suggestions */}
        <div id="suggestions-panel" className="bg-canvas border border-ink p-8 space-y-6">
          <div className="border-b border-hairline pb-4 flex items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-link font-sans block mb-1">
                Diagnostic Analysis
              </span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-ink">
                Personalized Threat Suggestions
              </h3>
            </div>
            
            <PrintButton />
          </div>

          {incorrectFeedbacks.length > 0 ? (
            <p className="text-xs text-body font-sans leading-relaxed">
              Based on the communication elements you missed during your simulation, our threat specialists recommend incorporating the following rules into your day-to-day operations:
            </p>
          ) : (
            <div className="flex items-start gap-2 text-green-700 bg-green-50 p-4 border border-green-200">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-sans leading-relaxed">
                <strong>Flawless session!</strong> You correctly diagnosed all communication targets and completed your evaluation without errors.
              </p>
            </div>
          )}

          <div className="space-y-6 font-sans">
            {suggestions.map((s, idx) => (
              <div key={idx} className="border border-hairline p-4 bg-canvas-soft cyber-sticker-hover">
                <h4 className="font-bold text-xs uppercase tracking-wider text-ink mb-1.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-link" /> {s.title}
                </h4>
                <p className="text-xs text-body leading-relaxed pl-6">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
