import { credits, takeaways } from "./helpers.mjs";

export const people = [
  {
    slug: "shola-akinlade",
    name: "Shola Akinlade",
    role: "Co-founder & CEO",
    company: "Paystack",
    location: "Lagos, Nigeria",
    bio: "Shola Akinlade co-founded Paystack with Ezra Olubi to make it simple for African businesses to accept payments online. Paystack was acquired by Stripe in 2020.",
    website_url: "https://paystack.com",
  },
  {
    slug: "olugbenga-agboola",
    name: "Olugbenga Agboola",
    role: "Co-founder & CEO",
    company: "Flutterwave",
    location: "Lagos, Nigeria & San Francisco",
    bio: "Olugbenga \"GB\" Agboola co-founded Flutterwave in 2016 and has led it as CEO since 2018. Before that he built digital banking products, with reported roles at PayPal, Standard Bank and Access Bank.",
    website_url: "https://flutterwave.com",
  },
  {
    slug: "odunayo-eweniyi",
    name: "Odunayo Eweniyi",
    role: "Co-founder & COO",
    company: "PiggyVest",
    location: "Lagos, Nigeria",
    bio: "Odunayo Eweniyi is a computer engineer and co-founder of PiggyVest, one of Nigeria's largest savings and investment platforms. She is also a co-founder of the Feminist Coalition and the FirstCheck angel network.",
    website_url: "https://www.piggyvest.com",
  },
  {
    slug: "ham-serunjogi",
    name: "Ham Serunjogi",
    role: "Co-founder & CEO",
    company: "Chipper Cash",
    location: "Uganda & San Francisco",
    bio: "Ham Serunjogi grew up in Uganda, swam for his country at the 2010 Youth Olympic Games and studied economics at Grinnell College, where he met his Chipper Cash co-founder, Maijid Moujaled.",
    website_url: "https://www.chippercash.com",
  },
];

