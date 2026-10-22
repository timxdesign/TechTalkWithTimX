import { credits, takeaways } from "./helpers.mjs";

export const people = [
  {
    slug: "tosin-eniolorunda",
    name: "Tosin Eniolorunda",
    role: "Co-founder & CEO",
    company: "Moniepoint",
    location: "Lagos, Nigeria",
    bio: "Tosin Eniolorunda left Interswitch in 2015 to co-found TeamApt with Felix Ike and Odun Adeboye. The company, renamed Moniepoint in 2023, became one of Africa's largest payments and business banking platforms.",
    website_url: "https://moniepoint.com",
  },
  {
    slug: "jeremy-johnson",
    name: "Jeremy Johnson",
    role: "Co-founder",
    company: "Andela",
    location: "New York & Lagos",
    bio: "Jeremy Johnson co-founded Andela in Lagos in 2014 and led it as CEO through its shift to a fully remote global talent marketplace.",
    website_url: "https://andela.com",
  },
  {
    slug: "stewart-butterfield",
    name: "Stewart Butterfield",
    role: "Co-founder",
    company: "Slack",
    location: "Canada",
    bio: "Stewart Butterfield co-founded Flickr and later Tiny Speck, the games studio whose internal chat tool became Slack.",
  },
];

export const stories = [
  // ─── Moniepoint ───────────────────────────────────────────────────────────
  {
    slug: "moniepoint-the-quiet-pivot",
    title: "Moniepoint and the quiet pivot from selling to banks to becoming one",
    dek: "For years, TeamApt built software that made Nigerian banks look good. Then its founders realised they understood the market better than many of their customers did.",
    series: "the-pivot",
    guest: "tosin-eniolorunda",
    tags: ["fintech", "nigeria", "b2b", "bootstrapping"],
    daysAgo: 1,
    body: `<p>If you've paid for anything in a Nigerian shop in the last few years, there's a good chance you've used a Moniepoint terminal without thinking twice about it. The company's CEO says around two in three Nigerian adults now pay through one. What most people don't know is that for its first few years, the company behind those terminals didn't sell to consumers at all.</p>
<h2>Leaving Interswitch with ₦15 million and a plan</h2>
<p>In 2015, Tosin Eniolorunda left Interswitch, one of the pillars of Nigeria's payments industry, with savings of about ₦15 million and a clear view of what banks were struggling with. Two former colleagues, Felix Ike and Odun Adeboye, came with him. Together they started TeamApt.</p>
<p>Their first product, launched in 2016, solved a problem that sounds dull and was costing banks a fortune: merchants with card terminals often couldn't see who had paid them or how much. TeamApt built the software to fix that, along with tools for reconciliation and automation that helped banks move into digital services.</p>
<h2>Selling the problem before the product</h2>
<p>Fidelity Bank became the first customer, and then introduced TeamApt to Wema Bank. At times the team gave its solution to banks for free, just to prove the use case. Eniolorunda has described the approach as "showing the banks the problem they had and how we could solve it."</p>
<p>It worked. By 2018, 26 of Nigeria's 30 banks were using TeamApt's acquiring solution. Just as unusually, the company did it without outside money, taking on side projects to stay afloat, turning a profit within its first two years and reinvesting everything.</p>
<blockquote>It's better to prove that you have value first.</blockquote>
<p>Eniolorunda's view on investors was blunt: it's "better to prove that you have value first," and investor pressure can pull a company away from its mission. In business-to-business, he argued, "you don't need so much money to close deals."</p>
<hr>
<h2>The pivot: from supplier to brand</h2>
<p>By 2018, the founders had seen something from their position behind the scenes. They were building great financial products, but those products reached people only through someone else's brand. And they were watching a huge gap open up: millions of Nigerians, and the small businesses serving them, still had little access to banking at all.</p>
<p>So in 2019 TeamApt did something it had avoided for years. It raised money, $5.5 million, and launched Moniepoint, a network of agents who could offer banking services from neighbourhood shops and kiosks. By 2021 more than 30,000 agents were handling 23 million transactions a month.</p>
<p>The new brand outgrew the old one. In 2023 TeamApt formally renamed itself Moniepoint, the name its customers already trusted. That year it processed more than $150 billion in transactions. In October 2024, a $110 million round with investors including Development Partners International and Google made it Africa's newest unicorn.</p>
${takeaways([
  "<strong>B2B can be your research lab.</strong> Years of serving banks showed TeamApt exactly where the market was underserved.",
  "<strong>Prove value before you raise.</strong> Bootstrapping gave the founders the freedom to choose when, and whether, to take investment.",
  "<strong>Sometimes the pivot is moving from behind the scenes to centre stage.</strong> The same expertise, sold directly, built a much bigger company.",
])}
${credits("Tosin Eniolorunda", [
  ["Techpoint Africa: 6 key strategies Moniepoint adopted to become a $1 billion fintech (October 2024)", "https://techpoint.africa/2024/10/30/6-key-strategies-moniepoint-adopted-a-1-billion-fintech/"],
  ["Techeconomy: From TeamApt to Moniepoint, inside the 10-year journey", "https://techeconomy.ng/from-teamapt-to-moniepoint-inside-the-10-year-journey-to-a-250-billion-fintech-powerhouse"],
  ["Afridigest: How Tosin Eniolorunda built TeamApt/Moniepoint", "https://afridigest.substack.com/p/how-tosin-eniolorunda-built-teamapt-moniepoint"],
])}`,
  },

  // ─── Andela ───────────────────────────────────────────────────────────────
  {
    slug: "andela-when-the-model-had-to-change",
    title: "Andela: when the model that made you has to change",
    dek: "Andela began by paying young Africans to learn to code in a Lagos office. Six years later, the founders had to dismantle almost everything that made it famous, and it worked.",
    series: "the-pivot",
    guest: "jeremy-johnson",
    tags: ["talent", "remote-work", "nigeria", "layoffs"],
    daysAgo: 3,
    body: `<p>In May 2014, a small team put out a call on Twitter in Lagos. They were looking for software developers to join something new. Seven hundred people applied. Four were chosen. That first cohort of four Nigerian engineers was the beginning of Andela.</p>
<h2>An idea about where talent lives</h2>
<p>Andela's co-founders were a mix of Nigerian and North American builders: Jeremy Johnson, Iyinoluwa Aboyeji, Christina Sass, Nadayar Enegesi, Brice Nkengsa and Ian Carnevale. At the heart of the company was an idea Johnson has repeated for years: that brilliance is evenly distributed around the world, but opportunity is not.</p>
<p>The model was bold. Andela recruited promising young Africans into a four-year fellowship, trained them, and placed them with companies abroad, essentially paying people to become world-class engineers. It made Andela one of the most talked-about startups on the continent. In 2016, the Chan Zuckerberg Initiative led a $24 million round, its first lead investment anywhere. By early 2019, Andela had raised $180 million in venture funding.</p>
<h2>The hard part</h2>
<p>But the world was shifting under the model. Companies hiring remotely wanted more experienced engineers, not juniors who needed years of support. In September 2019 Andela laid off 420 junior developers across Nigeria, Uganda and Kenya, saying it needed to match the talent it trained to what the global market was asking for. A voluntary exit programme followed in early 2020.</p>
<p>Then the pandemic hit. In May 2020 Andela cut about 135 more staff, roughly a tenth of the company, as customers felt the economic shock. In the same announcement, Johnson laid out a far bigger change: Andela would go remote-first, and it would open its platform to engineers who weren't its employees at all. Within weeks it had left its offices entirely.</p>
<blockquote>Brilliance is evenly distributed. Opportunity isn't.</blockquote>
<hr>
<h2>From campus to marketplace</h2>
<p>The new Andela looked very different from the old one. Instead of training a small number of fellows in physical campuses, it became a global marketplace connecting companies with vetted technologists working remotely: engineers first, then designers, product managers and data specialists.</p>
<p>The bet paid off. In September 2021, SoftBank's Vision Fund 2 led a $200 million round that valued Andela at $1.5 billion. Its talent network now spans more than 150,000 people in about 135 countries, with clients including GitHub and Goldman Sachs.</p>
<p>The layoffs were painful and real, and it's worth saying so plainly. The lesson isn't that pivots are painless. It's that the mission, opportunity for brilliant people wherever they are, turned out to be bigger than the model the founders first built to deliver it.</p>
${takeaways([
  "<strong>Separate the mission from the model.</strong> Andela kept its purpose and rebuilt almost everything else around it.",
  "<strong>Listen to what the market is actually buying.</strong> Demand for senior remote talent forced a change no one wanted, and opened a bigger market.",
  "<strong>Hard decisions are still human decisions.</strong> Being honest about layoffs is part of telling a pivot truthfully.",
])}
${credits("Jeremy Johnson or the Andela founding team", [
  ["Wikipedia: Andela", "https://en.wikipedia.org/wiki/Andela"],
  ["Techpoint Africa: Andela lays off 135 staff across 4 countries (May 2020)", "https://techpoint.africa/news/software-talent-company-andela-lays-off-135-staff-across-4-countries/"],
  ["WeeTracker: Andela confirms exiting all offices and going fully remote (June 2020)", "https://weetracker.com/2020/06/24/andela-now-fully-remote/"],
  ["The Condia: Explaining Andela's third round of layoffs within 9 months", "https://thecondia.com/andela-lay-off-135-2019/"],
  ["Stanford GSB: Unleashing the power of market creation (Jeremy Johnson, July 2023)", "https://www.gsb.stanford.edu/insights/unleashing-power-market-creation"],
  ["PC Tech Magazine: Andela, a startup that pays developers in Africa to learn how to code (2015)", "https://pctechmag.com/2015/07/andela-a-startup-that-pays-developers-in-africa-to-learn-how-to-code/"],
])}`,
  },

  // ─── Slack ────────────────────────────────────────────────────────────────
  {
    slug: "slack-the-game-that-failed-forward",
    title: "Slack: the game that failed forward",
    dek: "Tiny Speck raised millions to build a whimsical online game. The game didn't work. The chat tool the team built to make it did.",
    series: "the-pivot",
    guest: "stewart-butterfield",
    tags: ["saas", "pivot", "global", "product"],
    daysAgo: 7,
    body: `<p>Some of the most important software in the world was built by accident, as a side effect of trying to make something else. Slack is one of the clearest examples, and its story is worth retelling for every founder staring at a product that isn't working.</p>
<h2>A studio built to make a game</h2>
<p>In 2009, Stewart Butterfield, already known for co-founding Flickr, started a company called Tiny Speck in Vancouver with Cal Henderson, Eric Costello and Serguei Mourachov. Their ambition was a game called Glitch: a strange, gentle, browser-based world with no combat, set inside the imaginations of eleven giants.</p>
<p>Investors believed in it. Before its beta, Glitch raised more than $15 million from firms including Accel and Andreessen Horowitz. It launched publicly in September 2011.</p>
<p>The team was spread across Vancouver, San Francisco and New York. To work together in real time, the engineers built themselves an internal messaging tool. Nobody thought of it as a product. It was just how they got work done.</p>
<h2>Admitting it wasn't working</h2>
<p>Glitch struggled. It was complicated, slow and built on Flash, just as the world was moving to phones. Butterfield later said "we had no real avenue to port to mobile." By late 2012, the team faced the decision every founder dreads.</p>
<p>"Given the totality of the position we were in, it made no sense," Butterfield told Gamasutra. In November 2012, Tiny Speck announced Glitch would close. He was careful with the wording on Twitter: "To be clear: Tiny Speck is not closing, just Glitch."</p>
<blockquote>To be clear: Tiny Speck is not closing, just Glitch.</blockquote>
<p>There was money left in the bank. Butterfield offered to return it to investors, unless they wanted to back what came next. Accel's Andrew Braccia didn't hesitate: "If you want to continue to be an entrepreneur and build something, then I'm with you."</p>
<hr>
<h2>The tool they couldn't stop using</h2>
<p>What came next was the internal chat tool. As Glitch wound down, the team realised that the thing they used every day to build the game was valuable in its own right. "We realized, wow, this is hugely a productive way of working," Butterfield said later.</p>
<p>They turned it into Slack. The design studio MetaLab gave it a look that felt nothing like enterprise software; as MetaLab's Andrew Wilkinson put it, "We gave it the color scheme of a video game." Less than two years after the pivot, Slack had 60,000 daily users. By 2019 it had more than 10 million, and that June it listed on the New York Stock Exchange. In 2020 Salesforce agreed to buy it for about $27.7 billion.</p>
<p>Even sceptics came round. Ben Horowitz admitted he first thought the idea sounded "like a really horrible idea," and later: "I couldn't have gotten it more wrong."</p>
${takeaways([
  "<strong>Look at what your team relies on every day.</strong> The tools you build for yourself can be more valuable than the product you're selling.",
  "<strong>Ending a product isn't ending a company.</strong> Butterfield closed Glitch and kept the team, the trust and the capital.",
  "<strong>Honesty with investors buys you a second chance.</strong> Offering the money back earned the backing to try again.",
])}
${credits("Stewart Butterfield or the Tiny Speck team", [
  ["TechCrunch: The Slack origin story, by Kate Clark (May 2019)", "https://techcrunch.com/2019/05/30/the-slack-origin-story"],
  ["StackSync: The video game that failed, the origin story of Slack", "https://www.stacksync.com/blog/the-video-game-that-failed-the-origin-story-of-slack"],
])}`,
  },
];
