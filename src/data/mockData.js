export const DEMO_USER = {
  id: 1,
  email: 'ousman@gambiafund.gm',
  first_name: 'Ousman',
  last_name: 'Camara',
  full_name: 'Ousman Camara',
  role: 'user',
  email_verified: true,
  phone: '+220 7612345',
  region: 'Banjul',
  bio: 'Community organizer and fundraising advocate from Banjul.',
  avatar: null,
  is_verified: true,
  created_at: '2026-01-15T10:00:00Z',
}

export const MOCK_CATEGORIES = [
  { id: 1, slug: 'medical', name: 'Medical', icon: '🏥', color: 'bg-red-100 text-red-700', count: 45 },
  { id: 2, slug: 'education', name: 'Education', icon: '📚', color: 'bg-blue-100 text-blue-700', count: 38 },
  { id: 3, slug: 'business', name: 'Business', icon: '💼', color: 'bg-amber-100 text-amber-700', count: 22 },
  { id: 4, slug: 'religious', name: 'Religious', icon: '🕌', color: 'bg-purple-100 text-purple-700', count: 17 },
  { id: 5, slug: 'community', name: 'Community', icon: '🤝', color: 'bg-green-100 text-green-700', count: 31 },
  { id: 6, slug: 'disaster', name: 'Disaster Relief', icon: '⛑️', color: 'bg-orange-100 text-orange-700', count: 8 },
  { id: 7, slug: 'sports', name: 'Sports', icon: '⚽', color: 'bg-cyan-100 text-cyan-700', count: 12 },
  { id: 8, slug: 'memorial', name: 'Memorial', icon: '🕯️', color: 'bg-gray-100 text-gray-700', count: 6 },
  { id: 9, slug: 'charity', name: 'Charity', icon: '❤️', color: 'bg-pink-100 text-pink-700', count: 14 },
  { id: 10, slug: 'other', name: 'Other', icon: '✨', color: 'bg-slate-100 text-slate-700', count: 9 },
]

