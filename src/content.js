// All copy comes from "Portfolio Landing Page — Content" (Nov 8, 2026).
// Edit text here; components only render it.

export const contact = {
  email: 'mahmoudbahaa777@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mahmoud-bahaa-a38860ab',
  // WhatsApp: number in international format, digits only. The message is pre-filled for the visitor.
  whatsapp: '971529556906',
  whatsappText: "Hi Mahmoud, I found your website and I'd like to talk about growing my brand.",
  city: 'Abu Dhabi',
  // Booking calendar for every "Book a strategy call" button. Paste your public link
  // (Calendly, Cal.com or a Google Calendar appointment schedule). Empty = buttons open email.
  bookingUrl: 'https://calendly.com/mahmoudbahaa777/15min',
  // Shown in the pop-up; keep in step with the Calendly event length.
  callMinutes: 15,
  // Fallback when bookingUrl is empty (and the "Prefer email?" link in the pop-up).
  callHref:
    'mailto:mahmoudbahaa777@gmail.com?subject=Strategy%20call%20request&body=Hi%20Mahmoud%2C%20I%27d%20like%20to%20book%20the%20free%2015-minute%20strategy%20call.',
}

export const hero = {
  eyebrow: 'Brand & growth marketing · MENA',
  headline: 'From reach to revenue.',
  subline: 'I build brands people trust and campaigns that bring qualified leads.',
  primaryCta: 'Book a strategy call',
  secondaryCta: 'What I do',
}

// Hero board: typed one by one, in this order. key: true = set in bold teal.
export const heroBoard = {
  title: 'Growth board',
  footer: 'From reach to revenue.',
  words: [
    { word: 'Positioning', tag: 'Brand' },
    { word: 'Brand lift', tag: 'Brand' },
    { word: 'Number of leads', tag: 'Leads' },
    { word: 'CPC', tag: 'Cost' },
    { word: 'CPA', tag: 'Cost' },
    { word: 'CPL', tag: 'Cost' },
    { word: 'Strategy', tag: 'Plan' },
    { word: 'ROAS', tag: 'Return' },
    { word: 'Revenue', tag: 'Result', key: true },
  ],
}

export const logoStrip = {
  label: "Brands I've worked with",
  // One-colour logo cutouts in /public/logos (white on transparent; tinted in CSS).
  // h = display height in px, tuned so the logos look equal in weight.
  logos: [
    { name: 'AvaTrade', src: '/logos/avatrade.webp', h: 58 },
    { name: 'Capex.com', src: '/logos/capex.webp', h: 40 },
    { name: 'CPT Markets', src: '/logos/cpt.webp', h: 38 },
    { name: 'Migaloz', src: '/logos/migaloz.webp', h: 34 },
    { name: 'Dimofinf', src: '/logos/dimofinf.webp', h: 44 },
  ],
  partnersLabel: 'Partners activated',
  partners: [
    { name: 'Oracle Red Bull Racing', src: '/logos/redbull-racing.webp', h: 50 },
    { name: 'Aston Martin F1', src: '/logos/aston-martin.webp', h: 34 },
    { name: 'UAE Pro League', src: '/logos/uae-pro-league.webp', h: 54 },
  ],
}

export const performance = {
  eyebrow: 'Performance campaigns',
  headline: 'Every lead, traced from impression to revenue.',
  line: "Clicks are cheap. Qualified leads aren't. Budget only grows where it earns.",
  channels: ['Google', 'YouTube', 'Meta', 'LinkedIn', 'X', 'Native', 'Programmatic'],
  // The doc specifies "6 stages, impression to revenue" without naming them.
  // These labels are a working draft — confirm or rename.
  stagesLabel: 'Tracking structure · 6 stages, impression to revenue',
  stages: ['Impression', 'Click', 'Visit', 'Lead', 'Qualified lead', 'Revenue'],
  tracking: {
    title: 'Tracking, in 4 steps',
    items: [
      ['Plan', 'agree events and what a qualified lead is.'],
      ['Tag', 'UTMs, GTM, GA4 and every pixel in one place.'],
      ['Protect', 'server-side conversion APIs, so no lead goes missing.'],
      ['Close the loop', 'CRM status and revenue sent back to ad platforms.'],
    ],
  },
  scaling: {
    title: 'Scaling, in 4 moves',
    items: [
      'Test one thing at a time.',
      'Bid for qualified leads, not form fills.',
      'Raise budget in steps on proven winners.',
      "Cut what sales can't use, fast.",
    ],
  },
}

