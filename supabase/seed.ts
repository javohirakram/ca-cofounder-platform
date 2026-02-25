/**
 * Central Asian Co-Founder Platform — Seed Data Generator
 *
 * This TypeScript script generates SQL INSERT statements for seeding the database.
 *
 * Usage:
 *   npx tsx supabase/seed.ts > supabase/generated-seed.sql
 *
 * Or simply use the pre-built supabase/seed.sql file directly.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeedProfile {
  id: string;
  full_name: string;
  email: string;
  headline: string;
  bio: string;
  role: string[];
  skills: string[];
  industries: string[];
  country: string;
  city: string;
  languages: string[];
  commitment: string;
  idea_stage: string;
  equity_min: number;
  equity_max: number;
  linkedin_url: string | null;
  telegram_handle: string;
  looking_for_roles: string[];
  looking_for_description: string;
  education: object[];
  experience: object[];
  ecosystem_tags: string[];
  is_actively_looking: boolean;
  is_admin: boolean;
  profile_completeness: number;
  last_active_offset: string; // interval string like '2 hours'
}

interface SeedAccelerator {
  id: string;
  name: string;
  description: string;
  website: string;
  country: string;
  city: string;
}

interface SeedIdea {
  id: string;
  author_id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  stage: string;
  industries: string[];
  country_focus: string[];
  looking_for_roles: string[];
  looking_for_description: string;
  upvotes: number;
  views: number;
}

interface SeedAcceleratorMember {
  accelerator_id: string;
  user_id: string;
  cohort: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(str: string): string {
  return str.replace(/'/g, "''");
}

function sqlArray(arr: string[]): string {
  if (arr.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${arr.map((s) => `'${esc(s)}'`).join(", ")}]`;
}

function sqlJsonb(obj: object): string {
  return `'${esc(JSON.stringify(obj))}'::jsonb`;
}

function sqlStr(val: string | null): string {
  if (val === null) return "NULL";
  return `'${esc(val)}'`;
}

function uuid(n: number): string {
  return `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

function accelUuid(n: number): string {
  return `a0000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

function ideaUuid(n: number): string {
  return `i0000000-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

// ---------------------------------------------------------------------------
// Data Definitions
// ---------------------------------------------------------------------------

const accelerators: SeedAccelerator[] = [
  {
    id: accelUuid(1),
    name: "Astana Hub",
    description:
      "Kazakhstan's international technology park and startup hub. Provides tax benefits, co-working spaces, acceleration programs, and a bridge to global markets for tech startups across Central Asia.",
    website: "https://astanahub.com",
    country: "KZ",
    city: "Astana",
  },
  {
    id: accelUuid(2),
    name: "IT Park Uzbekistan",
    description:
      "Uzbekistan's flagship IT and startup ecosystem hub based in Tashkent. Offers resident status with tax incentives, mentorship programs, co-working spaces, and access to government digitization contracts.",
    website: "https://it-park.uz",
    country: "UZ",
    city: "Tashkent",
  },
  {
    id: accelUuid(3),
    name: "MOST Tech Hub",
    description:
      "Kyrgyzstan's leading technology and innovation hub in Bishkek. Runs acceleration programs, hosts community events, and connects local startups to regional and international investors.",
    website: "https://most.kg",
    country: "KG",
    city: "Bishkek",
  },
  {
    id: accelUuid(4),
    name: "UTECH",
    description:
      "Tajikistan's emerging startup accelerator based in Dushanbe. Focused on building local tech talent, running bootcamps, and supporting early-stage founders with mentorship and seed funding.",
    website: "https://utech.tj",
    country: "TJ",
    city: "Dushanbe",
  },
];

const profiles: SeedProfile[] = [
  // ======================== KAZAKHSTAN (5) ========================
  {
    id: uuid(1),
    full_name: "Aibek Nurlanuly",
    email: "aibek.nurlan@test.com",
    headline:
      "Ex-Kaspi engineer building B2B payments infrastructure for Central Asian SMEs",
    bio: "Full-stack engineer with 5 years at Kaspi.kz, where I led the merchant payments integration team. Now I'm building a cross-border B2B payment rail for SMEs trading between KZ, UZ, and KG. Looking for a business co-founder who understands trade finance.",
    role: ["technical"],
    skills: [
      "React",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "Fintech APIs",
      "System Design",
    ],
    industries: ["Fintech", "SaaS"],
    country: "KZ",
    city: "Almaty",
    languages: ["English", "Russian", "Kazakh"],
    commitment: "full_time",
    idea_stage: "prototype",
    equity_min: 10,
    equity_max: 30,
    linkedin_url: "https://linkedin.com/in/aibek-nurlanuly",
    telegram_handle: "@aibek_dev",
    looking_for_roles: ["business", "operations"],
    looking_for_description:
      "Looking for a business-savvy co-founder who understands cross-border trade and can handle BD, compliance, and partnerships with banks in KZ/UZ.",
    education: [
      {
        institution: "Nazarbayev University",
        degree: "BSc Computer Science",
        year: "2018",
      },
    ],
    experience: [
      {
        company: "Kaspi.kz",
        role: "Senior Software Engineer",
        years: "2018-2023",
      },
      { company: "Self-employed", role: "Founder", years: "2023-present" },
    ],
    ecosystem_tags: ["Astana Hub"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 90,
    last_active_offset: "2 hours",
  },
  {
    id: uuid(2),
    full_name: "Dana Suleimenova",
    email: "dana.suleimen@test.com",
    headline:
      "Ex-McKinsey consultant | Building the Shopify for Central Asian bazaar merchants",
    bio: "After 3 years at McKinsey advising retail and FMCG clients across CIS, I'm now obsessed with digitizing the bazaar economy. Over 70% of retail in CA is still cash-based and offline. I'm building tools that let bazaar sellers go online without needing tech skills.",
    role: ["business"],
    skills: [
      "Strategy",
      "Financial Modeling",
      "Market Research",
      "Growth",
      "Fundraising",
    ],
    industries: ["E-commerce", "Marketplace"],
    country: "KZ",
    city: "Almaty",
    languages: ["English", "Russian", "Kazakh"],
    commitment: "full_time",
    idea_stage: "concept",
    equity_min: 15,
    equity_max: 40,
    linkedin_url: "https://linkedin.com/in/dana-suleimenova",
    telegram_handle: "@dana_biz",
    looking_for_roles: ["technical", "design"],
    looking_for_description:
      "Need a technical co-founder who can build a mobile-first e-commerce platform with offline-first capabilities. Design skills a huge plus.",
    education: [
      {
        institution: "KIMEP University",
        degree: "BBA Finance",
        year: "2017",
      },
      {
        institution: "London Business School",
        degree: "MBA",
        year: "2022",
      },
    ],
    experience: [
      {
        company: "McKinsey & Company",
        role: "Associate",
        years: "2019-2022",
      },
      {
        company: "Chocofamily",
        role: "Head of Strategy",
        years: "2022-2024",
      },
    ],
    ecosystem_tags: ["Astana Hub", "Google for Startups"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 85,
    last_active_offset: "5 hours",
  },
  {
    id: uuid(3),
    full_name: "Timur Kasymov",
    email: "timur.kasym@test.com",
    headline:
      "ML Engineer from Kolesa Group | Building AI-powered logistics optimization for CA",
    bio: "Spent 4 years at Kolesa Group building recommendation engines and search ranking algorithms. Now applying ML to solve last-mile delivery inefficiencies across Central Asia where 40% of goods are delayed due to poor route planning.",
    role: ["technical", "product"],
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "Go",
      "Kubernetes",
      "Data Engineering",
    ],
    industries: ["Logistics", "AI/ML"],
    country: "KZ",
    city: "Almaty",
    languages: ["English", "Russian", "Kazakh"],
    commitment: "full_time",
    idea_stage: "side_project",
    equity_min: 20,
    equity_max: 45,
    linkedin_url: "https://linkedin.com/in/timur-kasymov",
    telegram_handle: "@timur_ml",
    looking_for_roles: ["business", "operations"],
    looking_for_description:
      "Seeking a co-founder with logistics industry experience — ideally someone who has managed fleet operations or worked with freight forwarders in the region.",
    education: [
      {
        institution: "KBTU",
        degree: "BSc Applied Mathematics",
        year: "2017",
      },
      {
        institution: "Coursera / Stanford",
        degree: "ML Specialization",
        year: "2019",
      },
    ],
    experience: [
      {
        company: "Kolesa Group",
        role: "Senior ML Engineer",
        years: "2018-2023",
      },
      { company: "Independent", role: "Founder", years: "2023-present" },
    ],
    ecosystem_tags: ["Astana Hub", "NURIS"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 92,
    last_active_offset: "1 hour",
  },
  {
    id: uuid(4),
    full_name: "Madina Abenova",
    email: "madina.abenova@test.com",
    headline:
      "AIFC fintech lead | Connecting Central Asian startups with Islamic finance",
    bio: "Led fintech regulatory sandbox initiatives at AIFC for 2 years. Deep expertise in Islamic finance, regulatory compliance, and cross-border financial products. Building a shariah-compliant crowdfunding platform for SMEs.",
    role: ["business", "operations"],
    skills: [
      "Regulatory Compliance",
      "Islamic Finance",
      "Product Strategy",
      "Partnerships",
      "Legal",
    ],
    industries: ["Fintech"],
    country: "KZ",
    city: "Astana",
    languages: ["English", "Russian", "Kazakh"],
    commitment: "part_time",
    idea_stage: "have_idea",
    equity_min: 10,
    equity_max: 25,
    linkedin_url: "https://linkedin.com/in/madina-abenova",
    telegram_handle: "@madina_fintech",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Looking for a backend/fintech engineer who can build secure payment processing and investor dashboards. Experience with KYC/AML systems is preferred.",
    education: [
      {
        institution: "Nazarbayev University",
        degree: "BSc Economics",
        year: "2019",
      },
      {
        institution: "CFA Institute",
        degree: "CFA Level II",
        year: "2022",
      },
    ],
    experience: [
      {
        company: "AIFC",
        role: "Fintech Regulation Lead",
        years: "2021-2023",
      },
      {
        company: "Halyk Bank",
        role: "Digital Products Analyst",
        years: "2019-2021",
      },
    ],
    ecosystem_tags: ["Astana Hub"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 80,
    last_active_offset: "12 hours",
  },
  {
    id: uuid(5),
    full_name: "Yerbol Sakenov",
    email: "yerbol.saken@test.com",
    headline:
      "UX lead at DAR Ecosystem | Designing healthtech for underserved rural communities",
    bio: "Lead product designer at DAR with a passion for accessible design. Worked on 3 apps serving millions of Kazakh users. Now building a telemedicine platform that connects rural patients with city doctors via low-bandwidth video.",
    role: ["design", "product"],
    skills: [
      "UI/UX Design",
      "Figma",
      "User Research",
      "Product Management",
      "Mobile Design",
    ],
    industries: ["Healthtech"],
    country: "KZ",
    city: "Astana",
    languages: ["English", "Russian", "Kazakh"],
    commitment: "part_time",
    idea_stage: "concept",
    equity_min: 15,
    equity_max: 35,
    linkedin_url: "https://linkedin.com/in/yerbol-sakenov",
    telegram_handle: "@yerbol_ux",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Need a mobile developer (React Native or Flutter) with experience building video/WebRTC features. Bonus if you understand healthcare compliance.",
    education: [
      {
        institution: "Suleyman Demirel University",
        degree: "BSc Information Systems",
        year: "2018",
      },
    ],
    experience: [
      {
        company: "DAR Ecosystem",
        role: "Lead Product Designer",
        years: "2020-present",
      },
      {
        company: "Beeline Kazakhstan",
        role: "UI Designer",
        years: "2018-2020",
      },
    ],
    ecosystem_tags: ["Astana Hub", "Google for Startups"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 85,
    last_active_offset: "3 hours",
  },

  // ======================== UZBEKISTAN (5) ========================
  {
    id: uuid(6),
    full_name: "Sardor Abdullaev",
    email: "sardor.abdullaev@test.com",
    headline:
      "Full-stack dev from IT Park | Building edtech for rural school students",
    bio: "Software engineer and IT Park Uzbekistan resident. Built internal tools at Payme that processed millions of transactions. Now creating an adaptive learning platform to bridge the education gap between Tashkent and rural Uzbekistan.",
    role: ["technical"],
    skills: [
      "React",
      "TypeScript",
      "Python",
      "Django",
      "PostgreSQL",
      "Docker",
    ],
    industries: ["Edtech"],
    country: "UZ",
    city: "Tashkent",
    languages: ["English", "Russian", "Uzbek"],
    commitment: "full_time",
    idea_stage: "prototype",
    equity_min: 15,
    equity_max: 40,
    linkedin_url: "https://linkedin.com/in/sardor-abdullaev",
    telegram_handle: "@sardor_coder",
    looking_for_roles: ["business", "product"],
    looking_for_description:
      "Need a co-founder who can handle partnerships with the Ministry of Education and navigate school procurement. Product thinking is a must.",
    education: [
      {
        institution: "Inha University in Tashkent",
        degree: "BSc Computer Science",
        year: "2020",
      },
    ],
    experience: [
      {
        company: "Payme",
        role: "Software Engineer",
        years: "2020-2023",
      },
      {
        company: "Self-employed",
        role: "Founder",
        years: "2023-present",
      },
    ],
    ecosystem_tags: ["IT Park Uzbekistan"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 88,
    last_active_offset: "30 minutes",
  },
  {
    id: uuid(7),
    full_name: "Nodira Karimova",
    email: "nodira.karimova@test.com",
    headline:
      "Ex-Uzum marketplace ops lead | Solving agritech supply chain for Fergana Valley farmers",
    bio: "Managed marketplace operations at Uzum handling 10K+ daily orders. Grew up in Fergana and saw firsthand how farmers lose 30-40% of produce to middlemen and poor cold chain. Building a farm-to-table marketplace with integrated logistics.",
    role: ["business", "operations"],
    skills: [
      "Operations",
      "Supply Chain",
      "Marketplace Ops",
      "Growth Hacking",
      "P&L Management",
    ],
    industries: ["Agritech", "Marketplace"],
    country: "UZ",
    city: "Tashkent",
    languages: ["English", "Russian", "Uzbek"],
    commitment: "full_time",
    idea_stage: "have_idea",
    equity_min: 20,
    equity_max: 45,
    linkedin_url: "https://linkedin.com/in/nodira-karimova",
    telegram_handle: "@nodira_ops",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Looking for a technical co-founder who can build a logistics-integrated marketplace. Experience with real-time tracking, route optimization, or cold chain monitoring is ideal.",
    education: [
      {
        institution: "Westminster International University in Tashkent",
        degree: "BBA Business Administration",
        year: "2019",
      },
    ],
    experience: [
      {
        company: "Uzum",
        role: "Operations Lead",
        years: "2021-2024",
      },
      {
        company: "Express24",
        role: "Operations Manager",
        years: "2019-2021",
      },
    ],
    ecosystem_tags: ["IT Park Uzbekistan"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 82,
    last_active_offset: "6 hours",
  },
  {
    id: uuid(8),
    full_name: "Jasur Toshmatov",
    email: "jasur.toshmatov@test.com",
    headline:
      "Backend engineer at EPAM | Building open-source Uzbek NLP tools and a Chatbot platform",
    bio: "Senior backend engineer at EPAM Systems, focused on enterprise integrations. On the side, I've been building Uzbek-language NLP models and a chatbot platform that lets businesses deploy customer support bots in Uzbek and Russian.",
    role: ["technical"],
    skills: [
      "Java",
      "Spring Boot",
      "NLP",
      "Python",
      "Microservices",
      "Elasticsearch",
    ],
    industries: ["AI/ML", "SaaS"],
    country: "UZ",
    city: "Tashkent",
    languages: ["English", "Russian", "Uzbek"],
    commitment: "part_time",
    idea_stage: "side_project",
    equity_min: 10,
    equity_max: 30,
    linkedin_url: "https://linkedin.com/in/jasur-toshmatov",
    telegram_handle: "@jasur_nlp",
    looking_for_roles: ["business", "product"],
    looking_for_description:
      "Seeking a co-founder who can sell to enterprises — banks, telecoms, government agencies in UZ. Need someone who can close B2B deals and build partnerships.",
    education: [
      {
        institution: "Tashkent University of Information Technologies",
        degree: "BSc Software Engineering",
        year: "2018",
      },
    ],
    experience: [
      {
        company: "EPAM Systems",
        role: "Senior Software Engineer",
        years: "2019-present",
      },
      {
        company: "UzCard",
        role: "Junior Developer",
        years: "2018-2019",
      },
    ],
    ecosystem_tags: ["IT Park Uzbekistan"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 78,
    last_active_offset: "1 day",
  },
  {
    id: uuid(9),
    full_name: "Dilnoza Rakhimova",
    email: "dilnoza.rakhimova@test.com",
    headline:
      "Tourism tech entrepreneur | Digitizing Silk Road tourism experiences",
    bio: "Born and raised in Samarkand, I've been working in tourism for 6 years. Built a tour operator business from scratch serving 2000+ tourists annually. Now creating a platform to connect independent local guides with travelers and offer bookable cultural experiences.",
    role: ["business", "product"],
    skills: [
      "Product Strategy",
      "Tourism",
      "Marketing",
      "Community Building",
      "Content Strategy",
    ],
    industries: ["Marketplace", "E-commerce"],
    country: "UZ",
    city: "Samarkand",
    languages: ["English", "Russian", "Uzbek"],
    commitment: "full_time",
    idea_stage: "early_traction",
    equity_min: 15,
    equity_max: 35,
    linkedin_url: "https://linkedin.com/in/dilnoza-rakhimova",
    telegram_handle: "@dilnoza_travel",
    looking_for_roles: ["technical", "design"],
    looking_for_description:
      "Need a technical co-founder to build a booking and payments platform. Ideally someone who has worked on marketplace products with reviews, scheduling, and payment escrow.",
    education: [
      {
        institution: "Samarkand State University",
        degree: "BA Tourism Management",
        year: "2017",
      },
    ],
    experience: [
      {
        company: "Silk Road Adventures (own company)",
        role: "Founder & CEO",
        years: "2018-present",
      },
    ],
    ecosystem_tags: ["IT Park Uzbekistan"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 88,
    last_active_offset: "4 hours",
  },
  {
    id: uuid(10),
    full_name: "Sherzod Mirzaev",
    email: "sherzod.mirzaev@test.com",
    headline:
      "Mobile dev building offline-first fintech for unbanked populations in rural Uzbekistan",
    bio: "Self-taught mobile developer from Samarkand. Built 3 apps with 50K+ combined downloads. Passionate about financial inclusion — currently prototyping a USSD + mobile app that lets people without smartphones access basic banking services.",
    role: ["technical"],
    skills: [
      "Flutter",
      "Dart",
      "Firebase",
      "USSD",
      "Kotlin",
      "Offline-first Architecture",
    ],
    industries: ["Fintech"],
    country: "UZ",
    city: "Samarkand",
    languages: ["Russian", "Uzbek"],
    commitment: "full_time",
    idea_stage: "prototype",
    equity_min: 20,
    equity_max: 50,
    linkedin_url: null,
    telegram_handle: "@sherzod_mobile",
    looking_for_roles: ["business"],
    looking_for_description:
      "Looking for a co-founder who understands microfinance regulations in Uzbekistan and can build relationships with banks and MFIs for API integrations.",
    education: [
      {
        institution: "Self-taught",
        degree: "Mobile Development",
        year: "2019",
      },
    ],
    experience: [
      {
        company: "Freelance",
        role: "Mobile Developer",
        years: "2019-2022",
      },
      {
        company: "Click.uz",
        role: "Mobile Developer",
        years: "2022-2024",
      },
    ],
    ecosystem_tags: ["IT Park Uzbekistan"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 75,
    last_active_offset: "8 hours",
  },

  // ======================== KYRGYZSTAN (4) ========================
  {
    id: uuid(11),
    full_name: "Aizada Turgunova",
    email: "aizada.turgunova@test.com",
    headline:
      "Climate tech advocate | Building carbon credit marketplace for Central Asian enterprises",
    bio: "Environmental policy researcher turned entrepreneur. Spent 3 years at UNDP Kyrgyzstan working on climate adaptation projects. Now building a platform where CA companies can measure, report, and offset their carbon footprint through verified local projects.",
    role: ["business"],
    skills: [
      "Climate Policy",
      "ESG",
      "Fundraising",
      "Stakeholder Management",
      "Impact Measurement",
    ],
    industries: ["Cleantech"],
    country: "KG",
    city: "Bishkek",
    languages: ["English", "Russian", "Kyrgyz"],
    commitment: "full_time",
    idea_stage: "concept",
    equity_min: 15,
    equity_max: 40,
    linkedin_url: "https://linkedin.com/in/aizada-turgunova",
    telegram_handle: "@aizada_climate",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Need a full-stack developer who can build a marketplace with verification workflows, data dashboards, and payment processing. Blockchain/smart contract experience would be amazing.",
    education: [
      {
        institution: "American University of Central Asia",
        degree: "BA Economics",
        year: "2018",
      },
      {
        institution: "University of Cambridge",
        degree: "MPhil Environmental Policy",
        year: "2020",
      },
    ],
    experience: [
      {
        company: "UNDP Kyrgyzstan",
        role: "Climate Policy Analyst",
        years: "2020-2023",
      },
    ],
    ecosystem_tags: ["MOST"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 82,
    last_active_offset: "3 hours",
  },
  {
    id: uuid(12),
    full_name: "Bakyt Asanov",
    email: "bakyt.asanov@test.com",
    headline:
      "DevOps engineer | Building cloud infrastructure platform tailored for Central Asian startups",
    bio: "Spent 5 years doing DevOps at various Bishkek agencies and remote contracts. Central Asian startups waste time and money on misconfigured cloud setups. Building a managed platform that simplifies deployment for teams without dedicated DevOps.",
    role: ["technical"],
    skills: [
      "AWS",
      "Terraform",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Linux",
      "Go",
    ],
    industries: ["SaaS"],
    country: "KG",
    city: "Bishkek",
    languages: ["English", "Russian", "Kyrgyz"],
    commitment: "part_time",
    idea_stage: "side_project",
    equity_min: 20,
    equity_max: 50,
    linkedin_url: "https://linkedin.com/in/bakyt-asanov",
    telegram_handle: "@bakyt_devops",
    looking_for_roles: ["business", "product"],
    looking_for_description:
      "Seeking a co-founder who can handle sales, marketing, and customer success. Need someone who speaks the language of CTOs and can sell developer tools in the region.",
    education: [
      {
        institution: "Kyrgyz-Turkish Manas University",
        degree: "BSc Computer Engineering",
        year: "2017",
      },
    ],
    experience: [
      {
        company: "Various (Remote Contracts)",
        role: "DevOps Engineer",
        years: "2017-2022",
      },
      {
        company: "Namba",
        role: "Senior DevOps",
        years: "2022-present",
      },
    ],
    ecosystem_tags: ["MOST"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 78,
    last_active_offset: "16 hours",
  },
  {
    id: uuid(13),
    full_name: "Nuraiym Ibraimova",
    email: "nuraiym.ibraimova@test.com",
    headline:
      "Product designer from O! Telecom | Building HR-tech platform for Central Asian remote workers",
    bio: "Product designer with 4 years of experience in telecom and fintech. Central Asia has a huge remote workforce, but no HR platform handles local tax compliance, payments in local currencies, and cultural context. That's what I'm building.",
    role: ["design", "product"],
    skills: [
      "Product Design",
      "Figma",
      "User Research",
      "Prototyping",
      "Design Systems",
      "UX Writing",
    ],
    industries: ["SaaS", "Marketplace"],
    country: "KG",
    city: "Bishkek",
    languages: ["English", "Russian", "Kyrgyz"],
    commitment: "full_time",
    idea_stage: "have_idea",
    equity_min: 15,
    equity_max: 35,
    linkedin_url: "https://linkedin.com/in/nuraiym-ibraimova",
    telegram_handle: "@nuraiym_design",
    looking_for_roles: ["technical", "business"],
    looking_for_description:
      "Looking for both a technical co-founder (backend/payments) and a business co-founder who understands HR compliance across KZ, UZ, KG. One or two people who cover both would be perfect.",
    education: [
      {
        institution: "American University of Central Asia",
        degree: "BSc Software Engineering",
        year: "2019",
      },
    ],
    experience: [
      {
        company: "O! Telecom",
        role: "Product Designer",
        years: "2019-2022",
      },
      {
        company: "MBank",
        role: "Senior Product Designer",
        years: "2022-present",
      },
    ],
    ecosystem_tags: ["MOST", "Google for Startups"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 80,
    last_active_offset: "7 hours",
  },
  {
    id: uuid(14),
    full_name: "Azamat Toktogulov",
    email: "azamat.toktogulov@test.com",
    headline:
      "Hardware + IoT engineer | Building smart water management systems for Kyrgyz agriculture",
    bio: "Electrical engineer from Osh who built IoT sensor networks for a USAID water management project. Kyrgyzstan wastes 40% of irrigation water due to outdated infrastructure. Building affordable smart irrigation controllers with solar-powered sensors.",
    role: ["technical", "operations"],
    skills: [
      "IoT",
      "Embedded Systems",
      "C++",
      "Solar Energy",
      "Hardware Prototyping",
      "Arduino",
    ],
    industries: ["Agritech", "Cleantech"],
    country: "KG",
    city: "Osh",
    languages: ["Russian", "Kyrgyz", "Uzbek"],
    commitment: "full_time",
    idea_stage: "prototype",
    equity_min: 25,
    equity_max: 50,
    linkedin_url: null,
    telegram_handle: "@azamat_iot",
    looking_for_roles: ["business"],
    looking_for_description:
      "Need a co-founder who can handle government tenders, NGO partnerships, and farmer cooperatives. Understanding of agricultural subsidies and water rights in KG is essential.",
    education: [
      {
        institution: "Osh Technological University",
        degree: "BSc Electrical Engineering",
        year: "2016",
      },
    ],
    experience: [
      {
        company: "USAID Water Project",
        role: "IoT Engineer",
        years: "2017-2020",
      },
      {
        company: "Freelance",
        role: "IoT Consultant",
        years: "2020-present",
      },
    ],
    ecosystem_tags: ["MOST"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 75,
    last_active_offset: "2 days",
  },

  // ======================== TAJIKISTAN (3) ========================
  {
    id: uuid(15),
    full_name: "Firdavs Rahimov",
    email: "firdavs.rahimov@test.com",
    headline:
      "Ex-Tcell product manager | Building remittance-linked savings product for Tajik migrants",
    bio: "Former PM at Tcell (Tajikistan's largest telecom). Tajikistan receives $2.5B+ in remittances annually — almost 30% of GDP — but most of it is spent immediately. Building a micro-savings product that automatically saves a percentage of each remittance.",
    role: ["business", "product"],
    skills: [
      "Product Management",
      "Mobile Money",
      "Growth Strategy",
      "Telecoms",
      "Partnerships",
    ],
    industries: ["Fintech"],
    country: "TJ",
    city: "Dushanbe",
    languages: ["English", "Russian", "Tajik"],
    commitment: "full_time",
    idea_stage: "concept",
    equity_min: 15,
    equity_max: 40,
    linkedin_url: "https://linkedin.com/in/firdavs-rahimov",
    telegram_handle: "@firdavs_pm",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Need a mobile/backend engineer who can build integrations with remittance providers (Western Union, Zolotaya Korona) and mobile money platforms. Security expertise is critical.",
    education: [
      {
        institution: "Russian-Tajik (Slavonic) University",
        degree: "BSc Economics",
        year: "2017",
      },
      {
        institution: "University of Central Asia",
        degree: "MBA",
        year: "2021",
      },
    ],
    experience: [
      {
        company: "Tcell",
        role: "Senior Product Manager",
        years: "2019-2024",
      },
      {
        company: "Megafon Tajikistan",
        role: "Product Analyst",
        years: "2017-2019",
      },
    ],
    ecosystem_tags: ["UTECH"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 82,
    last_active_offset: "5 hours",
  },
  {
    id: uuid(16),
    full_name: "Sitora Nazarova",
    email: "sitora.nazarova@test.com",
    headline:
      "Full-stack developer building Tajik language learning app for diaspora children",
    bio: "Software developer who grew up in Dushanbe and studied in Russia. Noticed that children of Tajik migrants abroad are losing connection to their language. Building a gamified Tajik language app with speech recognition and cultural stories.",
    role: ["technical"],
    skills: [
      "React Native",
      "Node.js",
      "MongoDB",
      "Speech Recognition",
      "Gamification",
      "TypeScript",
    ],
    industries: ["Edtech"],
    country: "TJ",
    city: "Dushanbe",
    languages: ["English", "Russian", "Tajik"],
    commitment: "part_time",
    idea_stage: "side_project",
    equity_min: 20,
    equity_max: 50,
    linkedin_url: "https://linkedin.com/in/sitora-nazarova",
    telegram_handle: "@sitora_dev",
    looking_for_roles: ["business", "design"],
    looking_for_description:
      "Looking for a co-founder who can handle marketing to the Tajik diaspora (Russia, Kazakhstan, Turkey) and someone with illustration/animation skills for the learning content.",
    education: [
      {
        institution: "Moscow State University",
        degree: "BSc Computer Science",
        year: "2020",
      },
    ],
    experience: [
      {
        company: "Yandex",
        role: "Junior Developer",
        years: "2020-2021",
      },
      {
        company: "Remote (Freelance)",
        role: "Full-stack Developer",
        years: "2021-present",
      },
    ],
    ecosystem_tags: ["UTECH"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 78,
    last_active_offset: "1 day",
  },
  {
    id: uuid(17),
    full_name: "Komron Sharipov",
    email: "komron.sharipov@test.com",
    headline:
      "Logistics operations manager | Building cross-border trucking marketplace for TJ-KZ-UZ corridor",
    bio: "Managed logistics operations for one of Khujand's largest bazaar wholesale businesses. Trucks between Tajikistan, Uzbekistan, and Kazakhstan run 60% empty on return trips. Building a load-matching marketplace to fill those trucks.",
    role: ["business", "operations"],
    skills: [
      "Logistics",
      "Fleet Management",
      "Negotiation",
      "Cross-border Trade",
      "Operations",
    ],
    industries: ["Logistics", "Marketplace"],
    country: "TJ",
    city: "Khujand",
    languages: ["Russian", "Tajik", "Uzbek"],
    commitment: "full_time",
    idea_stage: "have_idea",
    equity_min: 25,
    equity_max: 50,
    linkedin_url: null,
    telegram_handle: "@komron_logistics",
    looking_for_roles: ["technical"],
    looking_for_description:
      "Need a developer who can build a mobile app for truck drivers (many use low-end Android phones) and a web dashboard for dispatchers. GPS tracking and offline support are must-haves.",
    education: [
      {
        institution: "Khujand State University",
        degree: "BA Economics",
        year: "2015",
      },
    ],
    experience: [
      {
        company: "Family Business (Wholesale)",
        role: "Logistics Manager",
        years: "2015-2022",
      },
      {
        company: "Self-employed",
        role: "Logistics Consultant",
        years: "2022-present",
      },
    ],
    ecosystem_tags: ["UTECH"],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 70,
    last_active_offset: "3 days",
  },

  // ======================== TURKMENISTAN (3) ========================
  {
    id: uuid(18),
    full_name: "Merdan Orazov",
    email: "merdan.orazov@test.com",
    headline:
      "Backend engineer | Building encrypted communication tools for Central Asian businesses",
    bio: "Software engineer focused on security and privacy. Built internal communication tools for a Turkmen government agency. Now working on an end-to-end encrypted business messaging platform with compliance features designed for CA regulatory environments.",
    role: ["technical"],
    skills: [
      "Go",
      "Cryptography",
      "Distributed Systems",
      "gRPC",
      "PostgreSQL",
      "Security",
    ],
    industries: ["SaaS"],
    country: "TM",
    city: "Ashgabat",
    languages: ["English", "Russian", "Turkmen"],
    commitment: "part_time",
    idea_stage: "concept",
    equity_min: 20,
    equity_max: 50,
    linkedin_url: null,
    telegram_handle: "@merdan_sec",
    looking_for_roles: ["business"],
    looking_for_description:
      "Looking for a business co-founder who can navigate enterprise sales in Central Asia. Need someone who understands government procurement and has connections in KZ/UZ corporate world.",
    education: [
      {
        institution: "Turkmen State University",
        degree: "BSc Mathematics",
        year: "2018",
      },
      {
        institution: "Coursera / Georgia Tech",
        degree: "Cybersecurity Certificate",
        year: "2021",
      },
    ],
    experience: [
      {
        company: "Government Agency (Turkmenistan)",
        role: "Software Developer",
        years: "2018-2021",
      },
      {
        company: "Remote (EU clients)",
        role: "Backend Developer",
        years: "2021-present",
      },
    ],
    ecosystem_tags: [],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 72,
    last_active_offset: "2 days",
  },
  {
    id: uuid(19),
    full_name: "Aylar Berdiyeva",
    email: "aylar.berdiyeva@test.com",
    headline:
      "Digital marketing specialist | Building e-commerce enablement platform for Turkmen artisans",
    bio: "Started doing social media marketing for local businesses in Ashgabat and discovered that Turkmen artisans (carpet weavers, jewelers, silk producers) have incredible products but zero access to international markets. Building a platform to bridge that gap.",
    role: ["business", "product"],
    skills: [
      "Digital Marketing",
      "E-commerce",
      "Social Media",
      "Content Creation",
      "Brand Strategy",
    ],
    industries: ["E-commerce", "Marketplace"],
    country: "TM",
    city: "Ashgabat",
    languages: ["English", "Russian", "Turkmen"],
    commitment: "full_time",
    idea_stage: "have_idea",
    equity_min: 15,
    equity_max: 40,
    linkedin_url: "https://linkedin.com/in/aylar-berdiyeva",
    telegram_handle: "@aylar_ecom",
    looking_for_roles: ["technical", "design"],
    looking_for_description:
      "Need a technical co-founder to build an international marketplace with multi-currency payments, shipping calculator, and artisan profiles. A designer co-founder would also be welcome.",
    education: [
      {
        institution:
          "International University of Humanities and Development",
        degree: "BA International Relations",
        year: "2020",
      },
    ],
    experience: [
      {
        company: "Freelance",
        role: "Digital Marketing Consultant",
        years: "2020-present",
      },
    ],
    ecosystem_tags: [],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 68,
    last_active_offset: "4 days",
  },
  {
    id: uuid(20),
    full_name: "Dovlet Annayev",
    email: "dovlet.annayev@test.com",
    headline:
      "Oil & gas engineer turned developer | Building energy sector digitization tools",
    bio: "Worked for 3 years as a petroleum engineer at Turkmengas before teaching myself programming. The energy sector in CA runs on spreadsheets and paper. Building SaaS tools for well monitoring, production reporting, and equipment maintenance tracking.",
    role: ["technical", "operations"],
    skills: [
      "Python",
      "React",
      "IoT",
      "Data Visualization",
      "PostgreSQL",
      "Industrial Automation",
    ],
    industries: ["SaaS", "Cleantech"],
    country: "TM",
    city: "Mary",
    languages: ["Russian", "Turkmen"],
    commitment: "full_time",
    idea_stage: "prototype",
    equity_min: 25,
    equity_max: 50,
    linkedin_url: null,
    telegram_handle: "@dovlet_energy",
    looking_for_roles: ["business"],
    looking_for_description:
      "Looking for a co-founder who knows how to sell to oil and gas companies in KZ and TM. Need someone who can handle enterprise sales cycles and government relations.",
    education: [
      {
        institution: "International Oil and Gas University (Turkmenistan)",
        degree: "BSc Petroleum Engineering",
        year: "2018",
      },
    ],
    experience: [
      {
        company: "Turkmengas",
        role: "Petroleum Engineer",
        years: "2018-2021",
      },
      {
        company: "Self-taught",
        role: "Software Developer",
        years: "2021-present",
      },
    ],
    ecosystem_tags: [],
    is_actively_looking: true,
    is_admin: false,
    profile_completeness: 70,
    last_active_offset: "5 days",
  },
];

const ideas: SeedIdea[] = [
  {
    id: ideaUuid(1),
    author_id: uuid(1),
    title:
      "PayBridge CA — Cross-border B2B Payment Rails for Central Asian SMEs",
    description:
      "A unified payment infrastructure that lets SMEs in Kazakhstan, Uzbekistan, and Kyrgyzstan send and receive B2B payments across borders in minutes instead of days, with transparent FX rates and full compliance.",
    problem:
      "SMEs trading across Central Asian borders face 3-5 day settlement times, opaque FX markups of 3-5%, and a mountain of compliance paperwork. Most resort to carrying cash across borders, which is risky and unscalable. Existing SWIFT-based solutions are designed for large corporations and charge prohibitive fees for small transactions.",
    solution:
      "A digital payment platform with direct integrations to local payment systems (Kaspi, Payme, Mbank) that enables same-day cross-border settlements. We use local bank partnerships in each country to avoid SWIFT entirely, cutting costs by 80%. Built-in KYC/AML compliance automates the paperwork that currently takes days.",
    stage: "prototype",
    industries: ["Fintech", "SaaS"],
    country_focus: ["KZ", "UZ", "KG"],
    looking_for_roles: ["business", "operations"],
    looking_for_description:
      "Looking for a co-founder with banking/compliance experience who can manage relationships with partner banks and navigate multi-country financial regulations.",
    upvotes: 12,
    views: 145,
  },
  {
    id: ideaUuid(2),
    author_id: uuid(6),
    title:
      "DarsX — Adaptive Learning Platform for Underserved Schools in Uzbekistan",
    description:
      "An AI-powered adaptive learning platform that works offline on low-cost tablets, personalized for each student's pace and aligned with the Uzbek national curriculum. Designed for schools with limited internet and no IT staff.",
    problem:
      "Rural Uzbekistan has 6 million school-age children, but teacher shortages mean 1 teacher per 40+ students. Internet penetration outside cities is below 30%, and existing edtech platforms require constant connectivity. Students in rural areas score 35% lower on national tests than their Tashkent peers.",
    solution:
      "An offline-first tablet app that uses lightweight ML models to adapt lesson difficulty in real-time. Content is pre-loaded and syncs when connectivity is available. Teachers get dashboards showing each student's progress. The platform is aligned with Uzbekistan's national curriculum and available in Uzbek, Russian, and Karakalpak.",
    stage: "prototype",
    industries: ["Edtech", "AI/ML"],
    country_focus: ["UZ"],
    looking_for_roles: ["business", "product"],
    looking_for_description:
      "Need a co-founder who can handle Ministry of Education relationships, school procurement cycles, and grant/impact funding applications.",
    upvotes: 24,
    views: 310,
  },
  {
    id: ideaUuid(3),
    author_id: uuid(11),
    title:
      "CarbonCA — Carbon Credit Marketplace for Central Asian Enterprises",
    description:
      "A verified carbon credit marketplace where Central Asian companies can measure their emissions, purchase offsets from local environmental projects (reforestation, clean energy, methane capture), and generate ESG reports for international partners.",
    problem:
      "Central Asian companies increasingly need ESG compliance to work with international partners, but there is no regional carbon marketplace. Existing global platforms (Verra, Gold Standard) have zero local projects. Companies have no way to offset locally, and environmental projects in CA struggle to monetize their impact.",
    solution:
      "A three-sided marketplace connecting (1) companies needing offsets, (2) local environmental projects generating credits, and (3) verifiers who validate the credits. Built-in emissions calculator using regional industry benchmarks. Smart contracts ensure transparent credit retirement. ESG report generator for international compliance.",
    stage: "concept",
    industries: ["Cleantech", "Marketplace"],
    country_focus: ["KZ", "KG", "UZ"],
    looking_for_roles: ["technical"],
    looking_for_description:
      "Looking for a full-stack developer who can build the marketplace, verification workflows, and carbon accounting engine. Blockchain experience is a plus.",
    upvotes: 8,
    views: 89,
  },
  {
    id: ideaUuid(4),
    author_id: uuid(9),
    title:
      "SilkStay — Bookable Cultural Experiences Along the Silk Road",
    description:
      "An Airbnb Experiences-style platform focused exclusively on the Silk Road corridor (Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan). Local guides, artisans, and families offer authentic cultural experiences that travelers can discover and book instantly.",
    problem:
      "Central Asia welcomed 12 million tourists in 2023, growing 40% YoY, but most bookings still happen through opaque travel agencies or WhatsApp groups. Independent travelers struggle to find authentic local experiences, and local guides have no way to build reputation or get discovered online. 90% of tourism revenue goes to intermediaries.",
    solution:
      "A curated marketplace where local hosts list experiences (pottery workshops in Bukhara, eagle hunting in Kyrgyzstan, carpet weaving in Turkmenistan). Travelers can browse, book, and pay securely. Hosts build verified profiles with reviews. Integrated with local payment methods and offers multi-language support (EN, RU, UZ, KG, TJ).",
    stage: "early_traction",
    industries: ["Marketplace", "E-commerce"],
    country_focus: ["UZ", "KG", "TJ", "TM"],
    looking_for_roles: ["technical", "design"],
    looking_for_description:
      "Need a technical co-founder to build the booking platform (calendar, payments, reviews) and a designer to create a beautiful, trust-building experience for international travelers.",
    upvotes: 31,
    views: 420,
  },
  {
    id: ideaUuid(5),
    author_id: uuid(17),
    title:
      "YukBor — Load-Matching Marketplace for Central Asian Trucking Routes",
    description:
      "A mobile-first marketplace that matches shippers with trucks that have empty space on return trips along Central Asian trade corridors. Like Uber Freight but designed for the realities of cross-border trucking in TJ-UZ-KZ.",
    problem:
      "Over 200,000 trucks operate on Central Asian trade routes, but 60% of return trips run empty. Shippers in Khujand, Osh, and Fergana Valley rely on phone calls and personal networks to find trucks. Drivers waste fuel and time. There is no digital platform for load matching in the region, and most drivers use basic Android phones with limited data.",
    solution:
      "A lightweight mobile app (under 10MB, works on 3G) where drivers list available truck space and shippers post loads. GPS-based matching suggests optimal routes. Offline mode lets drivers accept loads even without connectivity, syncing when back online. Payment escrow protects both parties. Available in Tajik, Uzbek, and Russian.",
    stage: "have_idea",
    industries: ["Logistics", "Marketplace"],
    country_focus: ["TJ", "UZ", "KZ"],
    looking_for_roles: ["technical"],
    looking_for_description:
      "Need a mobile developer who can build a lightweight Android app with offline support, GPS tracking, and basic payment integration. Experience with low-bandwidth optimization is critical.",
    upvotes: 15,
    views: 198,
  },
];

const acceleratorMembers: SeedAcceleratorMember[] = [
  // Astana Hub
  { accelerator_id: accelUuid(1), user_id: uuid(1), cohort: "Batch 2023", role: "founder" },
  { accelerator_id: accelUuid(1), user_id: uuid(2), cohort: "Batch 2024", role: "founder" },
  { accelerator_id: accelUuid(1), user_id: uuid(3), cohort: "Batch 2023", role: "founder" },
  { accelerator_id: accelUuid(1), user_id: uuid(4), cohort: "Batch 2024", role: "founder" },
  { accelerator_id: accelUuid(1), user_id: uuid(5), cohort: "Batch 2024", role: "founder" },
  // IT Park Uzbekistan
  { accelerator_id: accelUuid(2), user_id: uuid(6), cohort: "Resident 2023", role: "founder" },
  { accelerator_id: accelUuid(2), user_id: uuid(7), cohort: "Resident 2024", role: "founder" },
  { accelerator_id: accelUuid(2), user_id: uuid(8), cohort: "Resident 2023", role: "founder" },
  { accelerator_id: accelUuid(2), user_id: uuid(9), cohort: "Resident 2024", role: "founder" },
  { accelerator_id: accelUuid(2), user_id: uuid(10), cohort: "Resident 2024", role: "founder" },
  // MOST Tech Hub
  { accelerator_id: accelUuid(3), user_id: uuid(11), cohort: "Cohort 5", role: "founder" },
  { accelerator_id: accelUuid(3), user_id: uuid(12), cohort: "Cohort 4", role: "founder" },
  { accelerator_id: accelUuid(3), user_id: uuid(13), cohort: "Cohort 5", role: "founder" },
  { accelerator_id: accelUuid(3), user_id: uuid(14), cohort: "Cohort 4", role: "founder" },
  // UTECH
  { accelerator_id: accelUuid(4), user_id: uuid(15), cohort: "Cohort 1", role: "founder" },
  { accelerator_id: accelUuid(4), user_id: uuid(16), cohort: "Cohort 1", role: "founder" },
  { accelerator_id: accelUuid(4), user_id: uuid(17), cohort: "Cohort 2", role: "founder" },
];

// ---------------------------------------------------------------------------
// SQL Generation
// ---------------------------------------------------------------------------

function generateSQL(): string {
  const lines: string[] = [];

  lines.push("-- =============================================================================");
  lines.push("-- Central Asian Co-Founder Platform — Generated Seed Data");
  lines.push(`-- Generated at: ${new Date().toISOString()}`);
  lines.push("-- =============================================================================");
  lines.push("");

  // --- Accelerators ---
  lines.push("-- 1. ACCELERATORS");
  lines.push("INSERT INTO public.accelerators (id, name, description, logo_url, website, country, city, is_active) VALUES");
  accelerators.forEach((a, i) => {
    const comma = i < accelerators.length - 1 ? "," : "";
    lines.push(
      `  ('${a.id}', ${sqlStr(a.name)}, ${sqlStr(a.description)}, NULL, ${sqlStr(a.website)}, ${sqlStr(a.country)}, ${sqlStr(a.city)}, true)${comma}`
    );
  });
  lines.push("ON CONFLICT (id) DO NOTHING;");
  lines.push("");

  // --- Profiles ---
  lines.push("-- 2. PROFILES");
  lines.push("INSERT INTO public.profiles (");
  lines.push("  id, full_name, avatar_url, headline, bio,");
  lines.push("  role, skills, industries,");
  lines.push("  country, city, languages,");
  lines.push("  commitment, idea_stage, equity_min, equity_max,");
  lines.push("  linkedin_url, telegram_handle,");
  lines.push("  looking_for_roles, looking_for_description,");
  lines.push("  education, experience, ecosystem_tags,");
  lines.push("  is_actively_looking, is_admin, profile_completeness, last_active");
  lines.push(") VALUES");

  profiles.forEach((p, i) => {
    const comma = i < profiles.length - 1 ? "," : "";
    lines.push(`(
  '${p.id}',
  ${sqlStr(p.full_name)}, NULL,
  ${sqlStr(p.headline)},
  ${sqlStr(p.bio)},
  ${sqlArray(p.role)},
  ${sqlArray(p.skills)},
  ${sqlArray(p.industries)},
  ${sqlStr(p.country)}, ${sqlStr(p.city)},
  ${sqlArray(p.languages)},
  ${sqlStr(p.commitment)}, ${sqlStr(p.idea_stage)}, ${p.equity_min}, ${p.equity_max},
  ${sqlStr(p.linkedin_url)}, ${sqlStr(p.telegram_handle)},
  ${sqlArray(p.looking_for_roles)},
  ${sqlStr(p.looking_for_description)},
  ${sqlJsonb(p.education)},
  ${sqlJsonb(p.experience)},
  ${sqlArray(p.ecosystem_tags)},
  ${p.is_actively_looking}, ${p.is_admin}, ${p.profile_completeness},
  now() - interval '${p.last_active_offset}'
)${comma}`);
  });

  lines.push("ON CONFLICT (id) DO UPDATE SET");
  lines.push("  full_name = EXCLUDED.full_name,");
  lines.push("  headline = EXCLUDED.headline,");
  lines.push("  bio = EXCLUDED.bio,");
  lines.push("  role = EXCLUDED.role,");
  lines.push("  skills = EXCLUDED.skills,");
  lines.push("  industries = EXCLUDED.industries,");
  lines.push("  country = EXCLUDED.country,");
  lines.push("  city = EXCLUDED.city,");
  lines.push("  languages = EXCLUDED.languages,");
  lines.push("  commitment = EXCLUDED.commitment,");
  lines.push("  idea_stage = EXCLUDED.idea_stage,");
  lines.push("  equity_min = EXCLUDED.equity_min,");
  lines.push("  equity_max = EXCLUDED.equity_max,");
  lines.push("  linkedin_url = EXCLUDED.linkedin_url,");
  lines.push("  telegram_handle = EXCLUDED.telegram_handle,");
  lines.push("  looking_for_roles = EXCLUDED.looking_for_roles,");
  lines.push("  looking_for_description = EXCLUDED.looking_for_description,");
  lines.push("  education = EXCLUDED.education,");
  lines.push("  experience = EXCLUDED.experience,");
  lines.push("  ecosystem_tags = EXCLUDED.ecosystem_tags,");
  lines.push("  is_actively_looking = EXCLUDED.is_actively_looking,");
  lines.push("  profile_completeness = EXCLUDED.profile_completeness,");
  lines.push("  last_active = EXCLUDED.last_active,");
  lines.push("  updated_at = now();");
  lines.push("");

  // --- Ideas ---
  lines.push("-- 3. IDEAS");
  lines.push("INSERT INTO public.ideas (");
  lines.push("  id, author_id, title, description, problem, solution,");
  lines.push("  stage, industries, country_focus,");
  lines.push("  looking_for_roles, looking_for_description,");
  lines.push("  is_open, upvotes, views");
  lines.push(") VALUES");

  ideas.forEach((idea, i) => {
    const comma = i < ideas.length - 1 ? "," : "";
    lines.push(`(
  '${idea.id}', '${idea.author_id}',
  ${sqlStr(idea.title)},
  ${sqlStr(idea.description)},
  ${sqlStr(idea.problem)},
  ${sqlStr(idea.solution)},
  ${sqlStr(idea.stage)},
  ${sqlArray(idea.industries)},
  ${sqlArray(idea.country_focus)},
  ${sqlArray(idea.looking_for_roles)},
  ${sqlStr(idea.looking_for_description)},
  true, ${idea.upvotes}, ${idea.views}
)${comma}`);
  });

  lines.push("ON CONFLICT (id) DO UPDATE SET");
  lines.push("  title = EXCLUDED.title,");
  lines.push("  description = EXCLUDED.description,");
  lines.push("  problem = EXCLUDED.problem,");
  lines.push("  solution = EXCLUDED.solution,");
  lines.push("  stage = EXCLUDED.stage,");
  lines.push("  industries = EXCLUDED.industries,");
  lines.push("  country_focus = EXCLUDED.country_focus,");
  lines.push("  looking_for_roles = EXCLUDED.looking_for_roles,");
  lines.push("  looking_for_description = EXCLUDED.looking_for_description,");
  lines.push("  upvotes = EXCLUDED.upvotes,");
  lines.push("  views = EXCLUDED.views,");
  lines.push("  updated_at = now();");
  lines.push("");

  // --- Accelerator Members ---
  lines.push("-- 4. ACCELERATOR MEMBERSHIPS");
  lines.push("INSERT INTO public.accelerator_members (accelerator_id, user_id, cohort, role) VALUES");
  acceleratorMembers.forEach((m, i) => {
    const comma = i < acceleratorMembers.length - 1 ? "," : "";
    lines.push(
      `  ('${m.accelerator_id}', '${m.user_id}', ${sqlStr(m.cohort)}, ${sqlStr(m.role)})${comma}`
    );
  });
  lines.push("ON CONFLICT DO NOTHING;");
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(generateSQL());
