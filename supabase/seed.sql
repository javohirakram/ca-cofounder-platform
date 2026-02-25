-- =============================================================================
-- Central Asian Co-Founder Platform — Seed Data
-- =============================================================================
--
-- IMPORTANT: This file seeds the database with realistic test data.
--
-- PREREQUISITE: Since profiles.id references auth.users, you must either:
--   1. Create 20 test users through the app / Supabase Auth dashboard FIRST,
--      then replace the UUIDs below with the real ones, OR
--   2. Temporarily disable the FK constraint, insert, then re-enable it
--      (see the toggle block at the bottom of this file), OR
--   3. Use the Supabase Dashboard SQL Editor with the service_role key
--      and insert directly into auth.users first (see companion script).
--
-- The hardcoded UUIDs below follow a readable pattern so you can easily
-- map them: 00000000-0000-0000-0000-000000000001 .. 000000000020
--
-- HOW TO RUN:
--   Option A — Supabase Dashboard > SQL Editor > paste & run
--   Option B — supabase db reset (if wired into supabase/seed.sql config)
--   Option C — psql -f supabase/seed.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. (Optional) Insert stub auth.users so the FK on profiles.id is satisfied.
--    This uses the Supabase internal auth schema. Only works when executed
--    with the postgres/service_role. Skip if you created users via the UI.
-- ---------------------------------------------------------------------------

-- Uncomment the block below if you need to create auth stubs:

/*
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'aibek.nurlan@test.com',       crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aibek Nurlanuly"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'dana.suleimen@test.com',       crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dana Suleimenova"}',       'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'timur.kasym@test.com',         crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Timur Kasymov"}',          'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'madina.abenova@test.com',      crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Madina Abenova"}',         'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'yerbol.saken@test.com',        crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Yerbol Sakenov"}',         'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'sardor.abdullaev@test.com',    crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sardor Abdullaev"}',       'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'nodira.karimova@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nodira Karimova"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'jasur.toshmatov@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jasur Toshmatov"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'dilnoza.rakhimova@test.com',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dilnoza Rakhimova"}',      'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'sherzod.mirzaev@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sherzod Mirzaev"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'aizada.turgunova@test.com',    crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aizada Turgunova"}',       'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'bakyt.asanov@test.com',        crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bakyt Asanov"}',           'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'nuraiym.ibraimova@test.com',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nuraiym Ibraimova"}',      'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000000', 'azamat.toktogulov@test.com',   crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Azamat Toktogulov"}',      'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000000', 'firdavs.rahimov@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Firdavs Rahimov"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000000', 'sitora.nazarova@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sitora Nazarova"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000000', 'komron.sharipov@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Komron Sharipov"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000000', 'merdan.orazov@test.com',       crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Merdan Orazov"}',          'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000000', 'aylar.berdiyeva@test.com',     crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aylar Berdiyeva"}',        'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000000', 'dovlet.annayev@test.com',      crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dovlet Annayev"}',         'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Also insert into auth.identities (required by Supabase Auth)
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
SELECT id, id, id, 'email', jsonb_build_object('sub', id::text, 'email', email), now(), now(), now()
FROM auth.users
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000020'
)
ON CONFLICT DO NOTHING;
*/


-- =============================================================================
-- 1. ACCELERATORS (no auth dependency)
-- =============================================================================

INSERT INTO public.accelerators (id, name, description, logo_url, website, country, city, is_active)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Astana Hub',
    'Kazakhstan''s international technology park and startup hub. Provides tax benefits, co-working spaces, acceleration programs, and a bridge to global markets for tech startups across Central Asia.',
    NULL,
    'https://astanahub.com',
    'KZ',
    'Astana',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'IT Park Uzbekistan',
    'Uzbekistan''s flagship IT and startup ecosystem hub based in Tashkent. Offers resident status with tax incentives, mentorship programs, co-working spaces, and access to government digitization contracts.',
    NULL,
    'https://it-park.uz',
    'UZ',
    'Tashkent',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'MOST Tech Hub',
    'Kyrgyzstan''s leading technology and innovation hub in Bishkek. Runs acceleration programs, hosts community events, and connects local startups to regional and international investors.',
    NULL,
    'https://most.kg',
    'KG',
    'Bishkek',
    true
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'UTECH',
    'Tajikistan''s emerging startup accelerator based in Dushanbe. Focused on building local tech talent, running bootcamps, and supporting early-stage founders with mentorship and seed funding.',
    NULL,
    'https://utech.tj',
    'TJ',
    'Dushanbe',
    true
  )
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 2. PROFILES (20 founders)
-- =============================================================================
-- NOTE: These reference auth.users via profiles.id. Either:
--   - Uncomment the auth.users block above, OR
--   - Create users through the app and update UUIDs, OR
--   - Temporarily drop the FK (see end of file)
--
-- Country codes match the app form: KZ, UZ, KG, TJ, TM
-- Roles: technical, business, design, product, operations
-- Commitments: full_time, part_time, exploring
-- Idea stages: no_idea, have_idea, concept, prototype, side_project, early_traction
-- =============================================================================

INSERT INTO public.profiles (
  id, full_name, avatar_url, headline, bio,
  role, skills, industries,
  country, city, languages,
  commitment, idea_stage, equity_min, equity_max,
  linkedin_url, telegram_handle,
  looking_for_roles, looking_for_description,
  education, experience, ecosystem_tags,
  is_actively_looking, is_admin, profile_completeness, last_active
)
VALUES

-- ===================== KAZAKHSTAN (5) =====================