export const MOCK_CAMPAIGNS = [
  {
    id: 1,
    slug: 'help-fatou-get-kidney-surgery',
    title: 'Help Fatou Get Kidney Surgery',
    short_description: 'Fatou Jallow, 34, urgently needs kidney surgery at RVTH. She is a mother of two and cannot afford the full cost of treatment.',
    story: `Fatou Jallow is a 34-year-old mother of two young children living in Banjul. Three months ago, she was diagnosed with chronic kidney disease requiring immediate surgery at the Royal Victoria Teaching Hospital (RVTH).

Without this surgery, Fatou's condition will continue to deteriorate. Her husband works as a groundnut farmer and the family's income is not enough to cover the medical costs.

The total cost of the surgery and post-operative care is D 150,000. We are asking for your support to help Fatou get the medical treatment she desperately needs.

Any amount helps. Please share this campaign with your network. Together, we can give Fatou a second chance at life with her family.`,
    category: 'Medical',
    category_slug: 'medical',
    gradient: 'from-red-400 to-rose-600',
    goal: 150000,
    raised: 112500,
    donors_count: 187,
    currency: 'GMD',
    region: 'Banjul',
    beneficiary: 'Fatou Jallow',
    beneficiary_relationship: 'Self',
    deadline: '2026-07-15',
    status: 'active',
    is_urgent: true,
    is_featured: true,
    owner: { id: 1, name: 'Omar Jallow', avatar: null },
    updates: [
      { id: 1, title: 'Surgery scheduled!', content: 'Great news! The hospital has confirmed a surgery date for July 8th. Thank you all for your incredible support.', date: '2026-06-01' },
      { id: 2, title: 'Update from the doctors', content: 'The medical team has reviewed Fatou\'s case. They are optimistic about the outcome of the surgery.', date: '2026-05-20' },
    ],
    created_at: '2026-04-28',
  },
  {
    id: 2,
    slug: 'brikama-school-building-project',
    title: 'Build a New Classroom Block in Brikama',
    short_description: 'Over 400 students at Brikama Primary School are learning in overcrowded classrooms. Help us build 6 new classrooms.',
    story: `Brikama Primary School serves over 400 students in the West Coast Region, but its aging infrastructure can no longer accommodate the growing student population.

Students are sharing textbooks, sitting on the floor, and classes are being held in shifts because there isn't enough space. During the rainy season, the situation becomes dangerous as the old roof leaks.

We are raising funds to construct 6 new classrooms, install desks and chairs, and repair the existing roof. The total project cost is D 500,000.

This project is supported by the local school committee, parents association, and the regional education office.`,
    category: 'Education',
    category_slug: 'education',
    gradient: 'from-blue-400 to-indigo-600',
    goal: 500000,
    raised: 342000,
    donors_count: 412,
    currency: 'GMD',
    region: 'Brikama',
    beneficiary: 'Brikama Primary School',
    beneficiary_relationship: 'Community Institution',
    deadline: '2026-09-01',
    status: 'active',
    is_urgent: false,
    is_featured: true,
    owner: { id: 2, name: 'Salimatou Njie', avatar: null },
    updates: [
      { id: 3, title: 'Foundation work started!', content: 'The construction team has broken ground. Foundation work is now underway thanks to your generous donations.', date: '2026-05-15' },
    ],
    created_at: '2026-03-10',
  },
  {
    id: 3,
    slug: 'flood-relief-basse-2026',
    title: 'Flood Relief Fund — Basse 2026',
    short_description: 'Flash floods in Basse Santa Su have displaced over 2,000 families. Help us provide emergency food, shelter and clean water.',
    story: `On May 12th, 2026, severe flash floods devastated Basse Santa Su in the Upper River Region. Over 2,000 families were displaced overnight, losing their homes, livestock, and food supplies.

The immediate needs are:
- Emergency shelter tents
- Clean drinking water
- Food packages for displaced families
- Medical supplies for injuries and waterborne disease prevention

Our team is on the ground coordinating relief efforts with local authorities. Every donation goes directly toward emergency supplies for affected families.

Please give generously and share this campaign widely. Lives depend on it.`,
    category: 'Disaster Relief',
    category_slug: 'disaster',
    gradient: 'from-orange-400 to-red-600',
    goal: 1000000,
    raised: 834000,
    donors_count: 1243,
    currency: 'GMD',
    region: 'Basse',
    beneficiary: 'Flood Victims — Basse Santa Su',
    beneficiary_relationship: 'Community',
    deadline: '2026-06-30',
    status: 'active',
    is_urgent: true,
    is_featured: true,
    owner: { id: 3, name: 'Isatou Ceesay', avatar: null },
    updates: [],
    created_at: '2026-05-13',
  },
  {
    id: 4,
    slug: 'bakau-mosque-renovation',
    title: 'Renovate the Bakau Central Mosque',
    short_description: 'The Bakau Central Mosque, built in 1972, needs urgent renovation. Help restore this important place of worship for the entire community.',
    story: `The Bakau Central Mosque has been serving the Muslim community of Bakau for over 50 years. However, decades of use have left the mosque in need of significant repairs.

The renovation project includes:
- Roof repair and waterproofing
- New wudu (ablution) facilities
- Electrical wiring and lighting
- Flooring restoration
- New sound system

The renovation work will be carried out by local Gambian contractors. All funds are overseen by the mosque management committee.`,
    category: 'Religious',
    category_slug: 'religious',
    gradient: 'from-purple-400 to-violet-600',
    goal: 300000,
    raised: 278000,
    donors_count: 389,
    currency: 'GMD',
    region: 'Bakau',
    beneficiary: 'Bakau Central Mosque',
    beneficiary_relationship: 'Religious Institution',
    deadline: '2026-08-20',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 4, name: 'Alhagie Bojang', avatar: null },
    updates: [],
    created_at: '2026-02-14',
  },
  {
    id: 5,
    slug: 'farafenni-clean-water-project',
    title: 'Clean Water for Farafenni North Ward',
    short_description: 'Residents of Farafenni North Ward walk 3km daily for clean water. Help us install a community borehole and water distribution system.',
    story: `Over 800 families in Farafenni North Ward have no access to clean piped water. Women and children walk up to 3 kilometers daily to fetch water from a shared well that often dries up in the dry season.

This campaign will fund the installation of a deep borehole with a solar-powered pump and a distribution system connecting 15 community standpipes.

The project is partnered with the North Bank Region Water Authority and will be maintained by a democratically elected community water committee.

Clean water changes everything — health, school attendance, women's time, and community prosperity.`,
    category: 'Community',
    category_slug: 'community',
    gradient: 'from-teal-400 to-cyan-600',
    goal: 450000,
    raised: 198000,
    donors_count: 276,
    currency: 'GMD',
    region: 'Farafenni',
    beneficiary: 'Farafenni North Ward Community',
    beneficiary_relationship: 'Community',
    deadline: '2026-10-30',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 5, name: 'Mariama Sanyang', avatar: null },
    updates: [],
    created_at: '2026-04-01',
  },
  {
    id: 6,
    slug: 'baby-modou-heart-surgery',
    title: 'Baby Modou Needs Heart Surgery',
    short_description: 'Modou is only 8 months old and was born with a congenital heart defect. His family needs help to fund life-saving surgery in Senegal.',
    story: `Baby Modou Drammeh was born with a congenital ventricular septal defect (VSD) — a hole in the heart. Without surgery, doctors say he will not survive past two years.

The surgery can be performed at Hôpital Principal in Dakar, Senegal, but the total cost including transport, surgery, and recovery care is D 250,000.

Modou's father is a primary school teacher and his mother stays home to care for him. They simply cannot afford this cost on their own.

Please help give baby Modou a chance to live, grow up, and thrive. Share this campaign with everyone you know.`,
    category: 'Medical',
    category_slug: 'medical',
    gradient: 'from-rose-400 to-pink-600',
    goal: 250000,
    raised: 156000,
    donors_count: 298,
    currency: 'GMD',
    region: 'Kanifing',
    beneficiary: 'Modou Drammeh',
    beneficiary_relationship: 'Son',
    deadline: '2026-07-01',
    status: 'active',
    is_urgent: true,
    is_featured: false,
    owner: { id: 6, name: 'Lamine Drammeh', avatar: null },
    updates: [],
    created_at: '2026-05-05',
  },
  {
    id: 7,
    slug: 'girls-scholarship-fund-gambia',
    title: 'Girls Scholarship Fund 2026',
    short_description: 'Provide full secondary school scholarships to 20 talented girls from rural Gambia whose families cannot afford school fees.',
    story: `Despite recent progress, many talented girls in rural Gambia are forced to drop out of secondary school because their families cannot afford the fees, uniforms, and supplies.

This scholarship fund will cover one full academic year for 20 girls from the North Bank, Upper River, and Central River Regions — including school fees, uniforms, books, and a monthly transport stipend.

Scholars are selected based on academic performance and financial need, in partnership with regional education offices and community leaders.

Education is the most powerful investment we can make in The Gambia's future.`,
    category: 'Education',
    category_slug: 'education',
    gradient: 'from-sky-400 to-blue-600',
    goal: 600000,
    raised: 425000,
    donors_count: 534,
    currency: 'GMD',
    region: 'Banjul',
    beneficiary: '20 Rural Girls',
    beneficiary_relationship: 'Scholarship Recipients',
    deadline: '2026-08-15',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 7, name: 'Ndey Joof', avatar: null },
    updates: [],
    created_at: '2026-03-20',
  },
  {
    id: 8,
    slug: 'gambia-u17-football-afcon',
    title: 'Scorpions U17 — Road to AFCON',
    short_description: 'Help The Gambia U17 national football team travel to and compete at the Africa U17 Cup of Nations in Abidjan.',
    story: `The Gambia U17 national football team has qualified for the Africa U17 Cup of Nations (AFCON) in Côte d'Ivoire — a remarkable achievement for our small nation!

However, the Gambia Football Federation needs additional funds to cover travel, accommodation, training camp, and equipment for the squad.

Let's rally behind our Scorpions! Every donation brings these young players one step closer to representing The Gambia on the continental stage.

🦂 Once a Scorpion, always a Scorpion! 🇬🇲`,
    category: 'Sports',
    category_slug: 'sports',
    gradient: 'from-cyan-400 to-blue-600',
    goal: 150000,
    raised: 89000,
    donors_count: 1567,
    currency: 'GMD',
    region: 'Banjul',
    beneficiary: 'Gambia Football Federation',
    beneficiary_relationship: 'National Sports Body',
    deadline: '2026-07-30',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 8, name: 'GFF Media Team', avatar: null },
    updates: [],
    created_at: '2026-04-15',
  },
  {
    id: 9,
    slug: 'solar-panels-jinack-village-school',
    title: 'Solar Panels for Jinack Village School',
    short_description: 'Jinack Island school has no electricity. Solar panels will allow evening study classes for 250 students and power computers.',
    story: `Jinack Island is a remote community accessible only by boat. The village school serves 250 students, but without electricity, children cannot study after dark and the school cannot run computer classes.

Installing a solar panel system will:
- Provide reliable electricity for classrooms and the library
- Enable computer-based learning for the first time
- Allow evening study sessions during exam periods
- Power the water pump and cooling fans

The system will be installed by a certified Gambian solar technician and maintained by trained community members.`,
    category: 'Community',
    category_slug: 'community',
    gradient: 'from-yellow-400 to-amber-600',
    goal: 350000,
    raised: 290000,
    donors_count: 342,
    currency: 'GMD',
    region: 'Kerewan',
    beneficiary: 'Jinack Village School',
    beneficiary_relationship: 'Community School',
    deadline: '2026-09-15',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 9, name: 'Baboucarr Sowe', avatar: null },
    updates: [],
    created_at: '2026-03-30',
  },
  {
    id: 10,
    slug: 'kanifing-market-expansion',
    title: 'Expand Kanifing Women\'s Market',
    short_description: 'Help 50 women entrepreneurs in Kanifing expand their market stalls and access microfinance to grow their small businesses.',
    story: `The Kanifing Women's Market Cooperative has been empowering female entrepreneurs since 2018. With 50 active members selling produce, textiles, and crafts, the cooperative has outgrown its current space.

This campaign will fund:
- Construction of 15 new market stalls
- Purchase of cold storage equipment for perishable goods
- A revolving microfinance fund accessible to all members
- Business skills training workshop

All project management and accounting is handled transparently by the cooperative's elected board.`,
    category: 'Business',
    category_slug: 'business',
    gradient: 'from-amber-400 to-orange-600',
    goal: 200000,
    raised: 67000,
    donors_count: 89,
    currency: 'GMD',
    region: 'Kanifing',
    beneficiary: 'Kanifing Women\'s Cooperative',
    beneficiary_relationship: 'Community Organization',
    deadline: '2026-11-30',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 10, name: 'Fatou Touray', avatar: null },
    updates: [],
    created_at: '2026-05-01',
  },
  {
    id: 11,
    slug: 'memorial-late-omar-saho',
    title: 'Memorial Garden for Late Omar Saho',
    short_description: 'Create a memorial garden and scholarship in memory of beloved teacher and community leader Omar Saho, who passed away in April 2026.',
    story: `Omar Saho dedicated 30 years of his life to teaching at Banjul Senior Secondary School. He was beloved by thousands of students, a mentor, and a community pillar.

In his memory, his family and former students wish to:
- Create a memorial garden at the school bearing his name
- Establish an annual scholarship for a deserving student in his name
- Commission a small plaque in his honor in the school library

Omar always said: "Education is the candle that lights the darkness." Let's keep that candle burning.`,
    category: 'Memorial',
    category_slug: 'memorial',
    gradient: 'from-slate-400 to-gray-600',
    goal: 100000,
    raised: 87500,
    donors_count: 412,
    currency: 'GMD',
    region: 'Banjul',
    beneficiary: 'Saho Family',
    beneficiary_relationship: 'Family',
    deadline: '2026-08-01',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 11, name: 'Amie Saho', avatar: null },
    updates: [],
    created_at: '2026-04-20',
  },
  {
    id: 12,
    slug: 'gambia-tech-hub-banjul',
    title: 'Launch Gambia\'s First Free Coding Bootcamp',
    short_description: 'Train 100 young Gambians in software development, data science and digital skills — completely free. Help build the next generation of African tech talent.',
    story: `The Gambia has incredible young talent, but limited access to quality tech education. We are launching a 6-month intensive coding bootcamp in Banjul for 100 young Gambians aged 18-28.

The curriculum covers:
- Web development (React, Django)
- Mobile development
- Data science and AI basics
- Digital entrepreneurship and freelancing

Graduates will receive placement support, mentorship from Gambian tech professionals abroad, and access to our startup incubator.

The course is completely free for students. All they need is the determination to learn.`,
    category: 'Business',
    category_slug: 'business',
    gradient: 'from-violet-400 to-purple-600',
    goal: 800000,
    raised: 312000,
    donors_count: 234,
    currency: 'GMD',
    region: 'Banjul',
    beneficiary: '100 Young Gambians',
    beneficiary_relationship: 'Students',
    deadline: '2026-10-01',
    status: 'active',
    is_urgent: false,
    is_featured: false,
    owner: { id: 1, name: 'Ousman Camara', avatar: null },
    updates: [],
    created_at: '2026-04-10',
  },
]

