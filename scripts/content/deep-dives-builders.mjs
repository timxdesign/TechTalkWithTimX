import { credits, takeaways } from "./helpers.mjs";

export const people = [
  {
    slug: "susie-lonie",
    name: "Susie Lonie",
    role: "Mobile money pioneer",
    company: "M-Pesa (Vodafone / Safaricom)",
    location: "United Kingdom & Kenya",
    bio: "Susie Lonie led the pilot and launch of M-Pesa in Kenya. With Nick Hughes, she received The Economist's 2010 innovation award for social and economic innovation.",
  },
  {
    slug: "keller-rinaudo-cliffton",
    name: "Keller Rinaudo Cliffton",
    role: "Co-founder & CEO",
    company: "Zipline",
    location: "South San Francisco",
    bio: "Keller Rinaudo Cliffton co-founded Zipline in 2014. Its first national drone delivery service launched in Rwanda in 2016, delivering blood to rural clinics.",
    website_url: "https://www.flyzipline.com",
  },
  {
    slug: "ory-okolloh",
    name: "Ory Okolloh",
    role: "Co-founder",
    company: "Ushahidi",
    location: "Kenya",
    bio: "Ory Okolloh is a Kenyan activist and blogger whose 2008 call for a map of post-election violence led to Ushahidi, the open-source crowdsourcing platform.",
    website_url: "https://www.ushahidi.com",
  },
  {
    slug: "juliana-rotich",
    name: "Juliana Rotich",
    role: "Co-founder",
    company: "Ushahidi & BRCK",
    location: "Nairobi, Kenya",
    bio: "Juliana Rotich is a Kenyan technologist who co-founded Ushahidi, served as its executive director, and co-founded BRCK, the rugged connectivity device designed in Nairobi.",
  },
];