-- KZ-1: Almaty — Technical founder
(
  '00000000-0000-0000-0000-000000000001',
  'Aibek Nurlanuly',
  NULL,
  'Ex-Kaspi engineer building B2B payments infrastructure for Central Asian SMEs',
  'Full-stack engineer with 5 years at Kaspi.kz, where I led the merchant payments integration team. Now I''m building a cross-border B2B payment rail for SMEs trading between KZ, UZ, and KG. Looking for a business co-founder who understands trade finance.',
  ARRAY['technical'],
  ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS', 'Fintech APIs', 'System Design'],
  ARRAY['Fintech', 'SaaS'],
  'KZ', 'Almaty',
  ARRAY['English', 'Russian', 'Kazakh'],
  'full_time', 'prototype', 10, 30,
  'https://linkedin.com/in/aibek-nurlanuly',
  '@aibek_dev',
  ARRAY['business', 'operations'],
  'Looking for a business-savvy co-founder who understands cross-border trade and can handle BD, compliance, and partnerships with banks in KZ/UZ.',
  '[{"institution":"Nazarbayev University","degree":"BSc Computer Science","year":"2018"}]'::jsonb,
  '[{"company":"Kaspi.kz","role":"Senior Software Engineer","years":"2018-2023"},{"company":"Self-employed","role":"Founder","years":"2023-present"}]'::jsonb,
  ARRAY['Astana Hub'],
  true, false, 90,
  now() - interval '2 hours'
),

-- KZ-2: Almaty — Business founder
(
  '00000000-0000-0000-0000-000000000002',
  'Dana Suleimenova',
  NULL,
  'Ex-McKinsey consultant | Building the Shopify for Central Asian bazaar merchants',
  'After 3 years at McKinsey advising retail and FMCG clients across CIS, I''m now obsessed with digitizing the bazaar economy. Over 70% of retail in CA is still cash-based and offline. I''m building tools that let bazaar sellers go online without needing tech skills.',
  ARRAY['business'],
  ARRAY['Strategy', 'Financial Modeling', 'Market Research', 'Growth', 'Fundraising'],
  ARRAY['E-commerce', 'Marketplace'],
  'KZ', 'Almaty',
  ARRAY['English', 'Russian', 'Kazakh'],
  'full_time', 'concept', 15, 40,
  'https://linkedin.com/in/dana-suleimenova',
  '@dana_biz',
  ARRAY['technical', 'design'],
  'Need a technical co-founder who can build a mobile-first e-commerce platform with offline-first capabilities. Design skills a huge plus.',
  '[{"institution":"KIMEP University","degree":"BBA Finance","year":"2017"},{"institution":"London Business School","degree":"MBA","year":"2022"}]'::jsonb,
  '[{"company":"McKinsey & Company","role":"Associate","years":"2019-2022"},{"company":"Chocofamily","role":"Head of Strategy","years":"2022-2024"}]'::jsonb,
  ARRAY['Astana Hub', 'Google for Startups'],
  true, false, 85,
  now() - interval '5 hours'
),

-- KZ-3: Almaty — Technical + Product founder
(
  '00000000-0000-0000-0000-000000000003',
  'Timur Kasymov',
  NULL,
  'ML Engineer from Kolesa Group | Building AI-powered logistics optimization for CA',
  'Spent 4 years at Kolesa Group building recommendation engines and search ranking algorithms. Now applying ML to solve last-mile delivery inefficiencies across Central Asia where 40% of goods are delayed due to poor route planning.',
  ARRAY['technical', 'product'],
  ARRAY['Python', 'Machine Learning', 'TensorFlow', 'Go', 'Kubernetes', 'Data Engineering'],
  ARRAY['Logistics', 'AI/ML'],
  'KZ', 'Almaty',
  ARRAY['English', 'Russian', 'Kazakh'],
  'full_time', 'side_project', 20, 45,
  'https://linkedin.com/in/timur-kasymov',
  '@timur_ml',
  ARRAY['business', 'operations'],
  'Seeking a co-founder with logistics industry experience — ideally someone who has managed fleet operations or worked with freight forwarders in the region.',
  '[{"institution":"KBTU","degree":"BSc Applied Mathematics","year":"2017"},{"institution":"Coursera / Stanford","degree":"ML Specialization","year":"2019"}]'::jsonb,
  '[{"company":"Kolesa Group","role":"Senior ML Engineer","years":"2018-2023"},{"company":"Independent","role":"Founder","years":"2023-present"}]'::jsonb,
  ARRAY['Astana Hub', 'NURIS'],
  true, false, 92,
  now() - interval '1 hour'
),

-- KZ-4: Astana — Business + Operations founder
(
  '00000000-0000-0000-0000-000000000004',
  'Madina Abenova',
  NULL,
  'AIFC fintech lead | Connecting Central Asian startups with Islamic finance',
  'Led fintech regulatory sandbox initiatives at AIFC for 2 years. Deep expertise in Islamic finance, regulatory compliance, and cross-border financial products. Building a shariah-compliant crowdfunding platform for SMEs.',
  ARRAY['business', 'operations'],
  ARRAY['Regulatory Compliance', 'Islamic Finance', 'Product Strategy', 'Partnerships', 'Legal'],
  ARRAY['Fintech'],
  'KZ', 'Astana',
  ARRAY['English', 'Russian', 'Kazakh'],
  'part_time', 'have_idea', 10, 25,
  'https://linkedin.com/in/madina-abenova',
  '@madina_fintech',
  ARRAY['technical'],
  'Looking for a backend/fintech engineer who can build secure payment processing and investor dashboards. Experience with KYC/AML systems is preferred.',
  '[{"institution":"Nazarbayev University","degree":"BSc Economics","year":"2019"},{"institution":"CFA Institute","degree":"CFA Level II","year":"2022"}]'::jsonb,
  '[{"company":"AIFC","role":"Fintech Regulation Lead","years":"2021-2023"},{"company":"Halyk Bank","role":"Digital Products Analyst","years":"2019-2021"}]'::jsonb,
  ARRAY['Astana Hub'],
  true, false, 80,
  now() - interval '12 hours'
),

