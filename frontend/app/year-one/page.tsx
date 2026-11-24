import Link from "next/link";
import "./year-one.css";

type RefVideo = { id: string; title: string; blurb: string; study: string };

const toneFilms: RefVideo[] = [
  {
    id: "28OYtRKo1PQ",
    title: "The Belmont Barbershop",
    blurb: "Small Business Revolution Story #35 — classic shop, community, and ownership without hype.",
    study: "Tone: calm · Shop sound under VO · Honest owner interview",
  },
  {
    id: "1amOPUn49aM",
    title: "The Barber of Little Rock",
    blurb: "Oscar-nominated New Yorker short — purpose beyond the cut, teaching, and community building.",
    study: "Tone: purposeful · Craft as teaching · Documentary restraint",
  },
  {
    id: "G0RbgK1r21Y",
    title: "Schorem Barbers — Extended Documentary",
    blurb: "Rotterdam identity film — how personality, brotherhood, and brand attitude become the story.",
    study: "Tone: bold identity · Character-led · Brand as culture",
  },
  {
    id: "1gPmgIt9524",
    title: "Mr. Moore’s Barber Shop",
    blurb: "Generational neighborhood trust — quiet pride, memory, and the shop as community hub.",
    study: "Tone: warm archive feel · Interview intimacy · Legacy",
  },
  {
    id: "EBvMh2V0-kU",
    title: "Beyond The Fade — Mos Faded Barbershop",
    blurb: "Short barbershop documentary focused on craft identity and the world around the fade.",
    study: "Tone: modern craft short · Shop atmosphere",
  },
  {
    id: "HrVWXYMbCrQ",
    title: "The Brisbane Barber Who Built a Legacy",
    blurb: "Award-winning short documentary about building a barber legacy over time.",
    study: "Tone: legacy story · Anniversary-adjacent structure",
  },
  {
    id: "OVzhcmGRDL0",
    title: "Miguel’s Riverside Barber Shop — Sneak Peek",
    blurb: "Small Business Revolution Main Street sneak peek — short, story-led barbershop framing.",
    study: "Tone: compact story open · Main-street energy",
  },
  {
    id: "YSu6ro2YDWI",
    title: "More Than a Barber — Col.BeeCutz journey",
    blurb: "Long-form conversation on growth, criticism, craft, and becoming known for the chair.",
    study: "Tone: growth interview · Human stakes · Career arc",
  },
];

const editingFilms: RefVideo[] = [
  {
    id: "ZcIVl01h14Y",
    title: "What Really Makes a Great Documentary",
    blurb: "Tone, scene emotion, pacing choices, and why structure beats camera gear.",
    study: "Edit: build tone per scene · Slow for hard truth · Fast for energy",
  },
  {
    id: "U0YLUnga_2g",
    title: "How to Make a Documentary (12-Step Process)",
    blurb: "Assembly → rough → fine cut, then music/sound/color. Practical post-production order.",
    study: "Edit: radio cut first · Then B-roll · Music last",
  },
  {
    id: "vUIwB7i-6IQ",
    title: "How Editors Shape Story Without Film School",
    blurb: "Interview compression, B-roll flow, multi-tempo pacing, hooks and resolves.",
    study: "Edit: dialog assemblies · Shot flow · Tempo as emotion",
  },
];

const musicFilms: RefVideo[] = [
  {
    id: "WRZmZVPzMeQ",
    title: "Cinematic Piano — URANO (Alex-Productions)",
    blurb: "No-copyright cinematic piano bed. Study soft build, space under VO, and restrained emotion.",
    study: "Music: opening / vision bed · Duck under speech",
  },
  {
    id: "zgc2m-lr2RI",
    title: "Cinematic Inspirational Piano — Wonders",
    blurb: "Inspirational piano without trailer drums — useful for people / celebration chapters.",
    study: "Music: people & celebration · Warm lift",
  },
  {
    id: "U_-kPnM1lnE",
    title: "Inspiring Ambient Piano — Power of Moments",
    blurb: "Ambient piano with soft pulse. Good reference for modern calm documentary beds.",
    study: "Music: ambient documentary · Numbers / transitions",
  },
];

const craftFilms: RefVideo[] = [
  {
    id: "Oikttlsj0OY",
    title: "Fade style — Barber Shop NOR (Japan)",
    blurb: "Haircut, shaving, shampoo, ASMR craft detail. Study hands, clippers, and quiet precision.",
    study: "Craft: detail B-roll · Clipper texture · Finish ritual",
  },
  {
    id: "WkEPU_xyuvI",
    title: "ASMR Barber Buzz Cut & Fade Transformation",
    blurb: "Satisfying fade transformation sounds — useful for sound-design reference of a real cut.",
    study: "Craft: sound of the cut · Transformation arc",
  },
  {
    id: "dzvPF3Z9wqI",
    title: "Real Men’s Haircut — Clipper, Fade, Beard (No Talking)",
    blurb: "No-talk craft film. Watch how silence + tools carry the entire scene.",
    study: "Craft: silence as soundtrack · Pure process",
  },
  {
    id: "1XkAGR_JO54",
    title: "Sharp, Clean, Quiet — Japanese Fade Experience",
    blurb: "Full fade experience with clear chapters: scissors, clipper fade, wash, finish.",
    study: "Craft: chaptered cut · Clean transitions · Ritual pace",
  },
];