export const services = {
  eyebrow: 'What I do',
  headline: 'One partner, from brand to pipeline.',
  items: [
    { icon: 'compass', title: 'Brand & positioning', line: 'A clear reason to choose you, said the same everywhere.' },
    { icon: 'orbit', title: '360° campaigns', line: 'One idea across digital, social, OOH, events and PR.' },
    { icon: 'target', title: 'Performance & leads', line: 'Paid media that brings qualified leads, not just clicks.' },
    { icon: 'trend', title: 'Campaign scaling', line: 'More budget behind what works, without losing efficiency.' },
    { icon: 'flag', title: 'Sponsorships', line: 'Rights turned into trust, content and tracked leads.' },
    { icon: 'mic', title: 'Influencers', line: 'Arabic-first creators measured on real actions.' },
    { icon: 'billboard', title: 'OOH & events', line: 'Physical presence that feeds the digital funnel.' },
    { icon: 'chart', title: 'Tracking & analytics', line: 'One view of what drives revenue.' },
  ],
}

export const method = {
  eyebrow: 'The Reach → Revenue method · 5 stages',
  headline: 'I build the path from attention to revenue.',
  stages: [
    ['Position', 'why you, for whom.'],
    ['Reach', 'be where your audience looks.'],
    ['Trust', 'give them reasons to believe.'],
    ['Convert', 'clear offers, fast pages, clean lead capture.'],
    ['Scale', 'track to revenue, back what works.'],
  ],
}

// Sponsor partners are named in text only — no team or league logos.
// Each zone carries its partner line plus one of the three "How it builds trust" points.
export const sponsorships = {
  eyebrow: 'Sponsorships',
  headline: 'A logo is a promise. The activation is the result.',
  line: "Partnerships I've activated for a regulated financial brand:",
  zones: [
    {
      id: 'redbull',
      partner: 'Oracle Red Bull Racing',
      category: 'F1',
      line: "A winning team's credibility, made local for MENA.",
      trust: ['Association', 'their values become yours.'],
      tone: 'energy',
    },
    {
      id: 'aston',
      partner: 'Aston Martin F1',
      category: 'F1',
      line: 'Premium positioning with a regional connection.',
      trust: ['Presence', 'trusted by top teams = safe to choose.'],
      tone: 'luxury',
    },
    {
      id: 'upl',
      partner: 'UAE Pro League',
      category: 'Football',
      line: 'Mass local reach, every matchday.',
      trust: ['Local voice', 'Arabic-first content and fan moments.'],
      tone: 'sport',
    },
  ],
}

export const experience = {
  eyebrow: 'Experience',
  // Optional strip (career totals). Set showStats=false to remove.
  showStats: true,
  stats: [
    { value: '11+', label: 'years' },
    { value: '$50M+', label: 'managed' },
    { value: '260K+', label: 'leads', highlight: true },
    { value: '4x', label: 'ROAS' },
    { value: '2B+', label: 'reach' },
  ],
}