-- KZ-5: Astana — Design + Product founder
(
  '00000000-0000-0000-0000-000000000005',
  'Yerbol Sakenov',
  NULL,
  'UX lead at DAR Ecosystem | Designing healthtech for underserved rural communities',
  'Lead product designer at DAR with a passion for accessible design. Worked on 3 apps serving millions of Kazakh users. Now building a telemedicine platform that connects rural patients with city doctors via low-bandwidth video.',
  ARRAY['design', 'product'],
  ARRAY['UI/UX Design', 'Figma', 'User Research', 'Product Management', 'Mobile Design'],
  ARRAY['Healthtech'],
  'KZ', 'Astana',
  ARRAY['English', 'Russian', 'Kazakh'],
  'part_time', 'concept', 15, 35,
  'https://linkedin.com/in/yerbol-sakenov',
  '@yerbol_ux',
  ARRAY['technical'],
  'Need a mobile developer (React Native or Flutter) with experience building video/WebRTC features. Bonus if you understand healthcare compliance.',
  '[{"institution":"Suleyman Demirel University","degree":"BSc Information Systems","year":"2018"}]'::jsonb,
  '[{"company":"DAR Ecosystem","role":"Lead Product Designer","years":"2020-present"},{"company":"Beeline Kazakhstan","role":"UI Designer","years":"2018-2020"}]'::jsonb,
  ARRAY['Astana Hub', 'Google for Startups'],
  true, false, 85,
  now() - interval '3 hours'
),

-- ===================== UZBEKISTAN (5) =====================

-- UZ-1: Tashkent — Technical founder
(
  '00000000-0000-0000-0000-000000000006',
  'Sardor Abdullaev',
  NULL,
  'Full-stack dev from IT Park | Building edtech for rural school students',
  'Software engineer and IT Park Uzbekistan resident. Built internal tools at Payme that processed millions of transactions. Now creating an adaptive learning platform to bridge the education gap between Tashkent and rural Uzbekistan.',
  ARRAY['technical'],
  ARRAY['React', 'TypeScript', 'Python', 'Django', 'PostgreSQL', 'Docker'],
  ARRAY['Edtech'],
  'UZ', 'Tashkent',
  ARRAY['English', 'Russian', 'Uzbek'],
  'full_time', 'prototype', 15, 40,
  'https://linkedin.com/in/sardor-abdullaev',
  '@sardor_coder',
  ARRAY['business', 'product'],
  'Need a co-founder who can handle partnerships with the Ministry of Education and navigate school procurement. Product thinking is a must.',
  '[{"institution":"Inha University in Tashkent","degree":"BSc Computer Science","year":"2020"}]'::jsonb,
  '[{"company":"Payme","role":"Software Engineer","years":"2020-2023"},{"company":"Self-employed","role":"Founder","years":"2023-present"}]'::jsonb,
  ARRAY['IT Park Uzbekistan'],
  true, false, 88,
  now() - interval '30 minutes'
),

-- UZ-2: Tashkent — Business founder
(
  '00000000-0000-0000-0000-000000000007',
  'Nodira Karimova',
  NULL,
  'Ex-Uzum marketplace ops lead | Solving agritech supply chain for Fergana Valley farmers',
  'Managed marketplace operations at Uzum handling 10K+ daily orders. Grew up in Fergana and saw firsthand how farmers lose 30-40% of produce to middlemen and poor cold chain. Building a farm-to-table marketplace with integrated logistics.',
  ARRAY['business', 'operations'],
  ARRAY['Operations', 'Supply Chain', 'Marketplace Ops', 'Growth Hacking', 'P&L Management'],
  ARRAY['Agritech', 'Marketplace'],
  'UZ', 'Tashkent',
  ARRAY['English', 'Russian', 'Uzbek'],
  'full_time', 'have_idea', 20, 45,
  'https://linkedin.com/in/nodira-karimova',
  '@nodira_ops',
  ARRAY['technical'],
  'Looking for a technical co-founder who can build a logistics-integrated marketplace. Experience with real-time tracking, route optimization, or cold chain monitoring is ideal.',
  '[{"institution":"Westminster International University in Tashkent","degree":"BBA Business Administration","year":"2019"}]'::jsonb,
  '[{"company":"Uzum","role":"Operations Lead","years":"2021-2024"},{"company":"Express24","role":"Operations Manager","years":"2019-2021"}]'::jsonb,
  ARRAY['IT Park Uzbekistan'],
  true, false, 82,
  now() - interval '6 hours'
),

-- UZ-3: Tashkent — Technical founder
(
  '00000000-0000-0000-0000-000000000008',
  'Jasur Toshmatov',
  NULL,
  'Backend engineer at EPAM | Building open-source Uzbek NLP tools and a Chatbot platform',
  'Senior backend engineer at EPAM Systems, focused on enterprise integrations. On the side, I''ve been building Uzbek-language NLP models and a chatbot platform that lets businesses deploy customer support bots in Uzbek and Russian.',
  ARRAY['technical'],
  ARRAY['Java', 'Spring Boot', 'NLP', 'Python', 'Microservices', 'Elasticsearch'],
  ARRAY['AI/ML', 'SaaS'],
  'UZ', 'Tashkent',
  ARRAY['English', 'Russian', 'Uzbek'],
  'part_time', 'side_project', 10, 30,
  'https://linkedin.com/in/jasur-toshmatov',
  '@jasur_nlp',
  ARRAY['business', 'product'],
  'Seeking a co-founder who can sell to enterprises — banks, telecoms, government agencies in UZ. Need someone who can close B2B deals and build partnerships.',
  '[{"institution":"Tashkent University of Information Technologies","degree":"BSc Software Engineering","year":"2018"}]'::jsonb,
  '[{"company":"EPAM Systems","role":"Senior Software Engineer","years":"2019-present"},{"company":"UzCard","role":"Junior Developer","years":"2018-2019"}]'::jsonb,
  ARRAY['IT Park Uzbekistan'],
  true, false, 78,
  now() - interval '1 day'
),