function VideoBlock({ id, title, blurb, study }: RefVideo) {
  return (
    <div className="ydoc-video">
      <div className="ydoc-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="ydoc-video-caption">
        <strong>{title}</strong>
        <p>{blurb}</p>
        <p className="ydoc-study">{study}</p>
      </div>
    </div>
  );
}

function ResourceBlock({ heading, intro, items }: { heading: string; intro: string; items: RefVideo[] }) {
  return (
    <>
      <h3>{heading}</h3>
      <p>{intro}</p>
      {items.map((video) => (
        <VideoBlock key={video.id} {...video} />
      ))}
    </>
  );
}

export default function YearOneDocumentPage() {
  return (
    <div className="ydoc">
      <header className="ydoc-topbar">
        <Link href="/">Barbazza</Link>
        <nav aria-label="Document sections">
          <a href="#concept">Concept</a>
          <a href="#script">Script</a>
          <a href="#edit">Editing</a>
          <a href="#inspire">Resources</a>
          <a href="#music">Music</a>
          <a href="#craft">Craft</a>
        </nav>
        <a href="https://www.thebarbazza.com/book">Book a chair</a>
      </header>

      <main className="ydoc-sheet">
        <header className="ydoc-cover">
          <p className="ydoc-cover-meta">
            <span>Internal production document</span>
            <span>Version 1.0</span>
            <span>Runtime target: 4–5 minutes</span>
          </p>
          <h1>
            BARBAZZA — YEAR ONE
            <em>More than a cut. A documentary production brief.</em>
          </h1>
          <p className="ydoc-cover-summary">
            This is the working document for Barbazza’s first-anniversary film: a calm, cinematic short about
            building a barbershop in Ubutare, Kigali — the vision, the numbers, the hard days, the team, and what
            comes next. It is not an advertisement deck. It is the script, shot plan, interview guide, brand look,
            and reference films for production.
          </p>
          <div className="ydoc-cover-grid">
            <div>
              <strong>Title</strong>
              Barbazza — Year One. More than a cut.
            </div>
            <div>
              <strong>Form</strong>
              Founder VO + barber/client interviews + shop vérité
            </div>
            <div>
              <strong>Place</strong>
              186 KK 31 Ave, Ubutare, Kigali
            </div>
            <div>
              <strong>Look</strong>
              Craft in black &amp; white · bold stripes · quiet paper/ink
            </div>
            <div>
              <strong>Central line</strong>
              One year ago we had a vision. Today we have a story.
            </div>
            <div>
              <strong>Contact</strong>
              +250 791 345 455 · thebarbazza.com
            </div>
          </div>
        </header>

        <nav className="ydoc-toc" aria-label="Table of contents">
          <h2>Contents</h2>
          <ol>
            <li>
              <a href="#concept">
                1. Concept &amp; intention <span>p.01</span>
              </a>
            </li>
            <li>
              <a href="#structure">
                2. Film structure <span>p.02</span>
              </a>
            </li>
            <li>
              <a href="#script">
                3. Full shooting script <span>p.03</span>
              </a>
            </li>
            <li>
              <a href="#numbers">
                4. Numbers to collect <span>p.04</span>
              </a>
            </li>
            <li>
              <a href="#interviews">
                5. Interview guide <span>p.05</span>
              </a>
            </li>
            <li>
              <a href="#look">
                6. Visual &amp; brand language <span>p.06</span>
              </a>
            </li>
            <li>
              <a href="#produce">
                7. Production notes <span>p.07</span>
              </a>
            </li>
            <li>
              <a href="#edit">
                8. Editing strategy <span>p.08</span>
              </a>
            </li>
            <li>
              <a href="#inspire">
                9. Tone &amp; inspiration films <span>p.09</span>
              </a>
            </li>
            <li>
              <a href="#edit-films">
                10. Editing masterclasses <span>p.10</span>
              </a>
            </li>
            <li>
              <a href="#music">
                11. Instrumental beds <span>p.11</span>
              </a>
            </li>
            <li>
              <a href="#craft">
                12. Barbershop craft &amp; cuts <span>p.12</span>
              </a>
            </li>
            <li>
              <a href="#reading">
                13. Reading &amp; further links <span>p.13</span>
              </a>
            </li>
          </ol>
        </nav>

        <section className="ydoc-section" id="concept">
          <h2>1. Concept &amp; intention</h2>
          <p>
            Barbazza is one year old. The film should feel like a short documentary about building something from
            almost nothing: ambition, discipline, mistakes, brotherhood, craft, and the people behind the chairs. It
            should make clients proud to be part of Barbazza, make every barber feel valued, and show the human side
            of the business — not only the haircut.
          </p>
          <div className="ydoc-note">
            Creative rule: do not celebrate a perfect year. Celebrate what it took to reach one year. The founder
            narrates the vision, but is not the hero. The chairs, the clients, and the daily work carry the film.
          </div>
          <p>
            Working title options considered: <em>One Year. One Vision. A Thousand Stories.</em> ·{" "}
            <em>The First Chapter.</em> · <em>Built Through the Struggle.</em> · <em>More Than a Barbershop.</em>
            Recommended lock: <strong>BARBAZZA — YEAR ONE. MORE THAN A CUT.</strong>
          </p>
          <p>
            Tone: calm, precise, Kigali-rooted. Language from the brand: chairs, craft, black &amp; white, book your
            chair, intention. Avoid corporate filler and fake numbers.
          </p>
        </section>

        <section className="ydoc-section" id="structure">
          <h2>2. Film structure</h2>
          <p>
            Approximate runtime 4–5 minutes. Timing is a guide. Authenticity and emotion outrank a forced clock.
          </p>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Segment</th>
                  <th>What the viewer experiences</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0:00–0:35</td>
                  <td>Opening</td>
                  <td>Silence, door, lights, clippers, empty chairs, founder enters</td>
                </tr>
                <tr>
                  <td>0:35–1:15</td>
                  <td>Vision</td>
                  <td>Why Barbazza was built; early days; house standard</td>
                </tr>
                <tr>
                  <td>1:15–2:00</td>
                  <td>Numbers</td>
                  <td>Real milestones, one figure at a time, over craft footage</td>
                </tr>
                <tr>
                  <td>2:00–3:05</td>
                  <td>Challenges</td>
                  <td>Hard decisions, quiet after close, honest interviews</td>
                </tr>
                <tr>
                  <td>3:05–4:05</td>
                  <td>People</td>
                  <td>Team, clients, gratitude; strongest 5–15s soundbites</td>
                </tr>
                <tr>
                  <td>4:05–4:40</td>
                  <td>Celebration</td>
                  <td>One year marked without becoming a party commercial</td>
                </tr>
                <tr>
                  <td>4:40–5:10</td>
                  <td>Next chapter</td>
                  <td>Final VO, logo, end card with address and contact</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="ydoc-section" id="script">
          <h2>3. Full shooting script</h2>
          <p>
            Founder voiceover is written in first person. Leave room for silence and natural shop sound. Do not rush
            the VO over every frame.
          </p>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 1</span>
              <span>0:00–0:35 · Minimal music</span>
            </div>
            <h3>The opening — “A year ago…”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Black screen → door opening → lights on</li>
              <li>Clippers plugged in; cape shaken; tools cleaned</li>
              <li>Empty chairs before the rush; founder walking in from behind</li>
              <li>No talking for the first beats — only natural sound</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`A year ago, we opened a door on KK 31 Avenue.
Not just to cut hair — to build a place in Kigali where the chair meant something.
Confidence. Craft. A team that shows up.
We didn’t know every step.
We only knew the standard we wanted Barbazza to hold.
And this… is the story of our first year.`}</pre>
            <p>Hold two seconds. Soft music enters. On-screen: BARBAZZA · YEAR ONE.</p>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 2</span>
              <span>0:35–1:15</span>
            </div>
            <h3>The beginning — “We didn’t know everything”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Early photos/video; setup; first clients; first chairs</li>
              <li>Barbers preparing stations; branding in black &amp; white</li>
              <li>If recreating early moments, do not present them as archive</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`We wanted Barbazza to feel like craft in black and white — clean, intentional, honest.
Classic cuts. Fades. Lining. Kids. Women’s styling. Braids. Nail care.
Different hands. Different chairs. One house standard.
Starting meant more than ambition.
It meant learning the business while we were already open.
Building a team. A culture. A name people could trust in Ubutare.
None of that happens in a week.`}</pre>
            <p>Transition: cape on a client → clipper sound → into numbers.</p>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 3</span>
              <span>1:15–2:00</span>
            </div>
            <h3>One year in numbers — “The impact”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Large, quiet typography over real shop footage</li>
              <li>One number at a time; 2–3 seconds each; no flashy motion</li>
            </ul>
            <span className="ydoc-label">CEO voiceover (locked from live DB — Nov 2026)</span>
            <pre className="ydoc-vo">{`One year later, the work has a shape.
Eight thousand eight hundred forty-five services.
Three hundred twenty-eight days we opened the doors.
An average of twenty-seven chairs a day.
Eleven barbers who have been part of this journey — nine still holding the house.
From thirty services in our first recorded days…
to over a thousand in our strongest month.
Behind every number is a conversation, a finish, a reason someone returned.
The numbers show how far we’ve come.
They don’t show what it took.`}</pre>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 4</span>
              <span>2:00–3:05 · Emotional core</span>
            </div>
            <h3>The challenges — “The part you don’t see”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>After close; quiet shop; cleaning stations; stock count</li>
              <li>Founder alone near the entrance; focused cuts; team meeting</li>
              <li>No staged sadness — keep it real</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`The part people don’t see is the part that builds the place.
Days that didn’t go to plan.
Decisions that cost sleep.
Standards we had to hold when it would have been easier to lower them.
We got things wrong. We adjusted. We kept the chairs honest.
Growth isn’t always comfortable.
For Barbazza, it was necessary.`}</pre>
            <p>Intercut short interview answers (5–12 seconds). Keep pauses and breath.</p>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 5</span>
              <span>3:05–4:05</span>
            </div>
            <h3>The people — “We didn’t build this alone”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Barbers helping each other; clients arriving; finish in the mirror</li>
              <li>Busy floor; manager/cleaner moments if they consent</li>
              <li>Soft group energy — not a commercial smile reel</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`If this year has one truth, it’s the people.
Barbazza was never going to be one person.
It takes barbers who protect the craft.
Clients who trust us with their time and their look.
A team that opens early, stays late, and holds the house together.
To our chairs — thank you for the work, every day.
To everyone who walked through that door, recommended a friend, and came back — you are part of this story.
A brand can have a name.
People give it life.`}</pre>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 6</span>
              <span>4:05–4:40</span>
            </div>
            <h3>Celebration — “One year. We made it.”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Full energy; logo detail; team together; founder in the shop</li>
              <li>If there is a celebration, keep it intimate</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`Today we mark one year.
One year of showing up.
One year of learning.
One year of building Barbazza in Kigali.
We’re proud of what this house has become.
We’re more interested in what it becomes next.`}</pre>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 7</span>
              <span>4:40–5:10</span>
            </div>
            <h3>Next chapter — “We’re just getting started”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Founder walks the floor → stops → looks → camera pulls back → logo → fade black</li>
            </ul>
            <span className="ydoc-label">CEO final voiceover</span>
            <pre className="ydoc-vo">{`We started with a vision.
One year later, we have a story.
We’re not done.
Higher standard. Cleaner craft. Stronger team. More people who find their chair here.
To everyone in the first chapter of Barbazza — thank you.
This is Barbazza.
Year one.
More than a cut.
And we’re just getting started.`}</pre>
            <span className="ydoc-label">Final card (hold ~4s)</span>
            <pre className="ydoc-vo">{`BARBAZZA
YEAR ONE
More than a cut.

186 KK 31 Ave, Ubutare, Kigali
thebarbazza.com
+250 791 345 455`}</pre>
          </article>
        </section>

        <section className="ydoc-section" id="numbers">
          <h2>4. Real success numbers (from Barbazza Pro DB)</h2>
          <p>
            Pulled live from production transactions as of <strong>24 Nov 2026</strong>. Source window: first recorded
            sale <strong>30 Dec 2025</strong> → latest <strong>24 Nov 2026</strong> (~11 months of logged trade;
            earliest barber hire dates <strong>29 Dec 2025</strong>).
          </p>
          <div className="ydoc-note">
            Unique / returning client counts are <strong>not reliable yet</strong> in the DB — almost all services were
            saved without a customer name (8,842 / 8,845). Do not invent a client count for the film unless you add a
            separate CRM or Google Business figure.
          </div>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Real figure</th>
                  <th>Notes for the film</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Services delivered</td>
                  <td>
                    <strong>8,845</strong>
                  </td>
                  <td>All paid transactions / chair services</td>
                </tr>
                <tr>
                  <td>Revenue (RWF)</td>
                  <td>
                    <strong>31,219,500</strong>
                  </td>
                  <td>Optional on camera — use only if you want money public</td>
                </tr>
                <tr>
                  <td>Days with sales</td>
                  <td>
                    <strong>328</strong>
                  </td>
                  <td>Out of 330 calendar days in the logged span</td>
                </tr>
                <tr>
                  <td>Avg services / open day</td>
                  <td>
                    <strong>27</strong>
                  </td>
                  <td>~95,181 RWF average revenue per open day</td>
                </tr>
                <tr>
                  <td>Peak day</td>
                  <td>
                    <strong>76 services</strong> (5 Sep 2026)
                  </td>
                  <td>Also strong: 66 on 2 Oct · 65 on 7 Aug</td>
                </tr>
                <tr>
                  <td>Barbers (all-time)</td>
                  <td>
                    <strong>11</strong>
                  </td>
                  <td>
                    <strong>9 active</strong> now
                  </td>
                </tr>
                <tr>
                  <td>Active service menu</td>
                  <td>
                    <strong>9</strong>
                  </td>
                  <td>Cuts, lining, kids, women’s, braids, nails</td>
                </tr>
                <tr>
                  <td>Unique named clients</td>
                  <td>Not usable</td>
                  <td>Names missing on nearly all tickets — skip or source elsewhere</td>
                </tr>
                <tr>
                  <td>Online bookings / ratings</td>
                  <td>0 / 0</td>
                  <td>Public booking + review tables empty in DB so far</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Month-by-month growth</h3>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Services</th>
                  <th>Revenue (RWF)</th>
                  <th>Days open</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2025-12</td>
                  <td>30</td>
                  <td>90,000</td>
                  <td>2</td>
                </tr>
                <tr>
                  <td>2026-01</td>
                  <td>566</td>
                  <td>1,939,500</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-02</td>
                  <td>628</td>
                  <td>2,210,000</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>2026-03</td>
                  <td>725</td>
                  <td>2,555,500</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-04</td>
                  <td>658</td>
                  <td>2,271,500</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>2026-05</td>
                  <td>816</td>
                  <td>2,832,000</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-06</td>
                  <td>730</td>
                  <td>2,531,500</td>
                  <td>29</td>
                </tr>
                <tr>
                  <td>2026-07</td>
                  <td>878</td>
                  <td>3,160,500</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-08</td>
                  <td>933</td>
                  <td>3,411,000</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-09</td>
                  <td>
                    <strong>1,064</strong>
                  </td>
                  <td>
                    <strong>3,734,000</strong>
                  </td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>2026-10</td>
                  <td>981</td>
                  <td>3,456,000</td>
                  <td>31</td>
                </tr>
                <tr>
                  <td>2026-11 (to 24th)</td>
                  <td>836</td>
                  <td>3,028,000</td>
                  <td>24</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Top services</h3>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Times</th>
                  <th>Revenue (RWF)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Classic Men&apos;s Cut</td>
                  <td>5,037</td>
                  <td>15,440,000</td>
                </tr>
                <tr>
                  <td>Enhanced Cut</td>
                  <td>2,334</td>
                  <td>11,724,000</td>
                </tr>
                <tr>
                  <td>Hair Lining</td>
                  <td>757</td>
                  <td>1,497,000</td>
                </tr>
                <tr>
                  <td>Kids Cut</td>
                  <td>462</td>
                  <td>916,500</td>
                </tr>
                <tr>
                  <td>Ultimate Fresh Cut</td>
                  <td>186</td>
                  <td>1,129,000</td>
                </tr>
                <tr>
                  <td>Foot Nails / Men&apos;s Braids / Women&apos;s / Hand Nails</td>
                  <td>69 combined</td>
                  <td>513,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Chairs / team (services logged)</h3>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Barber</th>
                  <th>Code</th>
                  <th>Active</th>
                  <th>Services</th>
                  <th>Revenue (RWF)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NSHIMIYIMANA Mugabo</td>
                  <td>B004</td>
                  <td>No</td>
                  <td>1,920</td>
                  <td>6,708,000</td>
                </tr>
                <tr>
                  <td>Innocent KABABA</td>
                  <td>B003</td>
                  <td>Yes</td>
                  <td>1,829</td>
                  <td>7,248,500</td>
                </tr>
                <tr>
                  <td>Eric Musabyimana</td>
                  <td>B002</td>
                  <td>Yes</td>
                  <td>1,752</td>
                  <td>6,209,000</td>
                </tr>
                <tr>
                  <td>Damascene HAKIZIMANA</td>
                  <td>B001</td>
                  <td>Yes</td>
                  <td>1,220</td>
                  <td>3,983,500</td>
                </tr>
                <tr>
                  <td>Kwizera Eric</td>
                  <td>B005</td>
                  <td>Yes</td>
                  <td>985</td>
                  <td>3,293,500</td>
                </tr>
                <tr>
                  <td>Irakoze Barbazza</td>
                  <td>B008</td>
                  <td>Yes</td>
                  <td>360</td>
                  <td>1,113,000</td>
                </tr>
                <tr>
                  <td>UWINEZA Flugency</td>
                  <td>B007</td>
                  <td>Yes</td>
                  <td>279</td>
                  <td>885,000</td>
                </tr>
                <tr>
                  <td>Kabera Bosco</td>
                  <td>B009</td>
                  <td>Yes</td>
                  <td>176</td>
                  <td>562,000</td>
                </tr>
                <tr>
                  <td>Nshimiyimana Chief</td>
                  <td>B006</td>
                  <td>No</td>
                  <td>146</td>
                  <td>472,000</td>
                </tr>
                <tr>
                  <td>Eric Hakizimana</td>
                  <td>B011</td>
                  <td>Yes</td>
                  <td>140</td>
                  <td>611,000</td>
                </tr>
                <tr>
                  <td>Noela</td>
                  <td>B010</td>
                  <td>Yes</td>
                  <td>38</td>
                  <td>134,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Suggested locked VO lines (Scene 3)</h3>
          <pre className="ydoc-vo">{`One year later, the work has a shape.
Eight thousand eight hundred forty-five services.
Three hundred twenty-eight days we opened the doors.
An average of twenty-seven chairs a day.
Eleven barbers who have been part of this journey — nine still holding the house.
From thirty services in our first recorded days…
to over a thousand in our strongest month.
Behind every number is a conversation, a finish, a reason someone returned.
The numbers show how far we’ve come.
They don’t show what it took.`}</pre>
          <div className="ydoc-note">
            Still collect off-camera: 3–5 challenges, three achievements, one memorable moment, founder lesson,
            year-two goals. Revenue can stay off the film if you prefer privacy.
          </div>
        </section>

        <section className="ydoc-section" id="interviews">
          <h2>5. Interview guide</h2>
          <p>
            Do not ask people to memorize speeches. Have a conversation. Keep the interviewer off camera. Barbers look
            slightly beside the lens. Founder may look into camera for one or two closing lines.
          </p>
          <h3>Questions for barbers</h3>
          <ul>
            <li>What has been the most difficult thing for you during this first year?</li>
            <li>What is something you had to learn the hard way?</li>
            <li>Was there a moment you felt discouraged, and what helped you keep going?</li>
            <li>What is one thing we could have done better as a team?</li>
            <li>How has Barbazza changed you as a barber or as a person?</li>
            <li>What does being part of Barbazza mean to you?</li>
          </ul>
          <h3>One angle per barber (avoid repetition)</h3>
          <ul>
            <li>
              <strong>Growth:</strong> What has changed in you since you started here?
            </li>
            <li>
              <strong>Team:</strong> What do you appreciate most about this team?
            </li>
            <li>
              <strong>Struggle:</strong> What has been the toughest moment in this journey?
            </li>
            <li>
              <strong>Craft:</strong> What have you learned about the cut that you didn’t know before?
            </li>
            <li>
              <strong>Future:</strong> Where should Barbazza be one year from now?
            </li>
          </ul>
          <h3>Questions for the founder</h3>
          <ul>
            <li>What was your biggest fear when starting Barbazza?</li>
            <li>What decision was hardest this year?</li>
            <li>What did you get wrong in year one?</li>
            <li>What did this business teach you about leadership?</li>
            <li>What moment almost made you rethink the journey?</li>
            <li>What are you proud of that people never see?</li>
          </ul>
          <h3>Questions for clients</h3>
          <ul>
            <li>Why do you choose Barbazza?</li>
            <li>What makes the experience different?</li>
            <li>How long have you been coming here?</li>
            <li>What would you tell someone who has never visited?</li>
          </ul>
          <p>Final edit: use only 3–5 strong answers total. Cut the rest.</p>
        </section>

        <section className="ydoc-section" id="look">
          <h2>6. Visual &amp; brand language</h2>
          <p>
            From Barbazza brand work: strictly black and white. Bold, straight, larger stripes for uniform and cape.
            No sports-themed decoration. The film should feel like craft on paper — ink, grain, quiet luxury.
          </p>
          <div className="ydoc-figures">
            <figure className="ydoc-figure">
              <img src="/year-one/stripe-polo.jpg" alt="Black and white striped barber polo direction" />
              <figcaption>Figure A — Uniform direction</figcaption>
            </figure>
            <figure className="ydoc-figure">
              <img src="/year-one/stripe-cape.jpg" alt="Matching striped barber cape" />
              <figcaption>Figure B — Cape language</figcaption>
            </figure>
          </div>
          <div className="ydoc-figures four">
            <figure className="ydoc-figure">
              <img src="/year-one/craft-cut.jpg" alt="Precise cut in the chair" />
              <figcaption>Craft</figcaption>
            </figure>
            <figure className="ydoc-figure">
              <img src="/year-one/twin-chairs.jpg" alt="Two barbers working" />
              <figcaption>Chairs</figcaption>
            </figure>
            <figure className="ydoc-figure">
              <img src="/year-one/tools-detail.jpg" alt="Barber tools" />
              <figcaption>Tools</figcaption>
            </figure>
            <figure className="ydoc-figure">
              <img src="/year-one/quiet-close.jpg" alt="Quiet end of day mood" />
              <figcaption>After close</figcaption>
            </figure>
          </div>
          <h3>Shot types to capture</h3>
          <ol>
            <li>
              <strong>Establishing:</strong> exterior, entrance, chairs, mirrors, signage; before open and at peak.
            </li>
            <li>
              <strong>Detail:</strong> clippers, scissors, hands, cape, reflections, finish, textures.
            </li>
            <li>
              <strong>Interviews:</strong> quiet corner, soft light, fixed camera, clean audio.
            </li>
            <li>
              <strong>Natural moments:</strong> jokes, prep, teamwork — do not over-direct.
            </li>
            <li>
              <strong>Founder:</strong> walking in, observing, sitting alone, one direct-to-camera moment.
            </li>
          </ol>
        </section>

        <section className="ydoc-section" id="produce">
          <h2>7. Production notes</h2>
          <h3>Music &amp; sound</h3>
          <ul>
            <li>
              <strong>Opening:</strong> almost silence → soft ambient / piano
            </li>
            <li>
              <strong>Vision:</strong> gentle lift
            </li>
            <li>
              <strong>Numbers:</strong> sparse, confident
            </li>
            <li>
              <strong>Challenges:</strong> low and restrained — no trailer drums
            </li>
            <li>
              <strong>People / celebration:</strong> warm rhythm
            </li>
            <li>
              <strong>Close:</strong> soft rise → fade under logo
            </li>
          </ul>
          <p>
            Shop sound is half the soundtrack. Mute music in places so clippers, door, and conversation can breathe.
          </p>
          <h3>Checklist before camera day</h3>
          <ul>
            <li>Opening date and locked numbers table</li>
            <li>Consent from every barber / client on camera</li>
            <li>Early footage folder (or honest recreations plan)</li>
            <li>Interview shortlist and quiet interview corner</li>
            <li>Uniform / cape / logo continuity for brand shots</li>
            <li>End-card text proofed (address, phone, domain)</li>
          </ul>
        </section>

        <section className="ydoc-section" id="edit">
          <h2>8. Editing strategy (Barbazza Year One)</h2>
          <p>
            Cut the film like a radio documentary first, then dress it with pictures. If the story works with only
            founder VO + interview audio, the picture edit will be stronger.
          </p>
          <h3>Order of work</h3>
          <ol>
            <li>
              <strong>Lock VO + interview selects</strong> — tighten stumbles, keep natural breaths after big lines.
            </li>
            <li>
              <strong>Radio assembly</strong> — Scene 1→7 with audio only. No B-roll yet.
            </li>
            <li>
              <strong>Picture to the line</strong> — every sentence gets a matching visual (named person/place/action),
              not a generic “barbershop vibe” shot.
            </li>
            <li>
              <strong>Pace as a curve</strong> — denser picture changes in the open; longer holds in challenges; warm
              rhythm in people; restrained close.
            </li>
            <li>
              <strong>Music last</strong> — one bed per chapter; change music when the story turns; duck 12–18 dB under
              speech; leave pure shop sound in places.
            </li>
          </ol>
          <h3>Cutting rules for this film</h3>
          <ul>
            <li>Cut on voice turns (new sentence / new idea), not on a fixed beat grid.</li>
            <li>Hold empty chairs and after-close shots longer than busy peak-hour montage.</li>
            <li>Replace talky interview stretches with B-roll when the image says more than the words.</li>
            <li>Numbers: one figure on screen at a time; 2–3 seconds minimum; no flashy kinetic type.</li>
            <li>Never use jump-cut talking-head energy — this is not a vlog.</li>
            <li>J/L cuts: let VO bridge shots so edits feel invisible.</li>
            <li>Silence before the hardest line in Scene 4 — stronger than any swell.</li>
          </ul>
          <h3>Suggested A/B pace references</h3>
          <p>
            Measure one calm reference and one slightly denser reference. Count picture changes per minute. Barbazza
            Year One should live closer to the calm side: roughly fewer, longer holds — except the cold open and busy
            shop montage.
          </p>
          <div className="ydoc-note">
            Gold standard from award short-film editing practice: hold shots longer than social media instincts allow;
            tell as much as possible through image, music, and FX — not constant speech.
          </div>
        </section>

        <section className="ydoc-section" id="inspire">
          <h2>9. Tone &amp; inspiration films</h2>
          <p>
            Watch these on this page. Do not copy shot-for-shot. Steal honesty, pacing, and how shop life feels on
            camera.
          </p>
          <ResourceBlock
            heading="Barbershop / anniversary-adjacent documentaries"
            intro="Primary tone board for Barbazza Year One — craft, community, struggle, and pride."
            items={toneFilms}
          />
        </section>

        <section className="ydoc-section" id="edit-films">
          <h2>10. Editing masterclasses</h2>
          <ResourceBlock
            heading="How editors build tone and structure"
            intro="Play these while planning the timeline. Translate lessons into the Barbazza chapter map above."
            items={editingFilms}
          />
        </section>

        <section className="ydoc-section" id="music">
          <h2>11. Instrumental beds (listen on-page)</h2>
          <p>
            These are tone references for beds under VO. Clear license/credit rules before final use. Prefer sparse
            piano / ambient over epic trailer music. Always duck under speech; sometimes mute completely for clippers.
          </p>
          <h3>Music map for Barbazza chapters</h3>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Chapter</th>
                  <th>Instrumental feel</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Opening</td>
                  <td>Near silence → soft piano enter</td>
                  <td>Let door / clippers speak first</td>
                </tr>
                <tr>
                  <td>Vision</td>
                  <td>Gentle lift, still sparse</td>
                  <td>No big drums</td>
                </tr>
                <tr>
                  <td>Numbers</td>
                  <td>Minimal pulse / ambient</td>
                  <td>Typography needs air</td>
                </tr>
                <tr>
                  <td>Challenges</td>
                  <td>Low minor / restrained</td>
                  <td>Use silence before hard lines</td>
                </tr>
                <tr>
                  <td>People</td>
                  <td>Warm piano / soft rhythm</td>
                  <td>Duck hard under interviews</td>
                </tr>
                <tr>
                  <td>Celebration / close</td>
                  <td>Soft rise → fade under logo</td>
                  <td>End clean, not triumphant bombast</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ResourceBlock
            heading="Playable instrumental references"
            intro="Listen for how much space sits under a hypothetical VO. If the track feels crowded alone, it will crush speech."
            items={musicFilms}
          />
          <div className="ydoc-note">
            More free documentary piano / ambient beds:{" "}
            <a href="https://pixabay.com/music/search/documentary%20piano/" target="_blank" rel="noreferrer">
              Pixabay — documentary piano
            </a>
            ,{" "}
            <a href="https://pixabay.com/music/search/cinematic%20ambient/" target="_blank" rel="noreferrer">
              Pixabay — cinematic ambient
            </a>
            . Always verify license before publishing.
          </div>
        </section>

        <section className="ydoc-section" id="craft">
          <h2>12. Barbershop craft &amp; cuts</h2>
          <p>
            Use these for B-roll language: hands, clipper grain, fade transitions, cape, wash, mirror reveal. Barbazza
            should shoot its own craft — these teach what to look for and how long to hold.
          </p>
          <ResourceBlock
            heading="Process, sound, and finish"
            intro="Study silence, tool texture, and the ritual of a complete cut. Steal discipline, not logos."
            items={craftFilms}
          />
        </section>

        <section className="ydoc-section" id="reading">
          <h2>13. Reading &amp; further links</h2>
          <ul>
            <li>
              <a
                href="https://www.whereweconverge.com/post/more-than-a-cut-j-styles-barber-shops-25-years-as-a-south-seattle-community-hub"
                target="_blank"
                rel="noreferrer"
              >
                More Than a Cut — J Styles Barber Shop (Converge Media)
              </a>{" "}
              — anniversary / community hub storytelling in prose.
            </li>
            <li>
              <a
                href="https://starlingproductions.com/more-than-a-cut-film/"
                target="_blank"
                rel="noreferrer"
              >
                Starling — “More Than A Cut” short film process
              </a>{" "}
              — Telly-winning edit notes: hold shots longer; tell through image, music, FX.
            </li>
            <li>
              <a
                href="https://nofilmschool.com/2015/11/how-cut-short-documentary-films-part-two-building-story-adding-b-roll"
                target="_blank"
                rel="noreferrer"
              >
                No Film School — building story &amp; adding B-roll
              </a>{" "}
              — radio edit first, then illustrate.
            </li>
            <li>
              <a
                href="https://www.kredosmedia.com/article/documentary-style-youtube-editing"
                target="_blank"
                rel="noreferrer"
              >
                Kredos — documentary-style YouTube editing
              </a>{" "}
              — chapters, matching the line, music turns.
            </li>
            <li>
              <a href="https://liveactionprojects.com/project/belmont-barbershop/" target="_blank" rel="noreferrer">
                Live Action Projects — Belmont Barbershop case
              </a>{" "}
              — black-and-white barbershop documentary approach.
            </li>
            <li>
              <a href="https://www.razatariq.com/giftedhandz" target="_blank" rel="noreferrer">
                Gifted Handz — Raza Tariq
              </a>{" "}
              — short documentary portrait of a West London barber.
            </li>
            <li>
              <a href="https://www.lasselinder.com/bashkimi-united" target="_blank" rel="noreferrer">
                Bashkimi United — Lasse Linder
              </a>{" "}
              — poetic barbershop philosophy short.
            </li>
          </ul>
        </section>

        <footer className="ydoc-end">
          <p>
            Barbazza Year One — production document ·{" "}
            <a href="https://www.thebarbazza.com">thebarbazza.com</a> ·{" "}
            <a href="https://www.thebarbazza.com/year-one">www.thebarbazza.com/year-one</a> ·{" "}
            <a href="https://year.thebarbazza.com">year.thebarbazza.com</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
