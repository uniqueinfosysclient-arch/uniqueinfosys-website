// src/components/services/TallyCapitalPage.jsx
//
// TallyCapital — partner webpage built to SOP_TCWebpage_Developer_v1.2.
// Route: /services/tally-capital
//
// SOP compliance map:
//   - TallyCapital logo displayed prominently (hero, final CTA)
//   - Approved hero headline: "Simple, Smart & Superior Financing Solution
//     Integrated within TallyPrime"
//   - 4 mandatory hero USPs: Pre-Qualified Offers for Tally Users /
//     Choose from Multiple Lenders / Check Loan Eligibility / Free Credit Score
//   - Official TallyCapital YouTube video embedded (youtu.be/4LJa6iKgrpE)
//   - Link to the official TallyCapital website
//   - Enquiries go through the homepage's existing "Send a WhatsApp"
//     CallbackCard, alongside call and email tiles
//
// Follows the existing .design-page convention used by the other
// Wave 3 pages (SupportPage, CustomizationPage, softtrade/*).
// Artwork: official TallyCapital partner graphics in /public/tallycapital/.

import { Link } from 'react-router-dom';
import { Icon, IconChip } from '../design/Icon';
import { siteConfig } from '../../config/site';
import { CallbackCard } from '../../app';

const PHONE_DISPLAY  = siteConfig.phones.sales;
const PHONE_TEL      = '+919829006111';
const LEAD_EMAIL     = siteConfig.emails.sales;
const OFFICIAL_SITE  = 'https://tallycapital.tallysolutions.com/';
const YT_ID          = '4LJa6iKgrpE';
const YT_WATCH       = 'https://youtu.be/4LJa6iKgrpE';

const IMG = {
  logo:        '/tallycapital/logo.png',
  hero:        '/tallycapital/hero.png',
  why:         '/tallycapital/why-choose.png',
  exclusive:   '/tallycapital/exclusive-lending.png',
  process:     '/tallycapital/digital-loan-process.png',
  tracking:    '/tallycapital/application-tracking.png',
  journey:     '/tallycapital/credit-journey.png',
  tips:        '/tallycapital/personalized-tips.png',
  emi:         '/tallycapital/emi-calculation.png',
  effortless:  '/tallycapital/effortless.png',
};

// Mandatory hero USPs — wording per SOP, order preserved.
const HERO_USPS = [
  { ic: 'award', label: 'Pre-Qualified Offers for Tally Users' },
  { ic: 'users', label: 'Choose from Multiple Lenders' },
  { ic: 'check', label: 'Check Loan Eligibility' },
  { ic: 'chart', label: 'Free Credit Score' },
];