export const MOCK_RECENT_DONATIONS = [
  { id: 1, donor: 'Aminata K.', amount: 500, message: 'Praying for your recovery, Fatou!', anonymous: false, date: '2026-06-05T09:12:00Z', campaign_id: 1 },
  { id: 2, donor: 'Anonymous', amount: 2500, message: '', anonymous: true, date: '2026-06-05T08:45:00Z', campaign_id: 1 },
  { id: 3, donor: 'Lamine B.', amount: 1000, message: 'Stay strong! From the diaspora with love.', anonymous: false, date: '2026-06-04T22:30:00Z', campaign_id: 1 },
  { id: 4, donor: 'Kaddy S.', amount: 250, message: 'Small contribution but big prayers.', anonymous: false, date: '2026-06-04T17:15:00Z', campaign_id: 1 },
  { id: 5, donor: 'Ousman D.', amount: 5000, message: 'A donation from our family in Sweden.', anonymous: false, date: '2026-06-04T14:00:00Z', campaign_id: 1 },
  { id: 6, donor: 'Anonymous', amount: 100, message: '', anonymous: true, date: '2026-06-04T11:22:00Z', campaign_id: 1 },
  { id: 7, donor: 'Fatou J.', amount: 750, message: 'We see you. Keep fighting!', anonymous: false, date: '2026-06-03T19:45:00Z', campaign_id: 1 },
  { id: 8, donor: 'Momodou C.', amount: 300, message: '', anonymous: false, date: '2026-06-03T15:30:00Z', campaign_id: 1 },
]

