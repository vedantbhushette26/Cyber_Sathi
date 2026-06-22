import { PrismaClient, Role, Difficulty, ScenarioType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.certificate.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.scenario.deleteMany({});
  await prisma.user.deleteMany({});

  // Create default users
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cybertraining.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@cybertraining.com',
      name: 'John Doe',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  console.log(`Created admin: ${admin.email}`);
  console.log(`Created user: ${user.email}`);

  // ========== EMAIL SCENARIOS (3) ==========

  // 1. Phishing Email: PayPal Typo Squatting
  await prisma.scenario.create({
    data: {
      title: 'Suspicious PayPal Security Alert',
      type: ScenarioType.EMAIL,
      difficulty: Difficulty.EASY,
      isPhishing: true,
      explanation: 'This email is a classic phishing attempt. The sender domain uses typo-squatting ("paypa1-security.com" with a number "1" instead of the letter "l"). It also uses a generic greeting and sets an artificial deadline of 24 hours with the threat of account deactivation to pressure you into clicking a link that redirects to a malicious URL.',
      content: {
        sender: 'support@paypa1-security.com',
        senderName: 'PayPal Support Team',
        recipient: 'john.doe@corporate.com',
        subject: 'ACTION REQUIRED: Unusual Sign-in Attempt Blocked',
        date: 'June 21, 2026 10:14 AM',
        body: 'Dear PayPal Member,\n\nWe detected a login attempt from a new location (IP: 198.51.100.42, Moscow, RU). To ensure your account security, we have temporarily restricted access to your funds.\n\nPlease verify your identity immediately by clicking the secure link below:\n\nhttps://paypal.com/security/login\n\nIf you do not verify your identity within 24 hours, your account will be permanently deactivated.\n\nThank you,\nPayPal Security Division'
      },
      suspiciousElements: [
        {
          id: 'sender_domain',
          target: 'support@paypa1-security.com',
          label: 'Spoofed Sender Domain',
          explanation: 'The domain is "paypa1-security.com" with a number "1" instead of "l". Attackers register similar-looking domains to bypass visual checks.'
        },
        {
          id: 'generic_greeting',
          target: 'Dear PayPal Member',
          label: 'Generic Greeting',
          explanation: 'Legitimate services like PayPal address you by your account name, not a generic catch-all greeting.'
        },
        {
          id: 'link_destination',
          target: 'https://paypal.com/security/login',
          label: 'Deceptive Hyperlink',
          explanation: 'While the text says "paypal.com/security/login", the actual link resolves to a fraudulent server "https://paypal-secure-portal.com/login".'
        },
        {
          id: 'urgency_threat',
          target: 'permanently deactivated',
          label: 'Artificial Urgency & Threat',
          explanation: 'Phishers use strict deadlines (e.g. 24 hours) to force users to act out of fear rather than thinking logically.'
        }
      ]
    }
  });

  // 2. Legitimate Email: GitHub Security Alert
  await prisma.scenario.create({
    data: {
      title: 'GitHub API Key Expiration Alert',
      type: ScenarioType.EMAIL,
      difficulty: Difficulty.EASY,
      isPhishing: false,
      explanation: 'This is a legitimate security alert from GitHub. The sender address matches the official "support@github.com" domain. It addresses the user by their actual username and provides a link directly leading to settings inside the github.com domain, without any high-stress threats or artificial deadlines.',
      content: {
        sender: 'support@github.com',
        senderName: 'GitHub Support',
        recipient: 'john.doe@corporate.com',
        subject: '[GitHub] Security Alert: Personal Access Token Expiring',
        date: 'June 20, 2026 04:30 PM',
        body: 'Hi john-doe-dev,\n\nWe are writing to let you know that your personal access token (dev-api-key-v1) is expiring in 7 days.\n\nYou can review your tokens or generate new ones in your GitHub developer settings:\n\nhttps://github.com/settings/tokens\n\nThanks,\nThe GitHub Team'
      },
      suspiciousElements: []
    }
  });

  // 3. Phishing Email: Corporate HR Annual Bonus Form
  await prisma.scenario.create({
    data: {
      title: 'Corporate HR Bonus Compensation Review',
      type: ScenarioType.EMAIL,
      difficulty: Difficulty.HARD,
      isPhishing: true,
      explanation: 'This is a targeted phishing email (spear phishing). It pretends to be from HR but is sent from a lookalike external domain ("corporate-reward-portal.net"). It leverages a zip attachment containing a potentially malicious script and uses urgent language to bypass security checks.',
      content: {
        sender: 'hr-department@corporate-reward-portal.net',
        senderName: 'Corporate HR Department',
        recipient: 'john.doe@corporate.com',
        subject: 'IMPORTANT: Employee Annual Bonus Review & Form',
        date: 'June 19, 2026 09:00 AM',
        body: 'Dear Colleague,\n\nAs part of our annual compensation adjustments, the board has approved a mid-year bonus pool. All employees must review the performance spreadsheet and complete the bonus request form to claim their payout.\n\nPlease open the attached file immediately to review your bonus amount: \n\nAttachment: Annual_Bonus_2026_Excel.zip (2.4 MB)\n\nNote: Requests must be submitted by the end of today to be included in this pay cycle.\n\nBest regards,\nHR Administration'
      },
      suspiciousElements: [
        {
          id: 'sender_domain',
          target: 'hr-department@corporate-reward-portal.net',
          label: 'External Domain for Internal Communications',
          explanation: 'Internal HR communication should originate from your official corporate domain (e.g. corporate.com), not an external domain "corporate-reward-portal.net".'
        },
        {
          id: 'generic_greeting',
          target: 'Dear Colleague',
          label: 'Generic Colleague Greeting',
          explanation: 'HR databases store employee names. A generic greeting suggests a mass campaign target.'
        },
        {
          id: 'attachment_type',
          target: 'Annual_Bonus_2026_Excel.zip',
          label: 'Dangerous ZIP Archive Attachment',
          explanation: 'ZIP attachments are commonly used to hide malware scripts, executables, or macros that install trojans when opened.'
        },
        {
          id: 'urgency',
          target: 'end of today',
          label: 'Immediate Deadline Pressure',
          explanation: 'By imposing a deadline (end of today), attackers hope you will open the file quickly to avoid losing money before checking its validity.'
        }
      ]
    }
  });

  // ========== SMS SCENARIOS (2) ==========

  // 4. Phishing SMS: Bank OTP Verification Scam
  await prisma.scenario.create({
    data: {
      title: 'Bank of America OTP Verification SMS',
      type: ScenarioType.SMS,
      difficulty: Difficulty.EASY,
      isPhishing: true,
      explanation: 'This SMS pretends to be from Bank of America, claiming your account is locked and requiring immediate verification via a suspicious link. Legitimate banks never send verification links via SMS. The domain "boa-security-verify.com" is not the official Bank of America domain (bankofamerica.com). Always access your bank through the official app or by typing the URL directly.',
      content: {
        senderPhone: '+1-800-555-0199',
        recipientPhone: '+1-555-123-4567',
        message: 'BOA Alert: Your account has been locked due to suspicious activity on your card ending in 4523. To restore access and protect your funds, verify your identity immediately:\n\nhttps://boa-security-verify.com/otp\n\nIf you do not verify within 24 hours, your account will be suspended.\n\nReply STOP to unsubscribe',
        date: 'June 21, 2026 10:14 AM'
      },
      suspiciousElements: [
        {
          id: 'sms_link',
          target: 'https://boa-security-verify.com/otp',
          label: 'Suspicious URL in SMS',
          explanation: 'Legitimate banks never send verification links via SMS. The domain "boa-security-verify.com" is not the official Bank of America domain (bankofamerica.com).'
        },
        {
          id: 'urgency_language',
          target: 'has been locked',
          label: 'Fear-inducing Urgency',
          explanation: 'Scammers use alarmist language like "account locked" to make you act without thinking. Real security alerts typically direct you to the official app or website.'
        },
        {
          id: 'suspicious_domain',
          target: 'boa-security-verify.com',
          label: 'Impersonated Domain',
          explanation: 'The domain tries to look official by using "boa" (abbreviation for Bank of America) but is hosted on a fraudulent server.'
        }
      ]
    }
  });

  // 5. Legitimate SMS: Amazon Shipping Notification
  await prisma.scenario.create({
    data: {
      title: 'Amazon Package Shipping Notification',
      type: ScenarioType.SMS,
      difficulty: Difficulty.EASY,
      isPhishing: false,
      explanation: 'This is a legitimate shipping notification from Amazon. The sender number matches Amazon\'s official short code, the message contains a real tracking number format (TBA prefix), and the link directs to the official amazon.com domain. No urgency or threat language is used.',
      content: {
        senderPhone: '+1-800-280-4496',
        recipientPhone: '+1-555-123-4567',
        message: 'Your Amazon package (TBA123456789012) is out for delivery and will arrive by 8 PM today. Track your package: amazon.com/track',
        date: 'June 21, 2026 2:30 PM'
      },
      suspiciousElements: []
    }
  });

  // ========== FAKE AD SCENARIOS (3) ==========

  // 6. Phishing Fake Ad: Too-Good-To-Be-True iPhone Deal
  await prisma.scenario.create({
    data: {
      title: 'Too-Good-To-Be-True iPhone Flash Sale Ad',
      type: ScenarioType.FAKE_AD,
      difficulty: Difficulty.MEDIUM,
      isPhishing: true,
      explanation: 'This fake advertisement impersonates the Apple brand with an unrealistically high discount (75% off on a brand new iPhone). Apple does not run such extreme sales on new products. The ad uses artificial scarcity ("Only 3 units left") to pressure quick action. Fake ads often lead to phishing sites, malware downloads, or payment fraud.',
      content: {
        adSource: 'Apple Official Store',
        adHeadline: 'FLASH SALE: iPhone 16 Pro Max 256GB - 75% OFF!',
        adBody: 'Limited time offer! Get the latest iPhone at an unbelievable price. Only 3 units left at this price. Order now before it\'s gone!',
        adPrice: '$299.99',
        adCTA: 'Buy Now - Limited Stock',
      },
      suspiciousElements: [
        {
          id: 'fake_source',
          target: 'Apple Official Store',
          label: 'Impersonated Brand',
          explanation: 'This ad claims to be from "Apple Official Store" but is not a verified advertiser. Apple does not run 75% off sales on new iPhones through third-party ad platforms.'
        },
        {
          id: 'too_good_deal',
          target: '75% OFF',
          label: 'Unrealistic Discount',
          explanation: 'A 75% discount on a brand new iPhone is unrealistic. Apple products rarely go on sale, and certainly not at such extreme discounts. This is a classic bait tactic.'
        },
        {
          id: 'artificial_scarcity',
          target: 'Only 3 units left',
          label: 'Artificial Scarcity Pressure',
          explanation: 'Creating false urgency with "limited stock" claims pressures users to act quickly without verifying the legitimacy of the offer.'
        },
        {
          id: 'too_low_price',
          target: '$299.99',
          label: 'Suspiciously Low Price',
          explanation: 'An iPhone 16 Pro Max retailing for $299.99 (normally $1,199+) is a clear sign of a scam. If the deal seems too good to be true, it probably is.'
        }
      ]
    }
  });

  // 7. Legitimate Fake Ad: Nike Running Shoes Promotion
  await prisma.scenario.create({
    data: {
      title: 'Nike Running Shoes Official Promotion',
      type: ScenarioType.FAKE_AD,
      difficulty: Difficulty.MEDIUM,
      isPhishing: false,
      explanation: 'This is a legitimate advertisement from Nike. The discount is reasonable (no extreme markdowns), the brand name matches the official company, the pricing is within normal range for running shoes, and the CTA button uses standard marketing language without pressure tactics.',
      content: {
        adSource: 'Nike',
        adHeadline: 'New Air Zoom Pegasus 42 - Now Available',
        adBody: 'Experience responsive cushioning with the latest Pegasus. Available in 12 colors. Free shipping on orders over $50.',
        adPrice: '$129.99',
        adCTA: 'Shop Now',
      },
      suspiciousElements: []
    }
  });

  // 8. Phishing Fake Ad: Fake Netflix Subscription Renewal
  await prisma.scenario.create({
    data: {
      title: 'Netflix Subscription Expired - Renewal Scam',
      type: ScenarioType.FAKE_AD,
      difficulty: Difficulty.EASY,
      isPhishing: true,
      explanation: 'This fake ad impersonates Netflix with a threatening message about account expiration. Netflix does not use third-party ads to collect payment renewals. The ad creates urgency with "Your account will be deleted" and offers an unrealistically low renewal price to lure victims into entering payment details on a fraudulent site.',
      content: {
        adSource: 'Netflix',
        adHeadline: 'Your Netflix Subscription Has Expired!',
        adBody: 'Your account will be permanently deleted in 24 hours. Renew now at our special returning customer rate. All your watch history and favorites will be lost if you don\'t act now.',
        adPrice: '$4.99/month',
        adCTA: 'Renew Now - Save Your Account',
      },
      suspiciousElements: [
        {
          id: 'threat_language',
          target: 'permanently deleted',
          label: 'Threatening Language',
          explanation: 'Netflix does not threaten to permanently delete accounts. They send multiple reminder emails before any account changes. Threats are a phishing tactic.'
        },
        {
          id: 'fake_renewal',
          target: 'Renew Now',
          label: 'Fake Renewal CTA',
          explanation: 'Legitimate subscription renewals happen through the official website or app, not through third-party advertisements. Netflix never asks for renewal via ads.'
        },
        {
          id: 'suspicious_price',
          target: '$4.99/month',
          label: 'Unrealistically Low Price',
          explanation: 'Netflix basic plans start at $6.99/month. A $4.99 rate is suspiciously low and designed to seem like a "special deal" to entice victims.'
        }
      ]
    }
  });

  // ========== CYBER INCIDENTS ==========

  await prisma.cyberIncident.create({
    data: {
      title: '2016 Netflix Phishing Campaign',
      category: 'Phishing Email',
      year: 2016,
      description: 'A massive phishing campaign targeted Netflix users with fake "subscription expired" emails. The emails contained links to a cloned Netflix login page that harvested credentials. Over 100,000 accounts were compromised in the first week.',
      impact: 'Over 100,000 accounts compromised. Victims reported unauthorized charges and account takeovers. Many users had their payment information stolen.',
      prevention: 'Always verify the sender email address. Netflix emails come from @netflix.com. Never click links in suspicious emails — instead, open your browser and navigate to netflix.com directly. Enable two-factor authentication on your account.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Google Docs Phishing Attack 2017',
      category: 'Phishing Email',
      year: 2017,
      description: 'A sophisticated phishing attack spread through Google Docs. Users received an invitation to share a Google Doc from a known contact. Clicking the link authorized a malicious third-party app that gained access to the user\'s email and contacts, then spread the phishing further.',
      impact: 'Millions of users were targeted. The attack spread rapidly through contact lists, making it appear trustworthy because it came from known contacts.',
      prevention: 'Be cautious when granting permissions to third-party apps. Check what permissions an app is requesting before clicking "Allow". Review and revoke unnecessary app permissions in your Google account settings regularly.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Twitter CEO Jack Dorsey SIM Swap 2019',
      category: 'OTP Scam',
      year: 2019,
      description: 'Attackers performed a SIM swap attack on Twitter CEO Jack Dorsey, gaining access to his phone number. They then used SMS-based commands to post tweets from his account. SIM swapping involves tricking a mobile carrier into transferring a victim\'s phone number to a new SIM card.',
      impact: 'The attacker posted offensive tweets from @jack\'s account, reaching millions of followers. This demonstrated that even high-profile tech leaders are vulnerable to SIM swap attacks.',
      prevention: 'Set up a PIN or password with your mobile carrier to prevent unauthorized SIM changes. Use app-based two-factor authentication instead of SMS-based OTP whenever possible. Contact your carrier if you suddenly lose phone signal.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Facebook Data Breach 2021',
      category: 'Data Breach',
      year: 2021,
      description: 'Personal data of over 533 million Facebook users from 106 countries was leaked in a data breach. The leaked data included phone numbers, full names, locations, email addresses, and other biographical information. The data was originally scraped through a vulnerability in Facebook\'s contact importer feature.',
      impact: '533 million users affected. The leaked data was freely available online, enabling targeted phishing attacks, identity theft, and social engineering crimes.',
      prevention: 'Use strong, unique passwords for each account. Enable two-factor authentication. Be cautious of unsolicited messages even from known contacts. Regularly check if your data has been compromised using services like "Have I Been Pwned".'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Twitter Bitcoin Scam 2020',
      category: 'Domain Spoofing',
      year: 2020,
      description: 'Attackers compromised several high-profile Twitter accounts including Barack Obama, Elon Musk, Bill Gates, and Apple. They posted tweets asking followers to send Bitcoin to a specific wallet address, promising to double the amount sent. The scam used social engineering rather than technical exploits.',
      impact: 'Over $120,000 in Bitcoin was stolen. The attack compromised 130 accounts including world leaders and major corporations. Twitter\'s stock price dropped 4% following the breach.',
      prevention: 'Be skeptical of any "get rich quick" schemes, even from verified accounts. Legitimate organizations never ask for cryptocurrency transfers via social media. Verify extraordinary claims through official news sources before taking action.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Google Play Store Malicious Apps 2022',
      category: 'Fake Ads',
      year: 2022,
      description: 'Over 200 malicious apps were discovered on the Google Play Store, disguised as legitimate VPN, fitness, and photo editing apps. These apps contained adware and spyware that collected user data, displayed intrusive ads, and subscribed users to premium SMS services without consent.',
      impact: 'Over 100 million downloads combined. Victims experienced battery drain, data overcharges, and privacy violations. Many users unknowingly signed up for premium subscriptions.',
      prevention: 'Only install apps from well-known developers with high ratings and many reviews. Check app permissions before installing — be wary of apps requesting unnecessary access. Read user reviews for complaints about suspicious behavior. Use Google Play Protect to scan installed apps.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Amazon Prime Phishing SMS 2023',
      category: 'OTP Scam',
      year: 2023,
      description: 'A widespread SMS phishing campaign targeted Amazon Prime members with fake "account suspended" messages. The texts contained links to a fraudulent website that mimicked Amazon\'s login page. After entering credentials, users were asked to provide credit card details to "verify" their account.',
      impact: 'Thousands of users reported receiving the messages. Many fell victim, with some losing hundreds of dollars in unauthorized charges. The campaign targeted users across multiple countries.',
      prevention: 'Amazon will never ask for personal information via SMS. Always navigate to Amazon directly through the app or browser. Check the URL carefully — fraudulent sites often use slight variations of the real domain. Report suspicious SMS messages to your carrier.'
    }
  });

  await prisma.cyberIncident.create({
    data: {
      title: 'Google OAuth Phishing Campaign 2024',
      category: 'Domain Spoofing',
      year: 2024,
      description: 'A sophisticated phishing campaign used fake Google OAuth consent screens to steal credentials. Attackers sent emails with "View Document" links that redirected through a legitimate-looking Google OAuth page. Users who clicked "Allow" unknowingly granted attackers access to their Google accounts.',
      impact: 'Over 50,000 accounts compromised. Attackers gained access to emails, contacts, and cloud storage. Many victims had their identities stolen through the accessed personal documents.',
      prevention: 'Always check the URL before entering credentials or granting permissions. Be cautious of unexpected document sharing notifications. Review third-party app access in your Google account settings regularly. Revoke access for apps you no longer use.'
    }
  });

  console.log('Successfully seeded database! 3 Email, 2 SMS, 3 Fake Ad scenarios + 8 Cyber Incidents created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