export const stories = [
  // ─── M-Pesa ───────────────────────────────────────────────────────────────
  {
    slug: "m-pesa-the-pilot-that-changed-the-plan",
    title: "M-Pesa: the pilot that changed the plan",
    dek: "It was designed to help people repay microloans. Then the customers started using it for something else, and a small team in Nairobi was smart enough to follow them.",
    series: "deep-dives",
    guest: "susie-lonie",
    tags: ["mobile-money", "kenya", "fintech", "financial-inclusion"],
    daysAgo: 5,
    body: `<p>It's hard to overstate how ordinary M-Pesa feels in Kenya today. You pay for a taxi, a bag of tomatoes or school fees from your phone, and nobody thinks of it as technology. But the most important thing about M-Pesa's origin isn't the technology at all. It's that the people who built it noticed their customers doing something unexpected, and changed course.</p>
<h2>A development grant and a modest goal</h2>
<p>The idea began with Nick Hughes at Vodafone, who took a proposal for mobile microfinance to a Challenge Fund run by the UK's Department for International Development. Vodafone matched the grant with money and staff time. The goal was modest and specific: make it easier for microfinance borrowers in Kenya to repay their loans using a mobile phone.</p>
<p>Susie Lonie, who had been working on mobile commerce at Vodafone in the UK, was sent to Nairobi in 2005 on what was meant to be a short assignment to run the pilot. It started in October 2005 with about 500 customers and roughly 15 agents.</p>
<h2>The customers had other ideas</h2>
<p>By the time the pilot ended in May 2006, something interesting was happening. People weren't only repaying loans. They were using the system to pay each other, to trade, and to send money to family. The product had found a use its designers hadn't planned for.</p>
<p>Lonie persuaded Safaricom to launch M-Pesa not as a narrow loan-repayment tool, but as a general way to move money. It went live nationally in March 2007. "I had a tiny team of 11 at the time we launched," she recalled.</p>
<blockquote>I knew that if we did it right, it was going to be big, but I didn't know how big.</blockquote>
<p>Support from the parent company was thin at first. "Until it was successful, Vodafone didn't really want to know," Lonie said. The hardest part wasn't the software. It was the agents, the shopkeepers who turned cash into mobile money and back again, many of them small businesses with little cash on hand. Recruiting and training them was, in Lonie's words, "probably the hardest part, because it is outside of your control."</p>
<hr>
<h2>The fight and the evidence</h2>
<p>Success brought opposition. In December 2008, a group of banks reportedly lobbied Kenya's finance minister to audit M-Pesa, apparently hoping to slow it down. The audit found the service was robust, and growth continued. By the end of 2011, M-Pesa had around 17 million subscribers in Kenya.</p>
<p>The most cited evidence of its impact came in 2016, when economists Tavneet Suri and William Jack reported in <em>Science</em> that access to M-Pesa had lifted about 194,000 households, around 2% of Kenyan households, out of poverty. Other researchers have since challenged those findings, and the debate is worth knowing about. But few dispute that M-Pesa changed how money moves in East Africa.</p>
<p>It also showed that mobile money isn't simple to copy. M-Pesa expanded to Tanzania, Mozambique, Egypt and elsewhere, but launches in India, Romania and Albania were later shut down. What worked in Kenya depended on Kenya: its agents, its regulators and its moment.</p>
${takeaways([
  "<strong>Watch what customers do, not what you designed.</strong> The pivot from loan repayments to \"send money home\" came straight from pilot behaviour.",
  "<strong>Distribution is the product.</strong> M-Pesa's agent network was the hardest and most important thing it built.",
  "<strong>Context doesn't copy-paste.</strong> The same product failed in markets that lacked the conditions that made it work in Kenya.",
])}
${credits("Susie Lonie or Nick Hughes", [
  ["Leaders League: Susie Lonie (M-PESA), \"I knew it was going to be big\"", "https://www.leadersleague.com/pt/news/susie-lonie-m-pesa-i-knew-it-was-going-to-be-big"],
  ["Wikipedia: M-Pesa", "https://en.wikipedia.org/wiki/M-Pesa"],
  ["Consult Hyperion: Book corner, \"Money, Real Quick: The Story of M-PESA\"", "https://chyp.com/2012/04/10/book-corner-money-real-quick-the-story-of-m-pesa/"],
  ["UC Irvine: The Economist's Innovation Awards 2010", "https://www.socsci.uci.edu/newsevents/news/2010/2010-09-23-the-economists-innovation-awards-2010.php"],
  ["Suri & Jack, \"The long-run poverty and gender impacts of mobile money\", Science (2016)", "https://www.science.org/doi/10.1126/science.aah5309"],
])}`,
  },

  // ─── Zipline ──────────────────────────────────────────────────────────────
  {
    slug: "zipline-rwanda-blood-from-the-sky",
    title: "Blood from the sky: what Zipline learned in Rwanda",
    dek: "In 2016, a small robotics company and the government of Rwanda launched the world's first national drone delivery service. Its first cargo was blood.",
    series: "deep-dives",
    guest: "keller-rinaudo-cliffton",
    tags: ["healthtech", "drones", "rwanda", "logistics"],
    daysAgo: 8,
    body: `<p>Imagine a mother bleeding after childbirth in a rural clinic hours from the nearest blood bank. Blood doesn't keep forever, and small clinics can't stock every type they might need. For years the honest answer to "how fast can we get blood here?" was: often not fast enough.</p>
<p>In October 2016, in Muhanga in western Rwanda, a new answer took off from a catapult.</p>
<h2>From a toy robot to a national service</h2>
<p>Zipline's founders had already built and lost one company. Keller Rinaudo Cliffton's first startup, Romotive, made a small robot controlled by an iPhone; it shut down in 2014. That same year, he co-founded Zipline in California with Keenan Wyrobek, Ryan Oksenhorn and William Hetzler, with a far more serious ambition: use autonomous aircraft to deliver medical supplies where roads couldn't.</p>
<p>Rwanda became the proving ground. Under an agreement with the government, Zipline opened a distribution centre in Muhanga and began delivering blood to 21 facilities in the west of the country. Clinics could order by text message. Reports at the time described it as the first national drone delivery system in the world.</p>
<h2>How a delivery actually works</h2>
<p>The engineering is elegant because the problem demanded it. A small fixed-wing drone is packed and checked, then flung into the air by an electric catapult. It cruises to the clinic, drops low, and releases its package under a paper parachute into a small target area. It never lands. Instead it flies home, where a cable catches it out of the sky by a hook on its tail, much like a jet landing on an aircraft carrier.</p>
<blockquote>The drone never lands. It drops its package by parachute and flies home to be caught out of the sky.</blockquote>
<p>Rwanda added a second centre near Kayonza in the east in December 2018, extending the service to more hospitals and to vaccines and other medical products.</p>
<hr>
<h2>Did it actually help?</h2>
<p>Good intentions are cheap; evidence isn't. A 2022 study of Zipline's Rwanda deliveries found that drone delivery cut blood delivery times by 61% and reduced blood units expiring by 67%. Emergency orders made up 43% of requests, exactly the situations where minutes matter.</p>
<p>The model spread. Ghana launched in April 2019 with a delivery of yellow fever vaccines and, in the year to March 2022, Zipline delivered more than a million COVID-19 vaccine doses there. The company passed its millionth delivery in April 2024 and later began home deliveries in the United States with a new kind of drone.</p>
<p>The story has hard chapters too. In late 2025, Zipline temporarily suspended three hubs in Ghana over roughly $15 million in unpaid government bills, a reminder that public health infrastructure lives or dies on public budgets as much as on clever engineering.</p>
${takeaways([
  "<strong>Start where the need is sharpest.</strong> Blood for remote clinics was a problem where speed obviously saved lives.",
  "<strong>Partner with government early.</strong> Rwanda's backing turned a pilot into national infrastructure.",
  "<strong>Measure outcomes, not just deliveries.</strong> Shorter delivery times and less wasted blood made the case better than any demo.",
])}
${credits("Keller Rinaudo Cliffton or the Zipline team", [
  ["Wikipedia: Zipline (drone delivery company)", "https://en.wikipedia.org/wiki/Zipline_(drone_delivery)"],
  ["Nation: Rwanda begins to deliver medical supplies to remote areas using drones (2016)", "https://nation.africa/kenya/news/africa/rwanda-begins-to-deliver-medical-supplies-to-remote-areas-using-drones--316364"],
  ["Small Wars Journal: Saving lives in Rwanda with US-made drones (October 2016)", "https://smallwarsjournal.com/2016/10/20/saving-lives-in-rwanda-with-us-made-drones/"],
  ["Eagle Online: Kagame launches drone blood delivery system (October 2016)", "https://eagle.co.ug/2016/10/14/kagame-launches-drone-blood-delivery-system/"],
])}`,
  },

  // ─── Ushahidi ─────────────────────────────────────────────────────────────
  {
    slug: "ushahidi-built-in-days-used-for-years",
    title: "Ushahidi: built in days, used around the world",
    dek: "During Kenya's post-election crisis, a blogger asked if any techies could build a map of what was happening. A few days later, they had.",
    series: "builder-diaries",
    guest: "ory-okolloh",
    tags: ["civic-tech", "open-source", "kenya", "crowdsourcing"],
    daysAgo: 9,
    body: `<p>At the end of December 2007, Kenya's disputed presidential election erupted into violence. Information was patchy and frightening. Rumours travelled faster than reporting, and much of what was happening on the ground wasn't making it into the mainstream news at all.</p>
<p>Ory Okolloh had come home to vote. A Kenyan activist and the writer behind the blog Kenyan Pundit, she started posting updates many times a day, gathering reports from readers and checking them with contacts at NGOs. She described the scene to CNN later: "you look outside and you're seeing smoke all over Kibera."</p>
<h2>A call for techies</h2>
<p>By early January 2008, Okolloh had returned to South Africa, where she was living, and the volume of reports was overwhelming. On her blog, she asked for help: could someone with the technical know-how build a tool that would let people report incidents and put them on a map of Kenya?</p>
<p>Erik Hersman, a technologist who had grown up in Kenya and Sudan and blogged as WhiteAfrican, read the post and picked up the phone. He called David Kobia, a Kenyan developer who had run an online forum called Mashada since 1998 and had just shut it down after it turned hostile in the wake of the election. Kobia was driving through Georgia in the United States when the call came. He turned around.</p>
<blockquote>you look outside and you're seeing smoke all over Kibera</blockquote>
<h2>The first version</h2>
<p>Within days, Kobia had built it, using Kohana, a PHP framework. The name they chose was Ushahidi, Swahili for "testimony" or "witness." Anyone could submit a report describing what happened, when and where, and it appeared on a map. Juliana Rotich, a blogger who would later become Ushahidi's executive director, helped organise the work of verifying reports before they were treated as reliable.</p>
<p>Two design decisions made all the difference. First, they quickly added the ability to report by SMS and email, because far more Kenyans had phones than computers. Second, they added a category for "Peace Efforts," so the map showed people helping each other as well as harm. It was a small choice that said a lot about who the tool was for.</p>
<hr>
<h2>Giving it away</h2>
<p>The team released Ushahidi as open-source software. That decision turned a crisis tool for one country into infrastructure for the world. It has since been used to track events in the Democratic Republic of the Congo and South Africa, by Al Jazeera's reporting in Uganda, and in elections and emergencies far beyond Africa. An analysis by researchers at the Harvard Kennedy School found that Ushahidi's data on the Kenyan crisis compared favourably with what the mainstream media reported at the time.</p>
<p>The founders left their day jobs to work on it full time, funded by grants, and the team's next ideas grew out of the same spirit, including BRCK, a rugged device to keep people online when the power failed.</p>
${takeaways([
  "<strong>Speed beats polish in a crisis.</strong> A working tool in days mattered more than a perfect one in months.",
  "<strong>Build for the device people actually have.</strong> SMS support reached people a web form never would.",
  "<strong>Open source can multiply your impact.</strong> Giving the code away let thousands of others adapt it to their own crises.",
])}
${credits("Ory Okolloh, Erik Hersman, David Kobia or Juliana Rotich", [
  ["The History of the Web: How to use the web to show the truth", "https://thehistoryoftheweb.com/how-to-use-the-web-to-show-the-truth/"],
  ["Wikipedia: Ushahidi", "https://en.wikipedia.org/wiki/Ushahidi"],
  ["MIT Technology Review: Innovators Under 35, David Kobia", "https://www.technologyreview.com/innovator/david-kobia/"],
  ["Global Voices: Kenya, cyberactivism in the aftermath of political violence (January 2008)", "https://globalvoices.org/2008/01/15/kenya-cyberactivism-in-the-aftermath-of-political-violence/"],
  ["Logic Magazine: From the Silicon Savannah to Sheba Valley", "https://logicmag.io/06-from-the-silicon-savannah-to-sheba-valley"],
])}`,
  },

  // ─── BRCK ─────────────────────────────────────────────────────────────────
  {
    slug: "brck-a-backup-generator-for-the-internet",
    title: "BRCK: a backup generator for the internet, designed in Nairobi",
    dek: "Tired of losing their connection every time the power went out, the team behind Ushahidi did something rare for an African software company. They built hardware.",
    series: "builder-diaries",
    guest: "juliana-rotich",
    tags: ["hardware", "connectivity", "kenya", "kickstarter"],
    daysAgo: 10,
    body: `<p>Every builder in Nairobi in the early 2010s knew the routine. The power goes out. The router goes dark. Whatever you were uploading, testing or saying on a call simply stops. You wait, you swear a little, and you start again.</p>
<p>The team at Ushahidi knew it better than most. They were building software used in crises around the world from a city where the grid and the internet regularly let them down. Eventually they asked a question that most software companies never ask: what if we built the hardware ourselves?</p>
<h2>Routers built for somewhere else</h2>
<p>The problem, as Erik Hersman saw it, was that most routers and modems are designed for places like New York and London, where power is constant and broadband is reliable. Meanwhile, more and more of the people coming online lived in cities like Lagos, Nairobi and Kampala. "We wanted a connectivity device that fit our needs," he said.</p>
<p>The result was BRCK, named for its size and shape. Juliana Rotich, Ushahidi's co-founder and executive director, described the motivation simply: "We're addicted to the Internet, but in a difficult environment." For a company born from Ushahidi, she said, it was "a natural progression considering Ushahidi's DNA."</p>
<blockquote>We're addicted to the Internet, but in a difficult environment.</blockquote>
<h2>Designing for dust, drops and dirty power</h2>
<p>BRCK was built to survive the real world. It was rugged against drops, dust and weather, and it could handle "dirty" voltage when charging. Most importantly, it didn't care how it got online. It could switch between a wired Ethernet connection, Wi-Fi and a mobile data SIM, and fall back to its own battery when the grid failed, with up to eight hours of backup power and room for up to 20 connected devices. The team called it a "backup generator for the Internet."</p>
<p>"We want to keep it rugged but beautiful," Rotich said. That combination, tough enough for a dusty roadside and considered enough to want on your desk, was the whole design philosophy.</p>
<hr>
<h2>Kickstarting a hardware company</h2>
<p>In May 2013, the team launched a Kickstarter campaign with a goal of $125,000. Within about three days it had raised around $50,000 from 340 backers, including well-known names from the global tech community. The campaign was funded, and in September 2014 the first backers finally received their BRCKs.</p>
<p>Hardware is famously hard, and doubly so far from the world's manufacturing hubs. Design happened in Nairobi, with manufacturing done abroad. Hersman has pointed out that "fewer Africans are involved in building hardware technology for the internet," and BRCK was, in part, an argument that it didn't have to stay that way.</p>
${takeaways([
  "<strong>Your local constraints are a design brief.</strong> Unreliable power wasn't an excuse; it was the product specification.",
  "<strong>Software teams can build hardware.</strong> It's harder, slower and more expensive, but the payoff can be a product nobody else will make for your market.",
  "<strong>Crowdfunding can validate demand.</strong> Kickstarter proved people wanted BRCK before a single unit was manufactured.",
])}
${credits("Juliana Rotich or Erik Hersman", [
  ["TechCentral: Kenya's BRCK, all the details, by Craig Wilson (May 2013)", "https://techcentral.co.za/kenyas-brck-all-the-details/187838/"],
  ["African Arguments: African manufacturing its own hardware, BRCK internet in a box, by Tinashe Mushakavanhu (January 2017)", "https://africanarguments.org/2017/01/african-manufacturing-its-own-hardware-brck-internet-in-a-box-haller-prize-3rd-place/"],
  ["How We Made It In Africa: Meet the BRCK, rugged internet for Africa", "https://www.howwemadeitinafrica.com/p/meet-the-brck-rugged-internet-for-africa"],
  ["HeroX: Silicon Savannah creates BRCK mobile internet router", "https://herox.com/blog/144-silicon-savannah-creates-brck-mobile-internet-rout"],
])}`,
  },
];