// LinkedIn recommendations, rebuilt as on-brand cards (not screenshots).
// Edits: typos fixed, emoji removed, long ones trimmed with "…". Meaning unchanged.
// pull = the line shown large; text = the fuller quote underneath.
export const reviews = {
  eyebrow: 'Recommendations',
  headline: 'In their words.',
  note: 'From LinkedIn recommendations. Lightly edited for length.',
  items: [
    {
      name: 'Mazen Abu Ghazaleh', role: 'Chief Growth & Acquisition Officer', relation: 'Managed Mahmoud directly', date: 'May 2023',
      pull: 'A highly skilled and dedicated professional.',
      text: 'Having worked with Mahmoud for almost two years, I must say he is a highly skilled and dedicated professional who is eager to develop and learn, and easily adjusts to any given situation or business dynamics. I am glad to have worked and shared a lot of success stories with him.',
    },
    {
      name: 'Mostafa Nagaty', role: 'BU Director, digital transformation strategist', relation: 'Managed Mahmoud directly', date: 'Mar 2022',
      pull: 'Excellent results with Google campaigns that reached more qualified leads.',
      text: 'Mahmoud is a diligent and ambitious person who always strives to learn and professionalise in his specialisation. He accepts positive guidance. Although we cooperated for only one year, he achieved excellent results using Google campaigns, which helped our company reach more qualified leads.',
    },
    {
      name: 'Sara Wahba', role: 'Marketing Manager, financial services', relation: 'Same team at Capex.com', date: 'May 2023',
      pull: 'Constantly amazed by his ability to take charge and bring people with him.',
      text: 'While collaborating on multiple project teams, I was constantly amazed by his ability to take charge of a situation and persuade people to support his ideas, even those who initially held different opinions. He is always willing to share his knowledge, insights and expertise with others. … He has my highest endorsement. Definitely a valuable asset to any team.',
    },
    {
      name: 'David Kerolles', role: 'Founder, Vigilfy', relation: 'Managed Mahmoud directly', date: 'Mar 2022',
      pull: 'Helped our customers bring in many leads and grow traffic.',
      text: 'Mahmoud is a talented, skilled Google Ads and SEM specialist who helped our customers bring in many leads and increase traffic across different industries in Southern California, studying competitors and analysing markets to develop successful strategies. A great team player and an addition to any company.',
    },
    {
      name: 'Alexandra Tiplica', role: 'Managing Partner, HR Manager', relation: 'Same team', date: 'Nov 2022',
      pull: 'I would recommend him for any project that needs the very best in marketing execution.',
      text: 'He has a very strong work ethic, analytical and problem-solving skills, and has proven to be an ambitious and independent expert with a lot of analytical capability. I thoroughly appreciated dealing with him and would recommend him for any project that requires the very best in marketing execution.',
    },
    {
      name: 'Lara Hussayni', role: 'Marketing Manager, Finalto MENA', relation: 'Same team at Capex.com', date: 'May 2023',
      pull: 'One of the best team members I ever worked with.',
      text: 'I had the pleasure of working with Mahmoud for the past year and a half at CAPEX.com. He is a very dedicated person and goes above and beyond to achieve results. One of the best team members I ever worked with. I believe he would be a valuable addition to any team.',
    },
    {
      name: 'Raouf Boussaoui', role: 'Content Director, CFI Financial Group', relation: 'Same team', date: 'Apr 2022',
      pull: 'A dedicated team player with deep digital and media buying knowledge.',
      text: "Mahmoud is one of the nicest people I've ever worked with: a dedicated team player with so much digital and media buying knowledge. As a social media manager, Mahmoud helped me a lot to reach the brand's KPIs.",
    },
  ],
}

export const closing = {
  headline: "Let's build growth that pays back.",
  cta: 'Book a strategy call',
  footer: '© 2026 Mahmoud Bahaa El-Din · From reach to revenue.',
}

export const navSections = [
  { id: 'top', label: 'Start' },
  { id: 'services', label: 'What I do' },
  { id: 'performance', label: 'Performance' },
  { id: 'method', label: 'Method' },
  { id: 'sponsorships', label: 'Sponsorships' },
  { id: 'reviews', label: 'Recommendations' },
  { id: 'contact', label: 'Contact' },
]
