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

const cinematicFilms: RefVideo[] = [
  {
    id: "AP8PZeNfoeo",
    title: "A Cinematic Barbershop Commercial",
    blurb: "Short atmospheric promo — lighting, slow moves, and shop mood without heavy talk.",
    study: "Cinema: atmosphere first · Soft light · Short holds",
  },
  {
    id: "CRyB1gHZr1M",
    title: "“Barbershop” Cinematic Video (GH5 + fast lens)",
    blurb: "Shallow depth, creamy bokeh, and craft close-ups. Study what a fast lens does in a busy shop.",
    study: "Cinema: shallow focus · Detail heroes · Lens character",
  },
  {
    id: "J5oxDwuHC_0",
    title: "MADEMAN Barbershop — Blackbird Films",
    blurb: "Polished brand film — pacing, music hits, and how a shop feels “premium” on camera.",
    study: "Cinema: brand polish · Music sync · Clean brand frames",
  },
  {
    id: "U7GjXgR67k8",
    title: "Standing Ovation Barbershop Commercial",
    blurb: "Energetic commercial cut — useful contrast against Barbazza’s calmer documentary pace.",
    study: "Cinema: contrast study · Faster montage · What not to overdo",
  },
  {
    id: "JgRNAXxTpZo",
    title: "Black Rabbit Barbershop — Bushwick Brooklyn Promo",
    blurb: "Neighborhood shop promo — rooms, chairs, street energy, and local identity.",
    study: "Cinema: place identity · Shop as character · Local texture",
  },
  {
    id: "5NLbFvSaZCc",
    title: "Amazing Fades Barbershop Promo",
    blurb: "Fade-forward promo language — transformations, clipper work, reveal moments.",
    study: "Cinema: before/after energy · Clipper motion · Reveal timing",
  },
  {
    id: "yHpwpFoN_kg",
    title: "Fade Factory Barbershop × J Visuals",
    blurb: "Modern fade-house promo — gimbal moves, transitions, and social-ready pacing.",
    study: "Cinema: gimbal flow · Transition ideas · Social pace",
  },
  {
    id: "eOZhzUq_Ipg",
    title: "The Barbershop Diaries (Documentary)",
    blurb: "Diary-style shop life — conversation, chairs, and daily rhythm beyond a single cut.",
    study: "Cinema: vérité day · Conversation under picture · Daily rhythm",
  },
  {
    id: "YGvrmRE9SG4",
    title: "Primo Barbershop — Tips on Filming a Promo (BTS)",
    blurb: "Behind the scenes of a shop promo: mist filters, low angles, calm-to-intense cut pattern.",
    study: "Cinema: how they shot it · Mist bloom · Angle power",
  },
  {
    id: "Wty92BC45Zg",
    title: "How I Edit Smooth Transitions — Barbershop B-roll Walkthrough",
    blurb: "Edit lesson on cape wipes, motion match, and seamless shop B-roll assemblies.",
    study: "Cinema: transition craft · B-roll assembly · Match cuts",
  },
  {
    id: "TIoWlaQ_BNU",
    title: "How I Shot a Cinematic Barber Video (Bupek)",
    blurb: "Full breakdown: atmosphere with audio, film-look grade, in-camera transitions, shot variety.",
    study: "Cinema: audio atmosphere · Grade look · Shot planning",
  },
  {
    id: "EBvMh2V0-kU",
    title: "Beyond The Fade — Mos Faded (also in tone board)",
    blurb: "Short craft identity film — useful again here for pure cinematic shop atmosphere.",
    study: "Cinema: craft identity · Short form · Shop mood",
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
  {
    id: "5NLbFvSaZCc",
    title: "Amazing Fades — craft-forward promo cuts",
    blurb: "Extra craft reference for fade reveals and tool motion inside a cinematic promo.",
    study: "Craft: fade reveal · Tool motion inside a promo",
  },
  {
    id: "yHpwpFoN_kg",
    title: "Fade Factory — modern fade house cuts",
    blurb: "Modern fade pacing and chair energy for Barbazza B-roll ideas.",
    study: "Craft: modern fade pace · Chair energy",
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
          <a href="#chair">Chair cam</a>
          <a href="#edit">Editing</a>
          <a href="#inspire">Tone</a>
          <a href="#cinematic">Cinema</a>
          <a href="#music">Music</a>
        </nav>
        <a href="https://www.thebarbazza.com/book">Book a chair</a>
      </header>

      <main className="ydoc-sheet">
        <header className="ydoc-cover">
          <p className="ydoc-cover-meta">
            <span>Internal production document</span>
            <span>Version 1.4</span>
            <span>Runtime target: 4–5 minutes</span>
          </p>
          <h1>
            BARBAZZA — YEAR ONE
            <em>More than a cut. A documentary production brief.</em>
          </h1>
          <p className="ydoc-cover-summary">
            This is the working document for Barbazza’s first-anniversary film: a calm, cinematic short about
            building a barbershop in Ubutare, Kigali — the vision, the numbers, the hard days, the team, and what
            comes next. <strong>You are the only person on camera</strong>: voiceover plus seated chair-to-camera
            pieces. Shop and craft appear as B-roll only. This document holds the VO, your on-camera talking scripts,
            shot plan, brand look, and reference films.
          </p>
          <div className="ydoc-cover-grid">
            <div>
              <strong>Title</strong>
              Barbazza — Year One. More than a cut.
            </div>
            <div>
              <strong>Form</strong>
              You only on camera · VO + chair-to-camera · shop B-roll
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
              One year ago we had a dream. Today we have a story.
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
              <a href="#chair">
                5. Chair-to-camera scripts (you only) <span>p.05</span>
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
              <a href="#cinematic">
                10. Barbershop cinematic videos <span>p.10</span>
              </a>
            </li>
            <li>
              <a href="#edit-films">
                11. Editing masterclasses <span>p.11</span>
              </a>
            </li>
            <li>
              <a href="#music">
                12. Instrumental beds <span>p.12</span>
              </a>
            </li>
            <li>
              <a href="#craft">
                13. Barbershop craft &amp; cuts <span>p.13</span>
              </a>
            </li>
            <li>
              <a href="#reading">
                14. Reading &amp; further links <span>p.14</span>
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
            Creative rule: do not celebrate a perfect year. Celebrate what it took to reach one year. You narrate and
            appear on camera, but the craft and the shop still carry emotion through B-roll. No barber or client
            interviews in this cut — only you.
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
            Approximate runtime 4–5 minutes. Chair-to-camera clips are <strong>not one block</strong> — they drop into
            different sections of the film and mix with the VO. Timing is a guide.
          </p>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Segment</th>
                  <th>What happens</th>
                  <th>Chair-cam mix in</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0:00–0:35</td>
                  <td>Opening</td>
                  <td>Silence, door, lights, empty chairs → VO starts</td>
                  <td>None yet (B-roll + VO only)</td>
                </tr>
                <tr>
                  <td>0:35–1:15</td>
                  <td>Vision</td>
                  <td>Why the shop exists; early days</td>
                  <td>
                    <strong>Topic A</strong> mid-scene · <strong>Topic B</strong> near end
                  </td>
                </tr>
                <tr>
                  <td>1:15–2:00</td>
                  <td>Numbers</td>
                  <td>One figure at a time over craft footage</td>
                  <td>None (keep numbers clean) · optional silent face glance</td>
                </tr>
                <tr>
                  <td>2:00–3:05</td>
                  <td>Challenges</td>
                  <td>Hard days; quiet after close</td>
                  <td>
                    <strong>E</strong> then <strong>C</strong> then <strong>D</strong> (spread apart)
                  </td>
                </tr>
                <tr>
                  <td>3:05–4:05</td>
                  <td>People</td>
                  <td>Team + clients gratitude</td>
                  <td>
                    <strong>F</strong> then <strong>G</strong> · optional <strong>H</strong>
                  </td>
                </tr>
                <tr>
                  <td>4:05–4:40</td>
                  <td>Celebration</td>
                  <td>One year marked</td>
                  <td>Short look / quiet — no long talk</td>
                </tr>
                <tr>
                  <td>4:40–5:10</td>
                  <td>Next chapter</td>
                  <td>Future + close</td>
                  <td>
                    <strong>I</strong> then final <strong>J</strong> into logo
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="ydoc-note">
            Rule: never stack all chair-cam clips together. After each chair-cam piece, return to B-roll + VO for at
            least 8–15 seconds so the film breathes.
          </div>
        </section>

        <section className="ydoc-section" id="script">
          <h2>3. Full shooting script</h2>
          <p>
            This is the real cut order. Founder VO and <strong>full chair-to-camera words</strong> are written here in
            sequence (easy English). Do not dump all chair-cam in one place — follow the edit beats in each scene.
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
Not only to cut hair — to build a place in Kigali where sitting in the chair meant something.
Feeling good. Good work. A team that shows up.
We did not know every step.
We only knew the kind of shop we wanted Barbazza to be.
And this… is the story of our first year.`}</pre>
            <span className="ydoc-label">Chair-cam mix</span>
            <p>
              <strong>None.</strong> Opening is shop sound + VO only. Your face comes later so it lands harder.
            </p>
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

            <span className="ydoc-label">Edit beat 1 — CEO voiceover</span>
            <pre className="ydoc-vo">{`We wanted Barbazza to feel simple and strong — black and white, clean, and honest.
Classic cuts. Fades. Lining. Kids. Women’s styling. Braids. Nail care.
Different hands. Different chairs. One way of working.`}</pre>

            <span className="ydoc-label">Edit beat 2 — Chair-cam (you facing camera) · Topic A — Why Barbazza</span>
            <p>
              <em>Question:</em> Why did you open Barbazza — and what did you want this place to mean in Kigali?
            </p>
            <pre className="ydoc-vo">{`I did not open Barbazza only to cut hair.
I wanted a shop with a clear way of working — simple, black and white, and honest.
A place in Ubutare where someone sits down and leaves feeling good.
Different chairs. Different hands. One shop.
That was the dream.`}</pre>
            <p>→ Cut back to B-roll (early shop / chairs) for 8–15 seconds.</p>

            <span className="ydoc-label">Edit beat 3 — CEO voiceover</span>
            <pre className="ydoc-vo">{`Starting was more than big dreams.
It meant learning the business while the doors were already open.
Building a team. A good name people could trust in Ubutare.
None of that happens in one week.`}</pre>

            <span className="ydoc-label">Edit beat 4 — Chair-cam (you facing camera) · Topic B — Fear / beginning</span>
            <p>
              <em>Question:</em> What were you afraid of when you started?
            </p>
            <pre className="ydoc-vo">{`When we started, I was afraid of what I did not know.
Not having every answer.
Building a team while the doors were already open.
Big dreams are easy. Doing good work every day is the hard part.`}</pre>
            <p>→ Cape on a client → clipper sound → into numbers (Scene 3).</p>
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
            <pre className="ydoc-vo">{`One year later, you can see the work in the numbers.
Eight thousand eight hundred forty-five services.
Three hundred twenty-eight days we opened the doors.
About twenty-seven people in the chair each day.
Eleven barbers have been part of this story — nine still with us.
From about thirty services in our first days…
to more than one thousand in our best month.
Behind every number is a talk, a haircut, a reason someone came back.
The numbers show how far we have come.
They do not show how hard it was.`}</pre>
            <span className="ydoc-label">Chair-cam mix</span>
            <p>
              <strong>No talking chair-cam here.</strong> Keep numbers clean. Optional: 1–2 second silent face look
              between “best month” and “Behind every number…” — no words.
            </p>
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
            <span className="ydoc-label">Edit beat 1 — CEO voiceover</span>
            <pre className="ydoc-vo">{`The part people do not see is the part that builds the shop.
Days that did not go as planned.`}</pre>

            <span className="ydoc-label">Edit beat 2 — Chair-cam · Topic E — After close</span>
            <p>
              <em>Question:</em> What does a hard day look like when the clients are gone?
            </p>
            <pre className="ydoc-vo">{`After we close, the shop gets quiet.
That is when you feel the day —
the numbers, the team, the things you still have to fix.
Building a business is not only the busy floor.
It is the choices you make when the chairs are empty.`}</pre>
            <p>→ B-roll of empty chairs / cleaning for 8–15 seconds.</p>

            <span className="ydoc-label">Edit beat 3 — CEO voiceover</span>
            <pre className="ydoc-vo">{`Choices that kept us awake at night.
Times we had to keep our quality high when it would have been easier to let it go.`}</pre>

            <span className="ydoc-label">Edit beat 4 — Chair-cam · Topic C — Hardest decision</span>
            <p>
              <em>Question:</em> What decision this year was the hardest — and why?
            </p>
            <pre className="ydoc-vo">{`The hardest choices were the ones nobody sees.
About people. About quality. About money and time.
When it would have been easier to let things slide — and we did not.
Those choices cost sleep. They also built Barbazza.`}</pre>
            <p>→ Quiet B-roll again (do not jump straight to next chair-cam).</p>

            <span className="ydoc-label">Edit beat 5 — CEO voiceover</span>
            <pre className="ydoc-vo">{`We got things wrong. We fixed them. We stayed honest about the work.
Growing is not always easy.
For Barbazza, we had to grow.`}</pre>

            <span className="ydoc-label">Edit beat 6 — Chair-cam · Topic D — What you got wrong</span>
            <p>
              <em>Question:</em> What did you get wrong in year one?
            </p>
            <pre className="ydoc-vo">{`We got things wrong.
I got things wrong.
Timing. What I expected. How long it takes for a team to grow together.
The point is not pretending it was perfect.
The point is we fixed things — and we stayed honest about the work.`}</pre>
            <p>→ Hold silence → Scene 5.</p>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 5</span>
              <span>3:05–4:05</span>
            </div>
            <h3>The people — “We didn’t build this alone”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>B-roll of the shop floor, chairs, finishes, busy moments</li>
              <li>You on the chair facing camera only for the thank-you pieces below</li>
              <li>No other talking heads</li>
            </ul>
            <span className="ydoc-label">Edit beat 1 — CEO voiceover</span>
            <pre className="ydoc-vo">{`If this year has one truth, it is the people.
Barbazza was never going to be one person.
It takes barbers who care about good work.`}</pre>
            <p>→ Short B-roll of barbers working.</p>

            <span className="ydoc-label">Edit beat 2 — Chair-cam · Topic F — Thank the team</span>
            <p>
              <em>Question:</em> What do you want to say to the barbers and the shop team?
            </p>
            <pre className="ydoc-vo">{`To every barber who worked a chair this year — thank you.
Skill matters. Showing up matters more.
Barbazza is not one person.
It is people who care about the work when nobody is filming.`}</pre>
            <p>→ More floor B-roll for 8–15 seconds.</p>

            <span className="ydoc-label">Edit beat 3 — CEO voiceover</span>
            <pre className="ydoc-vo">{`Clients who trust us with their time and how they look.
A team that opens early, stays late, and keeps the shop strong.
To our barbers — thank you for the work, every day.
To everyone who walked through that door, told a friend, and came back — you are part of this story.`}</pre>

            <span className="ydoc-label">Edit beat 4 — Chair-cam · Topic G — Thank the clients</span>
            <p>
              <em>Question:</em> What do clients mean to Barbazza after one year?
            </p>
            <pre className="ydoc-vo">{`To everyone who walked through that door —
who trusted us with their time and how they look —
who came back, and brought a friend —
you became part of this story.
A shop can have a name. People make it real.`}</pre>
            <p>→ Busy door / finish in the mirror.</p>

            <span className="ydoc-label">Edit beat 5 — CEO voiceover (close this chapter)</span>
            <pre className="ydoc-vo">{`A shop can have a name.
People make it real.`}</pre>

            <span className="ydoc-label">Optional edit beat — Chair-cam · Topic H — Proud of small things</span>
            <p>
              Use only if Scene 4 felt short. <em>Question:</em> What are you proud of that people outside never
              notice?
            </p>
            <pre className="ydoc-vo">{`I am proud of the small things.
Doing the same good work again and again.
The days we kept our quality high when it was hard.
The quiet work that never makes a post —
but keeps the shop strong.`}</pre>
          </article>

          <article className="ydoc-scene">
            <div className="ydoc-scene-head">
              <span>Scene 6</span>
              <span>4:05–4:40</span>
            </div>
            <h3>Celebration — “One year. We made it.”</h3>
            <span className="ydoc-label">Visuals</span>
            <ul>
              <li>Full energy B-roll; logo detail; you in the shop / on the chair</li>
              <li>Keep it intimate — not a crowd commercial</li>
            </ul>
            <span className="ydoc-label">CEO voiceover</span>
            <pre className="ydoc-vo">{`Today we celebrate one year.
One year of showing up.
One year of learning.
One year of building Barbazza in Kigali.
We are proud of what this shop has become.
And we care even more about what comes next.`}</pre>
            <span className="ydoc-label">Chair-cam mix</span>
            <p>
              <strong>No full topic here.</strong> Optional 2–3 second silent smile / look to camera between “we are
              proud” and “what comes next” — then go to Scene 7.
            </p>
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
            <span className="ydoc-label">Edit beat 1 — CEO voiceover</span>
            <pre className="ydoc-vo">{`We started with a dream.
One year later, we have a story.
We are not done.`}</pre>

            <span className="ydoc-label">Edit beat 2 — Chair-cam · Topic I — Year two</span>
            <p>
              <em>Question:</em> Where is Barbazza going in year two?
            </p>
            <pre className="ydoc-vo">{`Year two is not about being louder.
It is about being clearer.
Better quality. Cleaner work. A stronger team.
More people in Kigali who find their chair here.
We are not done. We are just getting started.`}</pre>
            <p>→ Walk the floor B-roll.</p>

            <span className="ydoc-label">Edit beat 3 — CEO voiceover</span>
            <pre className="ydoc-vo">{`Better quality. Cleaner work. A stronger team. More people who find their chair here.
To everyone in the first year of Barbazza — thank you.`}</pre>

            <span className="ydoc-label">Edit beat 4 — Chair-cam · Topic J — Closing (last face before logo)</span>
            <p>
              <em>Question:</em> If you had one line to leave people with, what is it?
            </p>
            <pre className="ydoc-vo">{`We started with a dream.
One year later, we have a story.
This is Barbazza.
Year one.
More than a cut.`}</pre>
            <p>→ Soft hold on your face → logo → end card.</p>

            <span className="ydoc-label">Edit beat 5 — CEO final lines under logo (optional VO under card)</span>
            <pre className="ydoc-vo">{`This is Barbazza.
Year one.
More than a cut.
And we are just getting started.`}</pre>

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
          <pre className="ydoc-vo">{`One year later, you can see the work in the numbers.
Eight thousand eight hundred forty-five services.
Three hundred twenty-eight days we opened the doors.
About twenty-seven people in the chair each day.
Eleven barbers have been part of this story — nine still with us.
From about thirty services in our first days…
to more than one thousand in our best month.
Behind every number is a talk, a haircut, a reason someone came back.
The numbers show how far we have come.
They do not show how hard it was.`}</pre>
          <div className="ydoc-note">
            Still collect off-camera: 3–5 challenges, three achievements, one memorable moment, founder lesson,
            year-two goals. Revenue can stay off the film if you prefer privacy.
          </div>
        </section>

        <section className="ydoc-section" id="chair">
          <h2>5. Chair-to-camera scripts (you only)</h2>
          <p>
            Recording cue cards. The <strong>same full words</strong> already sit inside Section 3 in cut order — use
            this section on shoot day to record each take. You are the only person on camera. Sit in the chair, face
            the lens, soft shop behind you. 20–45 seconds per topic. Easy English.
          </p>
          <div className="ydoc-note">
            How to say it: do not read word for word if it feels stiff. Learn the idea, then answer like you are
            talking to a friend. Keep 1–2 seconds of quiet at the start and end of each take. After every chair-cam
            clip in the edit, go back to B-roll + VO for 8–15 seconds — never stack all topics in one block.
          </div>

          <h3>Setup</h3>
          <ul>
            <li>Camera at eye level, medium shot (chest up) + one wider safety take</li>
            <li>You seated in the chair, still, calm — hands relaxed</li>
            <li>Look into the lens (this is the “real you” layer)</li>
            <li>Record VO separately — quieter, storytelling energy</li>
          </ul>

          <h3>Where each topic goes in the video</h3>
          <div className="ydoc-table-wrap">
            <table className="ydoc-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Film section</th>
                  <th>When to cut it in</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A — Why</td>
                  <td>Scene 2 · Vision</td>
                  <td>Mid-scene, after “clean and honest”</td>
                </tr>
                <tr>
                  <td>B — Fear</td>
                  <td>Scene 2 · Vision</td>
                  <td>Near end, before numbers</td>
                </tr>
                <tr>
                  <td>C — Hardest choice</td>
                  <td>Scene 4 · Challenges</td>
                  <td>Middle of hard section</td>
                </tr>
                <tr>
                  <td>D — Got wrong</td>
                  <td>Scene 4 · Challenges</td>
                  <td>Near end of hard section</td>
                </tr>
                <tr>
                  <td>E — After close</td>
                  <td>Scene 4 · Challenges</td>
                  <td>Start of hard section (first)</td>
                </tr>
                <tr>
                  <td>F — Team</td>
                  <td>Scene 5 · People</td>
                  <td>After “not one person”</td>
                </tr>
                <tr>
                  <td>G — Clients</td>
                  <td>Scene 5 · People</td>
                  <td>After client VO lines</td>
                </tr>
                <tr>
                  <td>H — Proud (optional)</td>
                  <td>Scene 5 · People</td>
                  <td>Only if Scene 4 felt short</td>
                </tr>
                <tr>
                  <td>I — Year two</td>
                  <td>Scene 7 · Next</td>
                  <td>After “We are not done”</td>
                </tr>
                <tr>
                  <td>J — Closing</td>
                  <td>Scene 7 · Next</td>
                  <td>Last face before logo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Topic A — Why Barbazza exists · goes in Scene 2</h3>
          <p>
            <strong>Question you are answering:</strong> Why did you open Barbazza — and what did you want this place
            to mean in Kigali?
          </p>
          <pre className="ydoc-vo">{`I did not open Barbazza only to cut hair.
I wanted a shop with a clear way of working — simple, black and white, and honest.
A place in Ubutare where someone sits down and leaves feeling good.
Different chairs. Different hands. One shop.
That was the dream.`}</pre>

          <h3>Topic B — The beginning / fear · goes in Scene 2</h3>
          <p>
            <strong>Question:</strong> What were you afraid of when you started?
          </p>
          <pre className="ydoc-vo">{`When we started, I was afraid of what I did not know.
Not having every answer.
Building a team while the doors were already open.
Big dreams are easy. Doing good work every day is the hard part.`}</pre>

          <h3>Topic C — Hardest decision · goes in Scene 4</h3>
          <p>
            <strong>Question:</strong> What decision this year was the hardest — and why?
          </p>
          <pre className="ydoc-vo">{`The hardest choices were the ones nobody sees.
About people. About quality. About money and time.
When it would have been easier to let things slide — and we did not.
Those choices cost sleep. They also built Barbazza.`}</pre>

          <h3>Topic D — What you got wrong · goes in Scene 4</h3>
          <p>
            <strong>Question:</strong> What did you get wrong in year one?
          </p>
          <pre className="ydoc-vo">{`We got things wrong.
I got things wrong.
Timing. What I expected. How long it takes for a team to grow together.
The point is not pretending it was perfect.
The point is we fixed things — and we stayed honest about the work.`}</pre>

          <h3>Topic E — The days people don’t see · goes in Scene 4 (first)</h3>
          <p>
            <strong>Question:</strong> What does a hard day look like when the clients are gone?
          </p>
          <pre className="ydoc-vo">{`After we close, the shop gets quiet.
That is when you feel the day —
the numbers, the team, the things you still have to fix.
Building a business is not only the busy floor.
It is the choices you make when the chairs are empty.`}</pre>

          <h3>Topic F — The team · goes in Scene 5</h3>
          <p>
            <strong>Question:</strong> What do you want to say to the barbers and the shop team?
          </p>
          <pre className="ydoc-vo">{`To every barber who worked a chair this year — thank you.
Skill matters. Showing up matters more.
Barbazza is not one person.
It is people who care about the work when nobody is filming.`}</pre>

          <h3>Topic G — The clients · goes in Scene 5</h3>
          <p>
            <strong>Question:</strong> What do clients mean to Barbazza after one year?
          </p>
          <pre className="ydoc-vo">{`To everyone who walked through that door —
who trusted us with their time and how they look —
who came back, and brought a friend —
you became part of this story.
A shop can have a name. People make it real.`}</pre>

          <h3>Topic H — What you’re proud of · optional in Scene 5</h3>
          <p>
            <strong>Question:</strong> What are you proud of that people outside never notice?
          </p>
          <pre className="ydoc-vo">{`I am proud of the small things.
Doing the same good work again and again.
The days we kept our quality high when it was hard.
The quiet work that never makes a post —
but keeps the shop strong.`}</pre>

          <h3>Topic I — Year two · goes in Scene 7</h3>
          <p>
            <strong>Question:</strong> Where is Barbazza going in year two?
          </p>
          <pre className="ydoc-vo">{`Year two is not about being louder.
It is about being clearer.
Better quality. Cleaner work. A stronger team.
More people in Kigali who find their chair here.
We are not done. We are just getting started.`}</pre>

          <h3>Topic J — Closing to camera · goes in Scene 7 (last face)</h3>
          <p>
            <strong>Question:</strong> If you had one line to leave people with, what is it?
          </p>
          <pre className="ydoc-vo">{`We started with a dream.
One year later, we have a story.
This is Barbazza.
Year one.
More than a cut.`}</pre>

          <h3>Suggested full-film edit order (VO ↔ chair-cam)</h3>
          <pre className="ydoc-vo">{`Scene 1  Opening          → B-roll + VO only
Scene 2  Vision           → VO → Topic A → B-roll → VO → Topic B → into numbers
Scene 3  Numbers          → VO + numbers on screen (no chair talk)
Scene 4  Challenges       → VO → Topic E → B-roll → VO → Topic C → B-roll → VO → Topic D
Scene 5  People           → VO → Topic F → B-roll → VO → Topic G → (optional Topic H)
Scene 6  Celebration      → VO + B-roll (optional silent look)
Scene 7  Next / close     → VO → Topic I → walk floor → Topic J → logo + end card`}</pre>
          <p>
            Final tip: keep about <strong>6–8 chair-cam clips</strong> in the finished film (not every take). Pick the
            most honest ones. Face-to-camera should feel special — not constant.
          </p>
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
              <strong>Chair-to-camera (you):</strong> seated facing lens, soft light, fixed camera, clean lav or boom.
              Record Topics A–J as separate takes.
            </li>
            <li>
              <strong>Natural shop B-roll:</strong> prep, craft, floor energy — faces optional; no other talking heads.
            </li>
            <li>
              <strong>Founder presence:</strong> walking in, observing empty chairs, after-close stillness, plus the
              chair-cam set.
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
            <li>Chair-cam set ready (one chair, soft key, quiet shop)</li>
            <li>Printed Topic A–J cue cards (questions + key lines)</li>
            <li>Early footage folder (or honest recreations plan)</li>
            <li>Uniform / cape / logo continuity for brand B-roll</li>
            <li>End-card text proofed (address, phone, domain)</li>
          </ul>
        </section>

        <section className="ydoc-section" id="edit">
          <h2>8. Editing strategy (Barbazza Year One)</h2>
          <p>
            Cut the film like a radio documentary first, then dress it with pictures. If the story works with only
            your VO + chair-cam selects, the picture edit will be stronger.
          </p>
          <h3>Order of work</h3>
          <ol>
            <li>
              <strong>Lock VO + chair-cam selects</strong> — pick 4–7 best takes; keep natural breaths after big lines.
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
            <li>If a chair-cam take runs long, cut to B-roll under your continuing audio — don’t jump-cut your face.</li>
            <li>Numbers: one figure on screen at a time; 2–3 seconds minimum; no flashy kinetic type.</li>
            <li>Never use jump-cut talking-head energy — this is not a vlog. Hold your face; cut the picture around it.</li>
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

        <section className="ydoc-section" id="cinematic">
          <h2>10. Barbershop cinematic videos</h2>
          <p>
            Extra cinematic shop films and promos — lighting, camera moves, atmosphere, and B-roll language. Play on
            this page. Steal mood and craft, not logos or copycat edits. Barbazza stays calmer than the fastest promos.
          </p>
          <ResourceBlock
            heading="Cinematic shop atmosphere (many embeds)"
            intro="Commercials, promos, BTS, and diary films to fill the look board. Watch several — note light, lens, and how long they hold a shot."
            items={cinematicFilms}
          />
        </section>

        <section className="ydoc-section" id="edit-films">
          <h2>11. Editing masterclasses</h2>
          <ResourceBlock
            heading="How editors build tone and structure"
            intro="Play these while planning the timeline. Translate lessons into the Barbazza chapter map above."
            items={editingFilms}
          />
        </section>

        <section className="ydoc-section" id="music">
          <h2>12. Instrumental beds (listen on-page)</h2>
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
                  <td>Duck hard under chair-cam speech</td>
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
          <h2>13. Barbershop craft &amp; cuts</h2>
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
          <h2>14. Reading &amp; further links</h2>
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