-- UZ-4: Samarkand — Business + Product founder
(
  '00000000-0000-0000-0000-000000000009',
  'Dilnoza Rakhimova',
  NULL,
  'Tourism tech entrepreneur | Digitizing Silk Road tourism experiences',
  'Born and raised in Samarkand, I''ve been working in tourism for 6 years. Built a tour operator business from scratch serving 2000+ tourists annually. Now creating a platform to connect independent local guides with travelers and offer bookable cultural experiences.',
  ARRAY['business', 'product'],
  ARRAY['Product Strategy', 'Tourism', 'Marketing', 'Community Building', 'Content Strategy'],
  ARRAY['Marketplace', 'E-commerce'],
  'UZ', 'Samarkand',
  ARRAY['English', 'Russian', 'Uzbek'],
  'full_time', 'early_traction', 15, 35,
  'https://linkedin.com/in/dilnoza-rakhimova',
  '@dilnoza_travel',
  ARRAY['technical', 'design'],
  'Need a technical co-founder to build a booking and payments platform. Ideally someone who has worked on marketplace products with reviews, scheduling, and payment escrow.',
  '[{"institution":"Samarkand State University","degree":"BA Tourism Management","year":"2017"}]'::jsonb,
  '[{"company":"Silk Road Adventures (own company)","role":"Founder & CEO","years":"2018-present"}]'::jsonb,
  ARRAY['IT Park Uzbekistan'],
  true, false, 88,
  now() - interval '4 hours'
),

-- UZ-5: Samarkand — Technical founder
(
  '00000000-0000-0000-0000-000000000010',
  'Sherzod Mirzaev',
  NULL,
  'Mobile dev building offline-first fintech for unbanked populations in rural Uzbekistan',
  'Self-taught mobile developer from Samarkand. Built 3 apps with 50K+ combined downloads. Passionate about financial inclusion — currently prototyping a USSD + mobile app that lets people without smartphones access basic banking services.',
  ARRAY['technical'],
  ARRAY['Flutter', 'Dart', 'Firebase', 'USSD', 'Kotlin', 'Offline-first Architecture'],
  ARRAY['Fintech'],
  'UZ', 'Samarkand',
  ARRAY['Russian', 'Uzbek'],
  'full_time', 'prototype', 20, 50,
  NULL,
  '@sherzod_mobile',
  ARRAY['business'],
  'Looking for a co-founder who understands microfinance regulations in Uzbekistan and can build relationships with banks and MFIs for API integrations.',
  '[{"institution":"Self-taught","degree":"Mobile Development","year":"2019"}]'::jsonb,
  '[{"company":"Freelance","role":"Mobile Developer","years":"2019-2022"},{"company":"Click.uz","role":"Mobile Developer","years":"2022-2024"}]'::jsonb,
  ARRAY['IT Park Uzbekistan'],
  true, false, 75,
  now() - interval '8 hours'
),

-- ===================== KYRGYZSTAN (4) =====================

-- KG-1: Bishkek — Business founder
(
  '00000000-0000-0000-0000-000000000011',
  'Aizada Turgunova',
  NULL,
  'Climate tech advocate | Building carbon credit marketplace for Central Asian enterprises',
  'Environmental policy researcher turned entrepreneur. Spent 3 years at UNDP Kyrgyzstan working on climate adaptation projects. Now building a platform where CA companies can measure, report, and offset their carbon footprint through verified local projects.',
  ARRAY['business'],
  ARRAY['Climate Policy', 'ESG', 'Fundraising', 'Stakeholder Management', 'Impact Measurement'],
  ARRAY['Cleantech'],
  'KG', 'Bishkek',
  ARRAY['English', 'Russian', 'Kyrgyz'],
  'full_time', 'concept', 15, 40,
  'https://linkedin.com/in/aizada-turgunova',
  '@aizada_climate',
  ARRAY['technical'],
  'Need a full-stack developer who can build a marketplace with verification workflows, data dashboards, and payment processing. Blockchain/smart contract experience would be amazing.',
  '[{"institution":"American University of Central Asia","degree":"BA Economics","year":"2018"},{"institution":"University of Cambridge","degree":"MPhil Environmental Policy","year":"2020"}]'::jsonb,
  '[{"company":"UNDP Kyrgyzstan","role":"Climate Policy Analyst","years":"2020-2023"}]'::jsonb,
  ARRAY['MOST'],
  true, false, 82,
  now() - interval '3 hours'
),

-- KG-2: Bishkek — Technical founder
(
  '00000000-0000-0000-0000-000000000012',
  'Bakyt Asanov',
  NULL,
  'DevOps engineer | Building cloud infrastructure platform tailored for Central Asian startups',
  'Spent 5 years doing DevOps at various Bishkek agencies and remote contracts. Central Asian startups waste time and money on misconfigured cloud setups. Building a managed platform that simplifies deployment for teams without dedicated DevOps.',
  ARRAY['technical'],
  ARRAY['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Go'],
  ARRAY['SaaS'],
  'KG', 'Bishkek',
  ARRAY['English', 'Russian', 'Kyrgyz'],
  'part_time', 'side_project', 20, 50,
  'https://linkedin.com/in/bakyt-asanov',
  '@bakyt_devops',
  ARRAY['business', 'product'],
  'Seeking a co-founder who can handle sales, marketing, and customer success. Need someone who speaks the language of CTOs and can sell developer tools in the region.',
  '[{"institution":"Kyrgyz-Turkish Manas University","degree":"BSc Computer Engineering","year":"2017"}]'::jsonb,
  '[{"company":"Various (Remote Contracts)","role":"DevOps Engineer","years":"2017-2022"},{"company":"Namba","role":"Senior DevOps","years":"2022-present"}]'::jsonb,
  ARRAY['MOST'],
  true, false, 78,
  now() - interval '16 hours'
),

