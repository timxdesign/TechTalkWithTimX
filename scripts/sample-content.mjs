// Adds (or removes) clearly marked sample content for design review.
//   node --env-file=.env scripts/sample-content.mjs          add / refresh
//   node --env-file=.env scripts/sample-content.mjs --remove delete it all
// Every sample row uses a slug starting with "sample-".

import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const daysAgo = (d, h = 8) => new Date(Date.now() - d * 86_400_000 - h * 3_600_000).toISOString();
const note = `<p><em>This is sample content for reviewing the design. Delete it with <code>npm run sample:remove</code>.</em></p>`;
const words = (html) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

async function remove() {
  for (const table of ["episodes", "stories", "people"]) {
    const { error, count } = await db.from(table).delete({ count: "exact" }).like("slug", "sample-%");
    if (error) throw error;
    console.log(`removed ${count ?? 0} ${table}`);
  }
}

async function add() {
  await remove();

  const { data: series } = await db.from("series").select("id, slug");
  const s = Object.fromEntries(series.map((x) => [x.slug, x.id]));
  const { data: host } = await db.from("people").select("id").eq("slug", "timx").single();

  const { data: people, error: pErr } = await db
    .from("people")
    .insert([
      {
        slug: "sample-amara-okafor",
        name: "Amara Okafor",
        role: "Co-founder & CEO",
        company: "Tallybird",
        location: "Lagos, Nigeria",
        bio: "Amara builds bookkeeping software for market traders. Before Tallybird she spent six years in commercial banking, watching small businesses get turned away for loans they could easily repay.",
      },
      {
        slug: "sample-daniel-mensah",
        name: "Daniel Mensah",
        role: "Head of Engineering",
        company: "Clinicloop",
        location: "Accra, Ghana",
        bio: "Daniel leads a twelve-person engineering team building offline-first patient records for community clinics. He started coding on a shared computer at his uncle's cyber café.",
      },
      {
        slug: "sample-zainab-bello",
        name: "Zainab Bello",
        role: "Founder",
        company: "Formhouse",
        location: "Nairobi, Kenya",
        bio: "Zainab is a product designer turned founder. Formhouse helps logistics companies replace paper waybills with a mobile app drivers actually want to use.",
      },
    ])
    .select("id, slug");
  if (pErr) throw pErr;
  const p = Object.fromEntries(people.map((x) => [x.slug.replace("sample-", ""), x.id]));

  const stories = [
    {
      slug: "sample-the-ledger-that-market-traders-built",
      title: "The ledger that market traders built",
      dek: "Amara Okafor left banking to fix the one thing that kept small businesses from getting credit: records. The hard part wasn't the software.",
      series_id: s["founder-files"],
      guest_id: p["amara-okafor"],
      tags: ["fintech", "nigeria", "smb"],
      featured: true,
      published_at: daysAgo(0, 3),
      body_html: `<p>The first version of Tallybird was a WhatsApp group. Amara Okafor would sit in Balogun Market with a notebook, write down what each trader sold that day, and send them a summary every evening. Nobody asked her to. Within a month, forty traders were waiting for the message.</p>
<p>"I'd spent six years in a bank saying no to people like them," she says. "Not because they were bad businesses. Because they had no records. Their whole history lived in their heads."</p>
<h2>Banking from the other side of the desk</h2>
<p>Okafor's job at the bank was assessing small-business loans. The pattern was always the same: a trader with a decade of steady sales, three children in school, and nothing on paper to prove it. The loan would be declined, and the trader would go to a moneylender at four times the rate.</p>
<blockquote>The software was easy. Getting someone to trust you with what they earned today is the actual product.</blockquote>
<p>She left in 2023 with a simple thesis: if traders kept records, lenders would follow. The question was how to make record-keeping something people would do at the end of a twelve-hour day.</p>
<h2>Designing for the end of a long day</h2>
<p>The early app failed. It asked for too much: item names, quantities, prices. Traders gave up within a week. So the team cut it back to one question, asked by voice note in Pidgin, Yoruba or English: <strong>how much did you sell today?</strong></p>
<p>Retention went from 11% to 64% in a quarter. The voice notes were transcribed, totalled and turned into a monthly statement a lender could read.</p>
<hr>
<h2>What comes next</h2>
<p>Tallybird now partners with two microfinance banks. Traders with three months of records can apply for working-capital loans inside the app. Okafor is careful about growth. "If we push loans too fast, we become the moneylender with a nicer interface. The records have to come first."</p>
${note}`,
    },
    {
      slug: "sample-building-for-clinics-with-no-internet",
      title: "Building for clinics with no internet",
      dek: "Clinicloop's engineering lead on why offline-first isn't a feature. It's the whole architecture.",
      series_id: s["builder-diaries"],
      guest_id: p["daniel-mensah"],
      tags: ["healthtech", "engineering", "ghana"],
      published_at: daysAgo(1),
      body_html: `<p>Daniel Mensah's first commit to Clinicloop was a sync engine. Not a login screen, not a dashboard: a way for a tablet in a clinic with no connection to agree with a server it might not reach for a week.</p>
<p>"Everyone says offline-first," he says. "Then they build an online app with a cache. When the cache and the server disagree, a nurse loses a patient's allergy notes. That's not a bug report. That's a person."</p>
<h2>Conflicts are clinical decisions</h2>
<p>The team's rule is that the software never silently picks a winner when two edits conflict. Instead, the next clinician to open the record sees both versions and chooses. It's slower. It's also the reason three regional health directorates trust it.</p>
<blockquote>We optimise for the worst day, not the average one.</blockquote>
<p>Mensah learned to code on a shared computer in his uncle's cyber café in Kumasi, saving his work to a flash drive because the machines were wiped every night. "I've been building offline-first since I was fourteen," he laughs. "I just didn't have the word for it."</p>
${note}`,
    },
    {
      slug: "sample-the-pivot-from-agency-to-product",
      title: "From agency to product: the pivot that almost didn't happen",
      dek: "Zainab Bello was making good money designing apps for other people. Walking away from it was the hardest product decision she's made.",
      series_id: s["the-pivot"],
      guest_id: p["zainab-bello"],
      tags: ["design", "logistics", "kenya"],
      published_at: daysAgo(2),
      body_html: `<p>For four years, Formhouse was a design studio. A good one, with a waiting list. Then a logistics client asked Zainab Bello to redesign the paper waybill their drivers filled in at every drop-off, and she spent three weeks riding along in delivery vans.</p>
<p>"By the end of it I didn't want to design them a form," she says. "I wanted to build the thing that made the form unnecessary."</p>
<h2>Saying no to revenue</h2>
<p>The studio was profitable. Turning down client work meant turning down certainty. Bello gave herself six months and a hard rule: if three logistics companies weren't paying for the product by then, she'd go back to agency work without regret.</p>
<p>Four were paying by month five.</p>
${note}`,
    },
    {
      slug: "sample-why-we-stopped-chasing-funding-news",
      title: "Why we stopped chasing funding news",
      dek: "A note from TimX on what this publication is for, and what it isn't.",
      author_id: host.id,
      series_id: s["deep-dives"],
      tags: ["editorial"],
      published_at: daysAgo(3),
      body_html: `<p>There is no shortage of places to find out who raised what. There are far fewer places to find out how anyone actually built anything.</p>
<p>That's the gap Tech Talk with TimX exists to fill. Every story here starts with a conversation, usually a long one, about the decisions nobody announces: the hire that didn't work, the feature that got cut, the month the money nearly ran out.</p>
<h2>What you'll find here</h2>
<p>Long-form stories, podcast conversations, and a daily brief that respects your time. What you won't find is a press release with a byline.</p>
${note}`,
    },
    {
      slug: "sample-first-hundred-customers-by-hand",
      title: "The first hundred customers, by hand",
      dek: "Three founders on the unscalable things they did early, and which ones they'd do again.",
      series_id: s["founder-files"],
      tags: ["growth", "early-stage"],
      published_at: daysAgo(5),
      body_html: `<p>Every founder in this story signed their first hundred customers personally. None of them would recommend it as a strategy. All of them would do it again.</p>
<h2>Sit where the customer sits</h2>
<p>Amara Okafor sat in the market. Zainab Bello rode in the vans. Daniel Mensah's team spent their first month working shifts at a clinic reception desk. The lesson was the same each time: the problem you think you're solving is rarely the one people have.</p>
${note}`,
    },
    {
      slug: "sample-hiring-your-first-engineer",
      title: "Hiring your first engineer when you can't read code",
      dek: "Non-technical founders on the interview questions that actually worked.",
      series_id: s["builder-diaries"],
      tags: ["hiring", "early-stage", "engineering"],
      published_at: daysAgo(8),
      body_html: `<p>The most common question non-technical founders send us is some version of: how do I know if an engineer is good when I can't evaluate their work?</p>
<p>The founders we spoke to converged on the same answer: you can't judge the code, but you can judge the thinking. Ask candidates to explain a past decision they regret. Listen for whether they talk about users or only about technology.</p>
${note}`,
    },
  ].map((st) => ({ ...st, status: "published", reading_minutes: Math.max(1, Math.round(words(st.body_html) / 230)) }));

  const { data: insertedStories, error: sErr } = await db.from("stories").insert(stories, { defaultToNull: false }).select("id, slug");
  if (sErr) throw sErr;
  const storyId = Object.fromEntries(insertedStories.map((x) => [x.slug, x.id]));

  const { error: eErr } = await db.from("episodes").insert([
    {
      slug: "sample-amara-okafor-records-before-loans",
      season: 1,
      number: 2,
      title: "Records before loans, with Amara Okafor",
      dek: "Why Tallybird's founder believes the path to credit for small businesses starts with a voice note at the end of the day.",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      duration_seconds: 372,
      guest_id: p["amara-okafor"],
      story_id: storyId["sample-the-ledger-that-market-traders-built"],
      series_id: s["founder-files"],
      chapters: [
        { start: 0, title: "Intro" },
        { start: 45, title: "Six years of saying no" },
        { start: 140, title: "The WhatsApp group" },
        { start: 230, title: "Designing for tired people" },
        { start: 310, title: "What lenders actually need" },
      ],
      show_notes_html: `<p>Amara Okafor spent six years assessing small-business loans. Then she left to build the records that would have let her say yes.</p><ul><li>Why market traders were declined for loans they could repay</li><li>The one-question app that took retention from 11% to 64%</li><li>Why Tallybird won't push loans faster than records</li></ul>${note}`,
      transcript: `TimX: Amara, welcome to the show.\n\nAmara: Thanks for having me. I've been listening for a while, so this is strange.\n\nTimX: Let's start at the bank. What did a typical Tuesday look like?\n\nAmara: A queue of good businesses I couldn't help. That's the honest answer.\n\n(Sample transcript for design review.)`,
      status: "published",
      published_at: daysAgo(0, 2),
    },
    {
      slug: "sample-daniel-mensah-offline-first",
      season: 1,
      number: 1,
      title: "Offline-first is a promise, with Daniel Mensah",
      dek: "Clinicloop's head of engineering on sync engines, conflict resolution and building for the worst day.",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      duration_seconds: 425,
      guest_id: p["daniel-mensah"],
      story_id: storyId["sample-building-for-clinics-with-no-internet"],
      series_id: s["builder-diaries"],
      chapters: [
        { start: 0, title: "Intro" },
        { start: 60, title: "The cyber café years" },
        { start: 200, title: "Why conflicts are clinical decisions" },
      ],
      show_notes_html: `<p>Daniel Mensah on building software for clinics that might not see a connection for a week.</p>${note}`,
      status: "published",
      published_at: daysAgo(4),
    },
  ], { defaultToNull: false });
  if (eErr) throw eErr;

  console.log(`added ${people.length} people, ${insertedStories.length} stories, 2 episodes`);
}

(process.argv.includes("--remove") ? remove() : add()).catch((err) => {
  console.error(err);
  process.exit(1);
});