export const PLATFORM_STATS = {
  total_raised: 12540000,
  total_campaigns: 247,
  total_donors: 8945,
  success_rate: 78,
  countries_reached: 34,
}

export const MY_DASHBOARD_CAMPAIGNS = [
  { ...MOCK_CAMPAIGNS[0], raised: 112500, goal: 150000, donors_count: 187 },
  { ...MOCK_CAMPAIGNS[11], raised: 312000, goal: 800000, donors_count: 234 },
]

export const MY_DASHBOARD_STATS = {
  total_raised: 424500,
  active_campaigns: 2,
  total_donors: 421,
  campaign_views: 8934,
}

export const MY_RECENT_DONATIONS = [
  { id: 1, donor: 'Aminata K.', amount: 500, campaign: 'Help Fatou Get Kidney Surgery', date: '2026-06-05T09:12:00Z' },
  { id: 2, donor: 'Anonymous', amount: 2500, campaign: 'Help Fatou Get Kidney Surgery', date: '2026-06-05T08:45:00Z' },
  { id: 3, donor: 'Lamine B.', amount: 1000, campaign: 'Help Fatou Get Kidney Surgery', date: '2026-06-04T22:30:00Z' },
  { id: 4, donor: 'Modou T.', amount: 5000, campaign: 'Launch Gambia\'s First Free Coding Bootcamp', date: '2026-06-04T18:00:00Z' },
  { id: 5, donor: 'Kaddy S.', amount: 250, campaign: 'Help Fatou Get Kidney Surgery', date: '2026-06-04T17:15:00Z' },
  { id: 6, donor: 'Anonymous', amount: 10000, campaign: 'Launch Gambia\'s First Free Coding Bootcamp', date: '2026-06-03T12:00:00Z' },
]