-- KG-3: Bishkek — Product + Design founder
(
  '00000000-0000-0000-0000-000000000013',
  'Nuraiym Ibraimova',
  NULL,
  'Product designer from O! Telecom | Building HR-tech platform for Central Asian remote workers',
  'Product designer with 4 years of experience in telecom and fintech. Central Asia has a huge remote workforce, but no HR platform handles local tax compliance, payments in local currencies, and cultural context. That''s what I''m building.',
  ARRAY['design', 'product'],
  ARRAY['Product Design', 'Figma', 'User Research', 'Prototyping', 'Design Systems', 'UX Writing'],
  ARRAY['SaaS', 'Marketplace'],
  'KG', 'Bishkek',
  ARRAY['English', 'Russian', 'Kyrgyz'],
  'full_time', 'have_idea', 15, 35,
  'https://linkedin.com/in/nuraiym-ibraimova',
  '@nuraiym_design',
  ARRAY['technical', 'business'],
  'Looking for both a technical co-founder (backend/payments) and a business co-founder who understands HR compliance across KZ, UZ, KG. One or two people who cover both would be perfect.',
  '[{"institution":"American University of Central Asia","degree":"BSc Software Engineering","year":"2019"}]'::jsonb,
  '[{"company":"O! Telecom","role":"Product Designer","years":"2019-2022"},{"company":"MBank","role":"Senior Product Designer","years":"2022-present"}]'::jsonb,
  ARRAY['MOST', 'Google for Startups'],
  true, false, 80,
  now() - interval '7 hours'
),

-- KG-4: Osh — Technical + Operations founder
(
  '00000000-0000-0000-0000-000000000014',
  'Azamat Toktogulov',
  NULL,
  'Hardware + IoT engineer | Building smart water management systems for Kyrgyz agriculture',
  'Electrical engineer from Osh who built IoT sensor networks for a USAID water management project. Kyrgyzstan wastes 40% of irrigation water due to outdated infrastructure. Building affordable smart irrigation controllers with solar-powered sensors.',
  ARRAY['technical', 'operations'],
  ARRAY['IoT', 'Embedded Systems', 'C++', 'Solar Energy', 'Hardware Prototyping', 'Arduino'],
  ARRAY['Agritech', 'Cleantech'],
  'KG', 'Osh',
  ARRAY['Russian', 'Kyrgyz', 'Uzbek'],
  'full_time', 'prototype', 25, 50,
  NULL,
  '@azamat_iot',
  ARRAY['business'],
  'Need a co-founder who can handle government tenders, NGO partnerships, and farmer cooperatives. Understanding of agricultural subsidies and water rights in KG is essential.',
  '[{"institution":"Osh Technological University","degree":"BSc Electrical Engineering","year":"2016"}]'::jsonb,
  '[{"company":"USAID Water Project","role":"IoT Engineer","years":"2017-2020"},{"company":"Freelance","role":"IoT Consultant","years":"2020-present"}]'::jsonb,
  ARRAY['MOST'],
  true, false, 75,
  now() - interval '2 days'
),

-- ===================== TAJIKISTAN (3) =====================

-- TJ-1: Dushanbe — Business founder
(
  '00000000-0000-0000-0000-000000000015',
  'Firdavs Rahimov',
  NULL,
  'Ex-Tcell product manager | Building remittance-linked savings product for Tajik migrants',
  'Former PM at Tcell (Tajikistan''s largest telecom). Tajikistan receives $2.5B+ in remittances annually — almost 30% of GDP — but most of it is spent immediately. Building a micro-savings product that automatically saves a percentage of each remittance.',
  ARRAY['business', 'product'],
  ARRAY['Product Management', 'Mobile Money', 'Growth Strategy', 'Telecoms', 'Partnerships'],
  ARRAY['Fintech'],
  'TJ', 'Dushanbe',
  ARRAY['English', 'Russian', 'Tajik'],
  'full_time', 'concept', 15, 40,
  'https://linkedin.com/in/firdavs-rahimov',
  '@firdavs_pm',
  ARRAY['technical'],
  'Need a mobile/backend engineer who can build integrations with remittance providers (Western Union, Zolotaya Korona) and mobile money platforms. Security expertise is critical.',
  '[{"institution":"Russian-Tajik (Slavonic) University","degree":"BSc Economics","year":"2017"},{"institution":"University of Central Asia","degree":"MBA","year":"2021"}]'::jsonb,
  '[{"company":"Tcell","role":"Senior Product Manager","years":"2019-2024"},{"company":"Megafon Tajikistan","role":"Product Analyst","years":"2017-2019"}]'::jsonb,
  ARRAY['UTECH'],
  true, false, 82,
  now() - interval '5 hours'
),