// ============================================================
// Hero
// ============================================================
function Hero() {
  return (
    <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', padding: '152px 0 72px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-hero-grid">
          {/* LEFT */}
          <div>
            <img
              src={IMG.logo}
              alt="TallyCapital"
              style={{ height: 64, width: 'auto', display: 'block', marginBottom: 26 }}
            />

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--orange-soft)', color: 'var(--orange-2)',
              padding: '6px 14px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
              Powered by Tally
            </div>

            <h1 className="serif" style={{
              fontSize: 'clamp(34px, 4.6vw, 54px)', fontWeight: 600, lineHeight: 1.08,
              letterSpacing: '-0.022em', color: 'var(--ink)', marginTop: 18,
            }}>
              Simple, Smart &amp; Superior<br />Financing Solution
              <span style={{ display: 'block', color: 'var(--orange)' }}>Integrated within TallyPrime</span>
            </h1>

            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'var(--ink-soft)', marginTop: 20, maxWidth: 560 }}>
              TallyCapital changes the way businesses get business loans. No lengthy paperwork, no branch
              visits, no long waits — the books you already maintain in TallyPrime carry everything a lender
              needs to make you an offer.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
              <a href="#tc-lead" className="btn btn-primary" style={{ padding: '14px 24px' }}>
                Check Loan Eligibility <Icon name="arrow" size={15} stroke={2.2} className="arrow" />
              </a>
              <a
                href={OFFICIAL_SITE}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ padding: '14px 24px' }}
              >
                Official TallyCapital Website
              </a>
            </div>

            {/* Mandatory USPs */}
            <div className="tc-usp-row" style={{ marginTop: 34 }}>
              {HERO_USPS.map(u => (
                <div key={u.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff', border: '1px solid var(--line)', borderRadius: 12,
                  padding: '12px 14px',
                  boxShadow: '0 10px 24px -22px rgba(14,27,44,.35)',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'var(--teal-soft)', color: 'var(--teal)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Icon name={u.ic} size={15} stroke={2} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35 }}>{u.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <img src={IMG.hero} alt="TallyCapital inside TallyPrime" style={{ width: '100%', maxWidth: 560, height: 'auto' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Stat strip
// ============================================================
const STATS = [
  { n: '2 min',    l: 'To check eligibility' },
  { n: '72 hrs',   l: 'Disbursal, as fast as' },
  { n: 'Multiple', l: 'Lending partners' },
  { n: '₹0',       l: 'Cost to check your credit score' },
];

function Stats() {
  return (
    <section style={{ background: 'var(--ink)', padding: '34px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-stat-row">
          {STATS.map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 30, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', marginTop: 7, letterSpacing: '.02em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Why choose TallyCapital
// ============================================================
const WHY_POINTS = [
  { ic: 'zap',   t: 'Pre-qualified, not pre-judged', b: 'Your TallyPrime data does the talking. Offers are matched to how your business actually trades.' },
  { ic: 'users', t: 'Compare multiple lenders',      b: 'See terms side by side from a panel of lending partners and pick what suits your cash cycle.' },
  { ic: 'lock',  t: 'Your data stays yours',         b: 'Consent-based sharing only. Nothing leaves TallyPrime unless you approve it.' },
  { ic: 'sync',  t: 'No branch visits',              b: 'Eligibility, comparison, KYC and submission all happen digitally, end to end.' },
];

function WhyChoose() {
  return (
    <section style={{ background: '#fff', padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-split" style={{ alignItems: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <img src={IMG.why} alt="Why choose TallyCapital" style={{ width: '100%', maxWidth: 520, height: 'auto' }} />
          </div>
          <div>
            <div className="section-kicker">Why TallyCapital</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>
              Funding that already knows your business
            </h2>
            <p className="section-lede" style={{ marginTop: 14 }}>
              Lenders usually start from zero — statements, ledgers, months of back and forth. TallyCapital
              starts from the books you have kept all along.
            </p>
            <div style={{ display: 'grid', gap: 16, marginTop: 28 }}>
              {WHY_POINTS.map(p => (
                <div key={p.t} style={{ display: 'flex', gap: 14 }}>
                  <IconChip name={p.ic} tone="orange" size={42} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.t}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.6 }}>{p.b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// How it works — 3 steps
// ============================================================
const STEPS = [
  { n: '01', t: 'Open & check',   b: 'Open TallyPrime, press Alt + 9 and click "Check Eligibility". Your pre-qualified offers appear in about two minutes.', tag: 'Takes 2 minutes' },
  { n: '02', t: 'Compare & pick', b: 'Review offers from multiple lending partners — amount, rate, tenure, EMI — and choose the one that fits your cash flow.', tag: 'Multiple lenders' },
  { n: '03', t: 'Upload & done',  b: 'Upload basic KYC, submit the application and track it to disbursal — as fast as 72 hours.', tag: 'Fast disbursal' },
];

function HowItWorks() {
  return (
    <section style={{ background: 'var(--paper)', padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="section-kicker">How it works</div>
          <h2 className="section-title" style={{ marginTop: 10 }}>Apply in three simple steps</h2>
          <p className="section-lede" style={{ marginTop: 14 }}>
            Eligibility, comparison and disbursal — all from inside the software you already open every morning.
          </p>
        </div>

        <div className="tc-steps" style={{ marginTop: 36 }}>
          {STEPS.map(s => (
            <div key={s.n} style={{
              background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '26px 24px',
              boxShadow: '0 18px 40px -34px rgba(14,27,44,.4)',
            }}>
              <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', letterSpacing: '.1em' }}>{s.n}</div>
              <div className="serif" style={{ fontSize: 21, fontWeight: 600, color: 'var(--ink)', marginTop: 10 }}>{s.t}</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.62, marginTop: 10 }}>{s.b}</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16,
                background: 'var(--teal-soft)', color: 'var(--teal)',
                padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
              }}>
                <Icon name="check" size={11} stroke={2.4} /> {s.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="tc-split" style={{ marginTop: 56, alignItems: 'center' }}>
          <div>
            <h3 className="serif" style={{ fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
              An add-on digital loan process
            </h3>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.68, marginTop: 12, maxWidth: 520 }}>
              Eligibility checks, offer comparison, KYC and document upload run as a digital flow on top of
              TallyPrime — no forms to print, no files to courier, no queue at a branch counter.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              {['Digital KYC', 'Paperless upload', 'Consent-based data sharing', 'Status you can track'].map(t => (
                <span key={t} style={{
                  background: '#fff', border: '1px solid var(--line)', borderRadius: 999,
                  padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)',
                }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <img src={IMG.process} alt="Add-on digital loan process" style={{ width: '100%', maxWidth: 500, height: 'auto' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Funding solutions
// ============================================================
const SOLUTIONS = [
  { ic: 'coins',  t: 'Unsecured Business Loans', amt: 'Collateral-free',        b: 'For growing businesses that need working capital quickly, without pledging assets.' },
  { ic: 'boxes',  t: 'Loan Against Property',    amt: 'Higher ticket size',     b: 'Unlock the value of owned property to fund expansion or a larger working-capital cycle.' },
  { ic: 'shield', t: 'CGTMSE Loans',             amt: 'Government-backed',      b: 'Credit-guarantee backed funding for eligible micro and small enterprises.' },
  { ic: 'award',  t: 'Professional Loans',       amt: 'For CAs & professionals', b: 'Financing designed around practising Chartered Accountants and professional firms.' },
];

function Solutions() {
  return (
    <section style={{ background: '#fff', padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-split" style={{ alignItems: 'center' }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <img src={IMG.exclusive} alt="An exclusive lending solution, powered by Tally" style={{ width: '100%', maxWidth: 520, height: 'auto' }} />
          </div>
          <div>
            <div className="section-kicker">Funding solutions</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>An exclusive lending solution, powered by Tally</h2>
            <p className="section-lede" style={{ marginTop: 14 }}>
              More than one kind of funding, because businesses do not all need the same thing at the same time.
            </p>
          </div>
        </div>

        <div className="tc-sol-grid" style={{ marginTop: 40 }}>
          {SOLUTIONS.map(s => (
            <div key={s.t} style={{
              border: '1px solid var(--line)', borderRadius: 16, padding: '24px 22px', background: 'var(--bg)',
            }}>
              <IconChip name={s.ic} tone="ink" size={44} />
              <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 16 }}>
                {s.amt}
              </div>
              <div className="serif" style={{ fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginTop: 6 }}>{s.t}</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 9 }}>{s.b}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 24, lineHeight: 1.6, maxWidth: 840 }}>
          Loan amounts, interest rates and tenure are decided by the lending partner, subject to their credit
          policy, eligibility checks and documentation. TallyCapital connects you to lenders; it does not itself
          sanction or disburse the loan.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// Feature grid — illustration cards
// ============================================================
const FEATURES = [
  { img: IMG.emi,        t: 'Instant monthly EMI calculation', b: 'See the monthly outgo before you commit. Change the amount or tenure and the EMI updates with it.' },
  { img: IMG.tracking,   t: 'Application tracking & updates',  b: 'Once submitted, follow your application through review, approval and disbursal — no chasing anyone for a status.' },
  { img: IMG.journey,    t: 'Your credit journey begins here', b: 'Check your credit score free of cost, as often as you like, and watch it move as your business grows.' },
  { img: IMG.tips,       t: 'Personalised tips, just for you', b: 'Practical, business-specific pointers on what would improve your score and your chance of a better offer.' },
  { img: IMG.effortless, t: 'Effortless and efficient',        b: 'No re-keying. The data lenders ask for is already sitting in the books you maintain every day.' },
];

function Features() {
  return (
    <section style={{ background: 'var(--paper)', padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ maxWidth: 680 }}>
          <div className="section-kicker">What you get</div>
          <h2 className="section-title" style={{ marginTop: 10 }}>Built into the way you already work</h2>
          <p className="section-lede" style={{ marginTop: 14 }}>
            Every part of the borrowing experience — from the first eligibility check to the last EMI — sits
            inside TallyPrime.
          </p>
        </div>

        <div className="tc-feat-grid" style={{ marginTop: 36 }}>
          {FEATURES.map(f => (
            <div key={f.t} style={{
              background: '#fff', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 18px 40px -36px rgba(14,27,44,.4)',
            }}>
              <div style={{ background: 'var(--paper-2)', padding: '18px 18px 0', display: 'grid', placeItems: 'center' }}>
                <img src={f.img} alt="" style={{ width: '100%', maxWidth: 300, height: 'auto', display: 'block' }} />
              </div>
              <div style={{ padding: '20px 22px 24px' }}>
                <div className="serif" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{f.t}</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 8 }}>{f.b}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Video + official website
// ============================================================
function VideoSection() {
  return (
    <section style={{ background: '#fff', padding: '80px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-split" style={{ alignItems: 'center' }}>
          <div>
            <div className="section-kicker">Watch</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>TallyCapital, straight from Tally</h2>
            <p className="section-lede" style={{ marginTop: 14 }}>
              A short official walkthrough of how business financing works inside TallyPrime — eligibility,
              offers, KYC and disbursal.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <a href={OFFICIAL_SITE} target="_blank" rel="noopener noreferrer" className="btn btn-dark" style={{ padding: '13px 22px' }}>
                Visit Official Website <Icon name="arrow" size={15} stroke={2.2} className="arrow" />
              </a>
              <a href={YT_WATCH} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ padding: '13px 22px' }}>
                <Icon name="yt" size={16} stroke={1.8} /> Watch on YouTube
              </a>
            </div>
          </div>

          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16 / 9',
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)',
            boxShadow: '0 30px 60px -30px rgba(14,27,44,.4)', background: 'var(--ink)',
          }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${YT_ID}`}
              title="TallyCapital — official video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Get started — call / email tiles + the site's WhatsApp card
// ============================================================
const tileStyle = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: '#fff', border: '1px solid var(--line)', borderRadius: 14,
  padding: '14px 16px', textDecoration: 'none',
};
const tileLabel = {
  fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)',
};
const tileValue = { fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginTop: 3 };

function GetStarted() {
  return (
    <section id="tc-lead" style={{ background: 'var(--bg)', padding: '80px 0', borderBottom: '1px solid var(--line)', scrollMarginTop: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-split">
          {/* LEFT — copy */}
          <div>
            <div className="section-kicker">Get started</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>Check your eligibility with us</h2>
            <p className="section-lede" style={{ marginTop: 14 }}>
              Leave your details and our team will walk you through TallyCapital — turning it on inside your
              TallyPrime, checking eligibility, and comparing the offers you get.
            </p>

            <div style={{ display: 'grid', gap: 12, marginTop: 28, maxWidth: 440 }}>
              <a href={`tel:${PHONE_TEL}`} style={tileStyle}>
                <IconChip name="phone" tone="teal" size={40} />
                <div>
                  <div style={tileLabel}>Call our team</div>
                  <div style={tileValue}>{PHONE_DISPLAY}</div>
                </div>
              </a>
              <a href={`mailto:${LEAD_EMAIL}`} style={tileStyle}>
                <IconChip name="mail" tone="orange" size={40} />
                <div>
                  <div style={tileLabel}>Email us</div>
                  <div style={{ ...tileValue, wordBreak: 'break-all' }}>{LEAD_EMAIL}</div>
                </div>
              </a>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 22, lineHeight: 1.6, maxWidth: 460 }}>
              {siteConfig.brand} is an authorised Tally partner. Loan approval, amount and terms rest with the
              lending partner.
            </p>
          </div>

          {/* RIGHT — the same WhatsApp card as the homepage hero */}
          <CallbackCard />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Final CTA
// ============================================================
const RELATED = [
  { to: '/services/support',     t: 'Support Services',  b: 'AMC and priority support for your TallyPrime.' },
  { to: '/services/tss-renewal', t: 'TSS Renewal',       b: 'Keep TallyCapital and every other TSS feature live.' },
  { to: '/products/silver',      t: 'TallyPrime Silver', b: 'New licence for a single-user setup.' },
];

function FinalCTA() {
  return (
    <section style={{ background: 'var(--ink)', padding: '72px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="tc-split" style={{ alignItems: 'center' }}>
          <div>
            <img
              src={IMG.logo}
              alt="TallyCapital"
              style={{ height: 48, width: 'auto', display: 'block', marginBottom: 22, filter: 'brightness(0) invert(1)' }}
            />
            <h2 className="serif" style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 600, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.018em' }}>
              Ready to see what your books qualify for?
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.7)', lineHeight: 1.65, marginTop: 14, maxWidth: 520 }}>
              Talk to our team in {siteConfig.location}, or start the eligibility check yourself from inside TallyPrime.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
              <a href="#tc-lead" className="btn btn-primary" style={{ padding: '14px 24px' }}>
                Check Loan Eligibility <Icon name="arrow" size={15} stroke={2.2} className="arrow" />
              </a>
              <a href={`tel:${PHONE_TEL}`} className="btn btn-white" style={{ padding: '14px 24px' }}>
                <Icon name="phone" size={15} stroke={2} /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.14)',
            borderRadius: 18, padding: '26px 24px',
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>
              Related services
            </div>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {RELATED.map(r => (
                <Link key={r.to} to={r.to} style={{
                  display: 'block', textDecoration: 'none',
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{r.t}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', marginTop: 4, lineHeight: 1.5 }}>{r.b}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Layout-only CSS, scoped to this page's own class names.
const TC_CSS = `
.tc-hero-grid { display:grid; grid-template-columns: 1.05fr .95fr; gap:56px; align-items:center; }
.tc-split     { display:grid; grid-template-columns: 1fr 1fr; gap:48px; }
.tc-usp-row   { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; max-width:560px; }
.tc-stat-row  { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:20px; }
.tc-steps     { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:20px; }
.tc-sol-grid  { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:20px; }
.tc-feat-grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:22px; }

@media (max-width: 1000px) {
  .tc-hero-grid { grid-template-columns: 1fr; gap:40px; }
  .tc-split     { grid-template-columns: 1fr; gap:36px; }
  .tc-sol-grid  { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .tc-feat-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .tc-steps     { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .tc-usp-row   { grid-template-columns: 1fr; }
  .tc-stat-row  { grid-template-columns: repeat(2, minmax(0,1fr)); gap:24px; }
  .tc-sol-grid  { grid-template-columns: 1fr; }
  .tc-feat-grid { grid-template-columns: 1fr; }
}
`;

// ============================================================
// Page composition
// ============================================================
export default function TallyCapitalPage() {
  return (
    <div className="design-page">
      <style>{TC_CSS}</style>
      <Hero />
      <Stats />
      <WhyChoose />
      <HowItWorks />
      <Solutions />
      <Features />
      <VideoSection />
      <GetStarted />
      <FinalCTA />
    </div>
  );
}