// Per-campaign donor lists (keyed by campaign id)
export const CAMPAIGN_DONORS = {
  1: [
    { id: 1, donor: 'Aminata K.', amount: 500, message: 'Praying for your recovery, Fatou!', anonymous: false, date: '2026-06-05T09:12:00Z' },
    { id: 2, donor: 'Anonymous', amount: 2500, message: '', anonymous: true, date: '2026-06-05T08:45:00Z' },
    { id: 3, donor: 'Lamine B.', amount: 1000, message: 'Stay strong! From the diaspora with love.', anonymous: false, date: '2026-06-04T22:30:00Z' },
    { id: 4, donor: 'Kaddy S.', amount: 250, message: 'Small contribution but big prayers.', anonymous: false, date: '2026-06-04T17:15:00Z' },
    { id: 5, donor: 'Ousman D.', amount: 5000, message: 'A donation from our family in Sweden.', anonymous: false, date: '2026-06-04T14:00:00Z' },
    { id: 6, donor: 'Anonymous', amount: 100, message: '', anonymous: true, date: '2026-06-04T11:22:00Z' },
    { id: 7, donor: 'Fatou J.', amount: 750, message: 'We see you. Keep fighting!', anonymous: false, date: '2026-06-03T19:45:00Z' },
    { id: 8, donor: 'Momodou C.', amount: 300, message: '', anonymous: false, date: '2026-06-03T15:30:00Z' },
    { id: 9, donor: 'Isatou S.', amount: 1500, message: 'From our women\'s group in Serrekunda.', anonymous: false, date: '2026-06-02T10:00:00Z' },
    { id: 10, donor: 'Anonymous', amount: 5000, message: '', anonymous: true, date: '2026-06-01T08:30:00Z' },
    { id: 11, donor: 'Buba J.', amount: 200, message: 'Get well soon Fatou!', anonymous: false, date: '2026-05-31T16:00:00Z' },
    { id: 12, donor: 'Ndey F.', amount: 2000, message: 'Sending love from London.', anonymous: false, date: '2026-05-30T14:20:00Z' },
  ],
  12: [
    { id: 13, donor: 'Modou T.', amount: 5000, message: 'Investing in Gambia\'s future!', anonymous: false, date: '2026-06-04T18:00:00Z' },
    { id: 14, donor: 'Anonymous', amount: 10000, message: '', anonymous: true, date: '2026-06-03T12:00:00Z' },
    { id: 15, donor: 'Tech4Africa', amount: 50000, message: 'Supporting young African developers.', anonymous: false, date: '2026-06-02T09:00:00Z' },
    { id: 16, donor: 'Alieu N.', amount: 1000, message: 'I wish I had this when I was starting out.', anonymous: false, date: '2026-06-01T15:30:00Z' },
    { id: 17, donor: 'Mariama B.', amount: 2500, message: 'Train our girls in tech too!', anonymous: false, date: '2026-05-30T11:00:00Z' },
    { id: 18, donor: 'Anonymous', amount: 7500, message: '', anonymous: true, date: '2026-05-28T08:45:00Z' },
  ],
}

// Payout / withdrawal history (keyed by campaign id)
export const CAMPAIGN_PAYOUTS = {
  1: [
    { id: 1, amount: 50000, provider: 'ModemPay', phone: '+220 7612345', status: 'completed', requested_at: '2026-05-15T10:00:00Z', completed_at: '2026-05-15T10:45:00Z', reference: 'GF-PAY-20260515-001' },
    { id: 2, amount: 30000, provider: 'Wave', phone: '+220 7612345', status: 'completed', requested_at: '2026-05-28T14:00:00Z', completed_at: '2026-05-28T14:30:00Z', reference: 'GF-PAY-20260528-002' },
  ],
  12: [],
}

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
}