-- TJ-2: Dushanbe — Technical founder
(
  '00000000-0000-0000-0000-000000000016',
  'Sitora Nazarova',
  NULL,
  'Full-stack developer building Tajik language learning app for diaspora children',
  'Software developer who grew up in Dushanbe and studied in Russia. Noticed that children of Tajik migrants abroad are losing connection to their language. Building a gamified Tajik language app with speech recognition and cultural stories.',
  ARRAY['technical'],
  ARRAY['React Native', 'Node.js', 'MongoDB', 'Speech Recognition', 'Gamification', 'TypeScript'],
  ARRAY['Edtech'],
  'TJ', 'Dushanbe',
  ARRAY['English', 'Russian', 'Tajik'],
  'part_time', 'side_project', 20, 50,
  'https://linkedin.com/in/sitora-nazarova',
  '@sitora_dev',
  ARRAY['business', 'design'],
  'Looking for a co-founder who can handle marketing to the Tajik diaspora (Russia, Kazakhstan, Turkey) and someone with illustration/animation skills for the learning content.',
  '[{"institution":"Moscow State University","degree":"BSc Computer Science","year":"2020"}]'::jsonb,
  '[{"company":"Yandex","role":"Junior Developer","years":"2020-2021"},{"company":"Remote (Freelance)","role":"Full-stack Developer","years":"2021-present"}]'::jsonb,
  ARRAY['UTECH'],
  true, false, 78,
  now() - interval '1 day'
),

-- TJ-3: Khujand — Business + Operations founder
(
  '00000000-0000-0000-0000-000000000017',
  'Komron Sharipov',
  NULL,
  'Logistics operations manager | Building cross-border trucking marketplace for TJ-KZ-UZ corridor',
  'Managed logistics operations for one of Khujand''s largest bazaar wholesale businesses. Trucks between Tajikistan, Uzbekistan, and Kazakhstan run 60% empty on return trips. Building a load-matching marketplace to fill those trucks.',
  ARRAY['business', 'operations'],
  ARRAY['Logistics', 'Fleet Management', 'Negotiation', 'Cross-border Trade', 'Operations'],
  ARRAY['Logistics', 'Marketplace'],
  'TJ', 'Khujand',
  ARRAY['Russian', 'Tajik', 'Uzbek'],
  'full_time', 'have_idea', 25, 50,
  NULL,
  '@komron_logistics',
  ARRAY['technical'],
  'Need a developer who can build a mobile app for truck drivers (many use low-end Android phones) and a web dashboard for dispatchers. GPS tracking and offline support are must-haves.',
  '[{"institution":"Khujand State University","degree":"BA Economics","year":"2015"}]'::jsonb,
  '[{"company":"Family Business (Wholesale)","role":"Logistics Manager","years":"2015-2022"},{"company":"Self-employed","role":"Logistics Consultant","years":"2022-present"}]'::jsonb,
  ARRAY['UTECH'],
  true, false, 70,
  now() - interval '3 days'
),

-- ===================== TURKMENISTAN (3) =====================

-- TM-1: Ashgabat — Technical founder
(
  '00000000-0000-0000-0000-000000000018',
  'Merdan Orazov',
  NULL,
  'Backend engineer | Building encrypted communication tools for Central Asian businesses',
  'Software engineer focused on security and privacy. Built internal communication tools for a Turkmen government agency. Now working on an end-to-end encrypted business messaging platform with compliance features designed for CA regulatory environments.',
  ARRAY['technical'],
  ARRAY['Go', 'Cryptography', 'Distributed Systems', 'gRPC', 'PostgreSQL', 'Security'],
  ARRAY['SaaS'],
  'TM', 'Ashgabat',
  ARRAY['English', 'Russian', 'Turkmen'],
  'part_time', 'concept', 20, 50,
  NULL,
  '@merdan_sec',
  ARRAY['business'],
  'Looking for a business co-founder who can navigate enterprise sales in Central Asia. Need someone who understands government procurement and has connections in KZ/UZ corporate world.',
  '[{"institution":"Turkmen State University","degree":"BSc Mathematics","year":"2018"},{"institution":"Coursera / Georgia Tech","degree":"Cybersecurity Certificate","year":"2021"}]'::jsonb,
  '[{"company":"Government Agency (Turkmenistan)","role":"Software Developer","years":"2018-2021"},{"company":"Remote (EU clients)","role":"Backend Developer","years":"2021-present"}]'::jsonb,
  ARRAY[]::text[],
  true, false, 72,
  now() - interval '2 days'
),

-- TM-2: Ashgabat — Business + Product founder
(
  '00000000-0000-0000-0000-000000000019',
  'Aylar Berdiyeva',
  NULL,
  'Digital marketing specialist | Building e-commerce enablement platform for Turkmen artisans',
  'Started doing social media marketing for local businesses in Ashgabat and discovered that Turkmen artisans (carpet weavers, jewelers, silk producers) have incredible products but zero access to international markets. Building a platform to bridge that gap.',
  ARRAY['business', 'product'],
  ARRAY['Digital Marketing', 'E-commerce', 'Social Media', 'Content Creation', 'Brand Strategy'],
  ARRAY['E-commerce', 'Marketplace'],
  'TM', 'Ashgabat',
  ARRAY['English', 'Russian', 'Turkmen'],
  'full_time', 'have_idea', 15, 40,
  'https://linkedin.com/in/aylar-berdiyeva',
  '@aylar_ecom',
  ARRAY['technical', 'design'],
  'Need a technical co-founder to build an international marketplace with multi-currency payments, shipping calculator, and artisan profiles. A designer co-founder would also be welcome.',
  '[{"institution":"International University of Humanities and Development","degree":"BA International Relations","year":"2020"}]'::jsonb,
  '[{"company":"Freelance","role":"Digital Marketing Consultant","years":"2020-present"}]'::jsonb,
  ARRAY[]::text[],
  true, false, 68,
  now() - interval '4 days'
),