export const stories = [
  // ─── Paystack ─────────────────────────────────────────────────────────────
  {
    slug: "paystack-three-weeks-to-thirty-minutes",
    title: "Three weeks to thirty minutes: how Paystack rebuilt online payments in Nigeria",
    dek: "Shola Akinlade and Ezra Olubi didn't set out to build a fintech giant. They set out to fix the one thing standing between Nigerian businesses and the internet: getting paid.",
    series: "founder-files",
    guest: "shola-akinlade",
    tags: ["fintech", "payments", "nigeria", "y-combinator"],
    featured: true,
    daysAgo: 0,
    body: `<p>Picture a small business in Lagos at the end of the 2000s. It has customers, a website, maybe even a little buzz. What it doesn't have is a way to take money online. Payments arrive as bank transfers, logged by hand. Someone checks a statement, matches a name, sends a confirmation. Every sale is a small act of faith.</p>
<p>Shola Akinlade knew that world from the inside. He'd spent years writing software, first for himself and later for Nigerian banks, and he kept running into the same wall. Getting a business ready to accept payments online, he later told the IFC, took "a minimum of three weeks." For most merchants it took much longer, or never happened at all.</p>
<h2>The boy who wanted to lock the door and build</h2>
<p>The story usually starts with a computer. Akinlade got his first at 16, and it rearranged his priorities. "All I wanted to do was lock myself in my room and just make software," he recalled. He showed his projects at school exhibitions, and after university he and a friend released an open-source product before moving on to building systems for banks.</p>
<p>That detour matters. Building for banks taught him how money actually moves in Nigeria: the rails, the reconciliation, the paperwork, the places where things quietly break. When he and Ezra Olubi, a fellow software engineer who would become Paystack's CTO, sat down to build it, they weren't guessing at the problem. They had been living inside it.</p>
<blockquote>It would take a minimum of three weeks for a business to start accepting payments online.</blockquote>
<h2>Building for the merchant who can't code</h2>
<p>The obvious move would have been to copy what worked in San Francisco: clean developer APIs, beautiful documentation, a product for engineers. Paystack did build that. But the founders noticed something the global playbook missed. Most Nigerian businesses didn't have a developer at all.</p>
<p>So Paystack also built for them. Payment links that a shop owner could create and share without writing a single line of code. Support for the cards and channels Nigerians actually used. Onboarding measured in minutes rather than weeks. Akinlade's shorthand for this was simple: "local nuances" are key.</p>
<p>It sounds small. It wasn't. Every one of those decisions meant saying no to the easier path of building one product for everyone, and yes to understanding the person on the other side of the checkout.</p>
<h2>The first Nigerian company in Y Combinator</h2>
<p>In 2016, Paystack joined Y Combinator's Winter batch, the first Nigerian startup to do so. The stamp of approval helped open doors that had been politely closed. A $1.3 million seed round followed, with investors including Tencent and Comcast Ventures. Two years later, in 2018, Paystack raised an $8 million Series A led by a company that was paying very close attention: Stripe, joined by Visa and Tencent.</p>
<p>Meanwhile, the numbers kept compounding. By 2020, Paystack was serving more than 60,000 businesses in Nigeria and Ghana and processing over $150 million a month. Reporting at the time credited it with handling more than half of Nigeria's online payments.</p>
<hr>
<h2>The acquisition that changed the conversation</h2>
<p>In October 2020, Stripe announced it was acquiring Paystack, in a deal reported to be worth more than $200 million. For the Nigerian tech ecosystem it landed like a thunderclap. Here was proof, in a single headline, that a startup built in Lagos for African merchants could be worth that much to one of the most respected payments companies in the world.</p>
<p>Akinlade was clear that the company wasn't disappearing into a bigger machine. "Paystack will continue to operate independently," he wrote in the announcement, and the team kept pushing outward, expanding into South Africa in 2021.</p>
<p>The deeper legacy may be the one that doesn't show up on a cap table. A generation of Nigerian engineers watched two of their own build something world-class without leaving home, and started to believe they could too.</p>
${takeaways([
  "<strong>Your past job may be your unfair advantage.</strong> Years of building for banks gave the founders an inside view of exactly where payments broke.",
  "<strong>Design for the customer you actually have.</strong> Most merchants couldn't code, so Paystack built tools that didn't require it.",
  "<strong>Measure the pain in time.</strong> \"Three weeks to accept payments\" is a problem anyone can understand, and a promise anyone can test.",
])}
${credits("Shola Akinlade or Ezra Olubi", [
  ["IFC: \"The maker\" (2020), profile of Shola Akinlade", "https://www.ifc.org/en/stories/2020/the-maker"],
  ["Wikipedia: Paystack", "https://en.wikipedia.org/wiki/Paystack"],
  ["Paystack: Paystack x Stripe, the acquisition announcement", "https://paystack.com/stripe"],
  ["BNN Bloomberg: Stripe agrees to buy Nigeria startup Paystack for $200 million (October 15, 2020)", "https://www.bnnbloomberg.ca/stripe-agrees-to-buy-nigeria-startup-paystack-for-200-million-1.1508681"],
  ["HumAngle: Stripe buys Nigerian e-payment startup Paystack", "https://www.humanglemedia.com/stripe-buys-nigerian-e-payment-startup-paystack"],
])}`,
  },

  // ─── Flutterwave ──────────────────────────────────────────────────────────
  {
    slug: "flutterwave-building-the-rails",
    title: "Flutterwave and the business of building rails",
    dek: "Olugbenga Agboola spent years inside banks watching African payments stop at borders. Flutterwave was his bet that the plumbing, not the app, was where the real opportunity lived.",
    series: "founder-files",
    guest: "olugbenga-agboola",
    tags: ["fintech", "payments", "nigeria", "cross-border"],
    daysAgo: 2,
    body: `<p>Most people never think about payment infrastructure. That's the point of it. When it works, a customer in Nairobi pays a merchant in Lagos and nobody notices the dozen systems that had to agree for that to happen. When it doesn't, the money simply stops, usually at a border.</p>
<p>Olugbenga Agboola, known almost universally as GB, spent the years before Flutterwave on the inside of those systems. Born in Lagos and educated at the University of Westminster in the UK, he built a career in digital finance, with reported roles at PayPal and Google and product jobs at Standard Bank and Access Bank, where he ran digital innovation. It was a front-row seat to a strange fact: Africa had banks, mobile money, cards and customers, but very little that connected them to each other.</p>
<h2>A company built from a meeting at Andela</h2>
<p>In 2016, Agboola co-founded Flutterwave with Iyinoluwa Aboyeji, who had already helped launch Andela, the talent company. Reporting from the time describes Aboyeji meeting his co-founders while still at Andela. Aboyeji took the first CEO role; Agboola ran technology.</p>
<p>The idea was unglamorous and enormous: a single layer that let businesses accept and send payments across African countries and currencies, without negotiating with every bank and every mobile money provider separately. Not a consumer app first. Rails.</p>
<p>Flutterwave went through Y Combinator and, while it kept a presence in San Francisco, built its operational heart in Lagos, close to the problem it was solving.</p>
<h2>Taking the wheel</h2>
<p>In October 2018, Aboyeji stepped down as CEO and Agboola took over. It's a transition that sinks plenty of young companies. At Flutterwave it became the start of the steepest stretch of growth in its history.</p>
<p>When the pandemic hit in 2020 and small businesses lost their storefronts overnight, Flutterwave built a simple online store product and enrolled more than 20,000 businesses for free under a campaign it called "keeping the lights on." A year later it launched Send, an app for Africans abroad sending money home.</p>
<hr>
<h2>From startup to one of Africa's most valuable companies</h2>
<p>In March 2021, Flutterwave raised a $170 million Series C led by Avenir and Tiger Global, at the time the largest raise by an African tech startup, and crossed a $1 billion valuation. Less than a year later, in February 2022, a $250 million Series D pushed its valuation past $3 billion.</p>
<p>The years since haven't been a straight line, and it would be dishonest to pretend otherwise. In 2022 a Kenyan court froze accounts linked to the company during an investigation; the case was withdrawn in 2023 and the funds released. The company has faced difficult headlines and hard questions, as fast-growing companies handling other people's money usually do.</p>
<p>What has stayed constant is the slow, unfashionable work of licences. By August 2024, Ghana had become the 34th African country where Flutterwave held a licence. Each one represents months of regulatory conversations that never make the news, and each one makes the rails a little longer.</p>
${takeaways([
  "<strong>Infrastructure is invisible, and that's the moat.</strong> Owning the layer everyone else depends on is slower to build and much harder to copy.",
  "<strong>Founder transitions can work.</strong> Clear roles and a shared mission let Flutterwave change CEOs early without losing momentum.",
  "<strong>Licences are product.</strong> In regulated industries, every approval is a feature your customers can't get anywhere else.",
])}
${credits("Olugbenga Agboola", [
  ["Wikipedia: Flutterwave", "https://en.wikipedia.org/wiki/Flutterwave"],
  ["CNBC Disruptor 50 profile: Flutterwave", "https://www.cnbc.com/id/106873402"],
  ["Nairametrics: coverage of Flutterwave's funding and leadership", "https://nairametrics.com/?p=303647"],
  ["TechCabal: Iyinoluwa Aboyeji responds to allegations (April 2022)", "https://techcabal.com/2022/04/16/flutterwave-iyin-aboyeji-startup-ceo-accusation/"],
  ["U.S. Chamber of Commerce speaker biography: Olugbenga Agboola", "https://events.uschamber.com/USKenyaBusinessForum2024/speaker/1231967/olugbenga-agboola"],
])}`,
  },

  // ─── PiggyVest ────────────────────────────────────────────────────────────
  {
    slug: "piggyvest-a-kolo-on-the-internet",
    title: "PiggyVest: the kolo that went online",
    dek: "In late 2015, three young founders were shrinking their first startup from 25 people to six. A social media post about a clay piggy bank gave them their second act.",
    series: "founder-files",
    guest: "odunayo-eweniyi",
    tags: ["fintech", "savings", "nigeria", "bootstrapping"],
    daysAgo: 4,
    body: `<p>Almost every Nigerian knows a kolo. It's the clay or tin piggy bank you drop coins into and can't easily open, the household's first lesson in discipline. You can't spend what you can't reach.</p>
<p>In December 2015, the kolo wasn't on anyone's mind at PushCV. Odunayo Eweniyi, Somto Ifezue and Joshua Chibueze, friends from Covenant University, had launched the recruitment startup in 2013. Now money was tight, and they were doing the painful arithmetic every founder dreads, cutting the team from 25 people to six.</p>
<h2>A post about a piggy bank</h2>
<p>Then Joshua saw a post on social media. A woman described keeping a kolo and putting money into it every single day. It was an ordinary habit, the kind millions of Nigerians practise without thinking. Joshua's question was simple: what if you could do the same thing online, automatically, with the same rule that made the kolo work, that you couldn't just dip into it whenever you felt like it?</p>
<p>The founders were engineers, and they built quickly. In 2016 they launched PiggyBank.ng, a website that automatically set aside small amounts on a schedule and, like the kolo, made it deliberately hard to dip in early.</p>
<h2>Trust, one naira at a time</h2>
<p>Asking people to hand their savings to a new website is a hard sell anywhere. In Nigeria, where scams and failed schemes are a familiar story, it's harder still. PiggyBank had almost no marketing budget. It launched on Twitter and leaned on word of mouth.</p>
<p>A year in, it had helped about 450 people save ₦21 million. Small numbers, but the right kind: real people coming back, saving again, and telling their friends it worked. Each successful withdrawal was a little proof that the money was safe, and the company was built on thousands of those little proofs.</p>
<blockquote>Each successful withdrawal was a small promise kept, and PiggyVest was built on thousands of them.</blockquote>
<hr>
<h2>From PiggyBank to PiggyVest</h2>
<p>The product grew up alongside its users. Saving became investing, and PiggyBank became PiggyVest. The parent company, now called Piggytech, added Pocket and Patronize to its family of products. By the end of 2024 the platform had onboarded more than five million users.</p>
<p>The numbers that tell the real story, though, are the ones flowing back out. In 2024 alone, PiggyVest paid out ₦835 billion to its users, up from ₦545 billion the year before, and the total withdrawn since launch crossed ₦2 trillion. Ifezue, now CEO of Piggytech, called 2024 "our most profitable year."</p>
<p>Eweniyi, meanwhile, became one of the most visible voices in Nigerian tech: a TIME100 Next honoree in 2021 for her work with the Feminist Coalition during the End SARS protests, and a co-founder of FirstCheck, a network of women angel investors backing women-led startups.</p>
${takeaways([
  "<strong>Digitise a habit people already have.</strong> PiggyVest didn't invent saving; it put the kolo's rules on the internet.",
  "<strong>A hard pivot can come from a small signal.</strong> One social media post, noticed at the right moment, became a second company.",
  "<strong>In finance, trust is the product.</strong> Small, kept promises compound into something marketing can't buy.",
])}
${credits("Odunayo Eweniyi, Somto Ifezue or Joshua Chibueze", [
  ["Wikipedia: Odunayo Eweniyi", "https://en.wikipedia.org/wiki/Odunayo_Eweniyi"],
  ["TechCabal: Piggyvest paid out ₦835 billion in 2024 as it crosses ₦2 trillion in total payouts (January 2025)", "https://techcabal.com/2025/01/20/piggyvest-2-trillion/"],
  ["TechCabal: early history of PiggyBank.ng (December 2015 origins, first-year numbers)", "https://techcabal.com/es/?p=68669"],
  ["TechCabal: Piggytech shot callers (2023)", "https://techcabal.com/2023/09/18/piggytech-shot-callers/"],
  ["Techpoint Africa: PiggyVest user growth reporting", "https://techpoint.africa/?p=310669"],
])}`,
  },

  // ─── Chipper Cash ─────────────────────────────────────────────────────────
  {
    slug: "chipper-cash-road-trip-to-cross-border-payments",
    title: "Two students, one road trip and the idea that became Chipper Cash",
    dek: "Ham Serunjogi and Maijid Moujaled met as international students in a small Iowa town. They knew first-hand how hard it was to move money between African countries, and decided to fix it.",
    series: "founder-files",
    guest: "ham-serunjogi",
    tags: ["fintech", "remittances", "uganda", "cross-border"],
    daysAgo: 6,
    body: `<p>Grinnell, Iowa, is a long way from Kampala. It's a small college town in the American Midwest, the kind of place where international students find each other quickly. That's where Ham Serunjogi met Maijid Moujaled.</p>
<p>Serunjogi had arrived on a scholarship with an unusual résumé for an economics student. Born in Uganda in 1993, he'd gone to school at the Aga Khan Academy in Mombasa and swum for Uganda at the 2010 Youth Olympic Games in Singapore. At Grinnell he kept swimming and kept building, co-developing an app for short, encrypted voice messages. Moujaled, a fellow international student a couple of years ahead, shared his restlessness.</p>
<h2>The problem every African abroad knows</h2>
<p>Ask anyone who has studied or worked away from home on the continent, and they'll tell you the same thing: sending money between African countries was absurdly hard. Fees were high, transfers were slow, and the systems in one country rarely spoke to the systems next door. A transfer from Uganda to Ghana could be harder than one from London to either.</p>
<p>On a road trip in 2016, the two friends started sketching what a fix might look like: an app that made moving money across African borders as easy as sending a message.</p>
<h2>Leaving a good job for a hard problem</h2>
<p>After graduating in 2016, Serunjogi joined Facebook's office in Dublin, working with major advertisers. It was the kind of job that makes parents proud and makes leaving feel reckless. In 2018 he left anyway, moved to the Bay Area and became CEO of Chipper Cash, which he and Moujaled had co-founded that year.</p>
<p>They assembled a small team and, in early 2019, raised a seed round of more than $2 million. Then growth arrived quickly: a $13.8 million Series A and a $30 million Series B, led by Ribbit Capital with Bezos Expeditions participating, both in 2020. In 2021 came a $100 million Series C led by SVB Capital, followed by a $150 million extension led by FTX that was reported to value the company at about $2 billion.</p>
<hr>
<h2>Building through the hype cycle</h2>
<p>Chipper's biggest funding year was also the peak of a frenzy in fintech and crypto. Within about a year, FTX, its lead investor in that final round, had collapsed, and much of the market's exuberance went with it. The years since have asked a harder question of every company funded in that era: not how fast you can grow, but how well you can last.</p>
<p>Chipper has kept building across markets including Uganda, Nigeria, Ghana, Rwanda and the United States. Serunjogi, meanwhile, has become one of the most recognisable young African founders: named to Forbes 30 Under 30 in 2023 and appointed to the inaugural US Presidential Advisory Council on African Diaspora Engagement the same year.</p>
${takeaways([
  "<strong>Build the thing you needed yourself.</strong> As Africans living abroad, the founders were their own first customers.",
  "<strong>Co-founders can come from anywhere.</strong> A shared outsider experience in a small Iowa town was enough to build trust.",
  "<strong>Money raised in a boom isn't the same as staying power.</strong> Investors and valuations can change quickly; the problem you solve is what lasts.",
])}
${credits("Ham Serunjogi or Maijid Moujaled", [
  ["Wikipedia: Ham Serunjogi", "https://en.wikipedia.org/wiki/Ham_Serunjogi"],
  ["Grinnell College: Ham Serunjogi '16 named Forbes 30 Under 30 in Finance for 2023", "https://www.grinnell.edu/news/ham-serunjogi-16-named-forbes-30-under-30-finance-2023"],
  ["Grinnell College: Ham Serunjogi '16 to speak at 2023 Commencement", "https://grinnell.edu/news/ham-serunjogi-16-speak-2023-grinnell-college-commencement-ceremony"],
  ["Money Inc: 10 things you didn't know about Ham Serunjogi", "https://moneyinc.com/ham-serunjogi/"],
])}`,
  },
];