-- TM-3: Mary — Technical founder
(
  '00000000-0000-0000-0000-000000000020',
  'Dovlet Annayev',
  NULL,
  'Oil & gas engineer turned developer | Building energy sector digitization tools',
  'Worked for 3 years as a petroleum engineer at Turkmengas before teaching myself programming. The energy sector in CA runs on spreadsheets and paper. Building SaaS tools for well monitoring, production reporting, and equipment maintenance tracking.',
  ARRAY['technical', 'operations'],
  ARRAY['Python', 'React', 'IoT', 'Data Visualization', 'PostgreSQL', 'Industrial Automation'],
  ARRAY['SaaS', 'Cleantech'],
  'TM', 'Mary',
  ARRAY['Russian', 'Turkmen'],
  'full_time', 'prototype', 25, 50,
  NULL,
  '@dovlet_energy',
  ARRAY['business'],
  'Looking for a co-founder who knows how to sell to oil and gas companies in KZ and TM. Need someone who can handle enterprise sales cycles and government relations.',
  '[{"institution":"International Oil and Gas University (Turkmenistan)","degree":"BSc Petroleum Engineering","year":"2018"}]'::jsonb,
  '[{"company":"Turkmengas","role":"Petroleum Engineer","years":"2018-2021"},{"company":"Self-taught","role":"Software Developer","years":"2021-present"}]'::jsonb,
  ARRAY[]::text[],
  true, false, 70,
  now() - interval '5 days'
)

ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  headline = EXCLUDED.headline,
  bio = EXCLUDED.bio,
  role = EXCLUDED.role,
  skills = EXCLUDED.skills,
  industries = EXCLUDED.industries,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  languages = EXCLUDED.languages,
  commitment = EXCLUDED.commitment,
  idea_stage = EXCLUDED.idea_stage,
  equity_min = EXCLUDED.equity_min,
  equity_max = EXCLUDED.equity_max,
  linkedin_url = EXCLUDED.linkedin_url,
  telegram_handle = EXCLUDED.telegram_handle,
  looking_for_roles = EXCLUDED.looking_for_roles,
  looking_for_description = EXCLUDED.looking_for_description,
  education = EXCLUDED.education,
  experience = EXCLUDED.experience,
  ecosystem_tags = EXCLUDED.ecosystem_tags,
  is_actively_looking = EXCLUDED.is_actively_looking,
  profile_completeness = EXCLUDED.profile_completeness,
  last_active = EXCLUDED.last_active,
  updated_at = now();


-- =============================================================================
-- 3. STARTUP IDEAS (5 ideas from various founders)
-- =============================================================================

INSERT INTO public.ideas (
  id, author_id, title, description, problem, solution,
  stage, industries, country_focus,
  looking_for_roles, looking_for_description,
  is_open, upvotes, views
)
VALUES

-- Idea 1: Cross-border B2B payments (by Aibek, KZ)
(
  'i0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'PayBridge CA — Cross-border B2B Payment Rails for Central Asian SMEs',
  'A unified payment infrastructure that lets SMEs in Kazakhstan, Uzbekistan, and Kyrgyzstan send and receive B2B payments across borders in minutes instead of days, with transparent FX rates and full compliance.',
  'SMEs trading across Central Asian borders face 3-5 day settlement times, opaque FX markups of 3-5%, and a mountain of compliance paperwork. Most resort to carrying cash across borders, which is risky and unscalable. Existing SWIFT-based solutions are designed for large corporations and charge prohibitive fees for small transactions.',
  'A digital payment platform with direct integrations to local payment systems (Kaspi, Payme, Mbank) that enables same-day cross-border settlements. We use local bank partnerships in each country to avoid SWIFT entirely, cutting costs by 80%. Built-in KYC/AML compliance automates the paperwork that currently takes days.',
  'prototype',
  ARRAY['Fintech', 'SaaS'],
  ARRAY['KZ', 'UZ', 'KG'],
  ARRAY['business', 'operations'],
  'Looking for a co-founder with banking/compliance experience who can manage relationships with partner banks and navigate multi-country financial regulations.',
  true, 12, 145
),

-- Idea 2: Adaptive learning for rural schools (by Sardor, UZ)
(
  'i0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000006',
  'DarsX — Adaptive Learning Platform for Underserved Schools in Uzbekistan',
  'An AI-powered adaptive learning platform that works offline on low-cost tablets, personalized for each student''s pace and aligned with the Uzbek national curriculum. Designed for schools with limited internet and no IT staff.',
  'Rural Uzbekistan has 6 million school-age children, but teacher shortages mean 1 teacher per 40+ students. Internet penetration outside cities is below 30%, and existing edtech platforms require constant connectivity. Students in rural areas score 35% lower on national tests than their Tashkent peers.',
  'An offline-first tablet app that uses lightweight ML models to adapt lesson difficulty in real-time. Content is pre-loaded and syncs when connectivity is available. Teachers get dashboards showing each student''s progress. The platform is aligned with Uzbekistan''s national curriculum and available in Uzbek, Russian, and Karakalpak.',
  'prototype',
  ARRAY['Edtech', 'AI/ML'],
  ARRAY['UZ'],
  ARRAY['business', 'product'],
  'Need a co-founder who can handle Ministry of Education relationships, school procurement cycles, and grant/impact funding applications.',
  true, 24, 310
),

-- Idea 3: Carbon credit marketplace (by Aizada, KG)
(
  'i0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000011',
  'CarbonCA — Carbon Credit Marketplace for Central Asian Enterprises',
  'A verified carbon credit marketplace where Central Asian companies can measure their emissions, purchase offsets from local environmental projects (reforestation, clean energy, methane capture), and generate ESG reports for international partners.',
  'Central Asian companies increasingly need ESG compliance to work with international partners, but there is no regional carbon marketplace. Existing global platforms (Verra, Gold Standard) have zero local projects. Companies have no way to offset locally, and environmental projects in CA struggle to monetize their impact.',
  'A three-sided marketplace connecting (1) companies needing offsets, (2) local environmental projects generating credits, and (3) verifiers who validate the credits. Built-in emissions calculator using regional industry benchmarks. Smart contracts ensure transparent credit retirement. ESG report generator for international compliance.',
  'concept',
  ARRAY['Cleantech', 'Marketplace'],
  ARRAY['KZ', 'KG', 'UZ'],
  ARRAY['technical'],
  'Looking for a full-stack developer who can build the marketplace, verification workflows, and carbon accounting engine. Blockchain experience is a plus.',
  true, 8, 89
),

-- Idea 4: Silk Road experience marketplace (by Dilnoza, UZ)
(
  'i0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000009',
  'SilkStay — Bookable Cultural Experiences Along the Silk Road',
  'An Airbnb Experiences-style platform focused exclusively on the Silk Road corridor (Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan). Local guides, artisans, and families offer authentic cultural experiences that travelers can discover and book instantly.',
  'Central Asia welcomed 12 million tourists in 2023, growing 40% YoY, but most bookings still happen through opaque travel agencies or WhatsApp groups. Independent travelers struggle to find authentic local experiences, and local guides have no way to build reputation or get discovered online. 90% of tourism revenue goes to intermediaries.',
  'A curated marketplace where local hosts list experiences (pottery workshops in Bukhara, eagle hunting in Kyrgyzstan, carpet weaving in Turkmenistan). Travelers can browse, book, and pay securely. Hosts build verified profiles with reviews. Integrated with local payment methods and offers multi-language support (EN, RU, UZ, KG, TJ).',
  'early_traction',
  ARRAY['Marketplace', 'E-commerce'],
  ARRAY['UZ', 'KG', 'TJ', 'TM'],
  ARRAY['technical', 'design'],
  'Need a technical co-founder to build the booking platform (calendar, payments, reviews) and a designer to create a beautiful, trust-building experience for international travelers.',
  true, 31, 420
),

-- Idea 5: Load-matching for Central Asian trucking (by Komron, TJ)
(
  'i0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000017',
  'YukBor — Load-Matching Marketplace for Central Asian Trucking Routes',
  'A mobile-first marketplace that matches shippers with trucks that have empty space on return trips along Central Asian trade corridors. Like Uber Freight but designed for the realities of cross-border trucking in TJ-UZ-KZ.',
  'Over 200,000 trucks operate on Central Asian trade routes, but 60% of return trips run empty. Shippers in Khujand, Osh, and Fergana Valley rely on phone calls and personal networks to find trucks. Drivers waste fuel and time. There is no digital platform for load matching in the region, and most drivers use basic Android phones with limited data.',
  'A lightweight mobile app (under 10MB, works on 3G) where drivers list available truck space and shippers post loads. GPS-based matching suggests optimal routes. Offline mode lets drivers accept loads even without connectivity, syncing when back online. Payment escrow protects both parties. Available in Tajik, Uzbek, and Russian.',
  'have_idea',
  ARRAY['Logistics', 'Marketplace'],
  ARRAY['TJ', 'UZ', 'KZ'],
  ARRAY['technical'],
  'Need a mobile developer who can build a lightweight Android app with offline support, GPS tracking, and basic payment integration. Experience with low-bandwidth optimization is critical.',
  true, 15, 198
)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  problem = EXCLUDED.problem,
  solution = EXCLUDED.solution,
  stage = EXCLUDED.stage,
  industries = EXCLUDED.industries,
  country_focus = EXCLUDED.country_focus,
  looking_for_roles = EXCLUDED.looking_for_roles,
  looking_for_description = EXCLUDED.looking_for_description,
  is_open = EXCLUDED.is_open,
  upvotes = EXCLUDED.upvotes,
  views = EXCLUDED.views,
  updated_at = now();


-- =============================================================================
-- 4. ACCELERATOR MEMBERSHIPS (link some founders to accelerators)
-- =============================================================================

INSERT INTO public.accelerator_members (accelerator_id, user_id, cohort, role)
VALUES
  -- Astana Hub members
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Batch 2023', 'founder'),
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Batch 2024', 'founder'),
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Batch 2023', 'founder'),
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Batch 2024', 'founder'),
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Batch 2024', 'founder'),

  -- IT Park Uzbekistan members
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Resident 2023', 'founder'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'Resident 2024', 'founder'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 'Resident 2023', 'founder'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', 'Resident 2024', 'founder'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'Resident 2024', 'founder'),

  -- MOST Tech Hub members
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', 'Cohort 5', 'founder'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'Cohort 4', 'founder'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', 'Cohort 5', 'founder'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000014', 'Cohort 4', 'founder'),

  -- UTECH members
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000015', 'Cohort 1', 'founder'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000016', 'Cohort 1', 'founder'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000017', 'Cohort 2', 'founder')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 5. VERIFY
-- =============================================================================

-- Quick count check (run after seeding to verify)
-- SELECT 'accelerators' AS tbl, count(*) FROM public.accelerators
-- UNION ALL SELECT 'profiles', count(*) FROM public.profiles
-- UNION ALL SELECT 'ideas', count(*) FROM public.ideas
-- UNION ALL SELECT 'accelerator_members', count(*) FROM public.accelerator_members;


-- =============================================================================
-- APPENDIX: Emergency FK disable/re-enable (use only if you cannot create
-- auth.users first and want to force-insert profiles with hardcoded UUIDs)
-- =============================================================================

-- To DISABLE the FK temporarily:
-- ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
--
-- ... run the profile inserts above ...
--
-- To RE-ENABLE the FK:
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- WARNING: Re-enabling will FAIL if the profile IDs don't exist in auth.users.
-- Only use this approach for local development.
