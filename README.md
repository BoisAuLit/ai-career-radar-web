# AI Career Radar

A career-intelligence tool for experienced software engineers pivoting into AI engineering.

**🌐 Live:** https://ai-career-radar-web.vercel.app

Paste your resume + describe the role you want. Get an evidence-grounded gap report against 443 real AI engineering job descriptions from frontier labs, big tech, AI scaleups, and infra companies — in under 60 seconds.

The report has 5 sections:
1. **Target role classification** — including a "but actually" correction if the title misleads (e.g., "Applied AI Engineer at Anthropic" is often actually `forward_deployed` work)
2. **What you already have** — don't re-learn this
3. **Your top 5 gaps**, ranked by leverage, each with: skill name, % of target-archetype JDs that ask for it, what's missing from your resume, a concrete first step, and a quote from a real JD
4. **Skills you might be over-prioritizing** — what to deprioritize on your resume
5. **Your single highest-leverage next action** — one tool, one time bound, one deliverable

## Quality baseline (LLM-graded)

V1 reports are scored on three metrics by a separate LLM-as-judge (Claude Haiku 4.5):

| Metric | What it measures | V1 baseline (Day 9) |
|---|---|---:|
| **Groundedness** | Every cited %, count, or JD reference is traceable to the supplied data | **0.89 – 0.93** |
| **Specificity** | Every recommendation names a concrete tool + time bound + deliverable | **0.83 – 0.95** |
| **Actionability** | A user with the stated background could start each task today | **0.78 – 0.82** |

Reproducible from the [`tuto_ai_career_radar` lab repo](https://github.com/BoisAuLit/tuto_ai_career_radar). Run `scripts/eval_existing_reports.py`.

**Every generated report has a 📊 Eval this report button** so you can audit *your* report's scores live and see the specific claims the judge flagged.

## How it works

```
┌─────────────────────┐
│ Resume + target text │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ POST /api/classify                  │  ── 1 small Claude call
│ Free-text target → archetype +      │     (~$0.003, ~3s)
│ "but actually" reasoning             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Build skill profile + pick evidence │  ── pure TS, no LLM
│ from bundled corpus (443 JDs)       │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ POST /api/generate-report (stream)  │  ── 1 large Claude call
│ → 5-section Markdown report         │     (~$0.05, ~50s, streaming)
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Optional: POST /api/eval-report     │  ── 3 parallel Haiku judges
│ → 3-metric quality score            │     (~$0.001, ~3-5s)
└─────────────────────────────────────┘
```

## Privacy

- Your resume is sent only to Anthropic's API for report generation
- Nothing is stored or logged server-side beyond the duration of the request
- No accounts, no sign-up, no tracking pixels, no analytics

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** + **Tailwind v4**
- **Vercel AI SDK v6** with `@ai-sdk/anthropic` and `@ai-sdk/react`
- **Claude Sonnet 4.6** for classification + report generation
- **Claude Haiku 4.5** for the 3 parallel LLM-as-judge eval metrics
- **`unpdf`** for serverless PDF text extraction (Bohao's earlier choice of pdfjs-dist failed on Vercel; `unpdf` ships pre-polyfilled pdf.js)
- **`react-markdown` + `remark-gfm`** for the streaming report renderer

## What this isn't

- ❌ A job board — there are no jobs listed here, only a synthesis of what AI companies hire for
- ❌ A learning platform — we point at gaps and a first step; you go learn elsewhere
- ❌ A resume rewriter — we tell you what to deprioritize on your resume, not how to rewrite it
- ❌ Generic career advice — every recommendation cites the specific JD evidence behind it

## Local development

```bash
git clone git@github.com:BoisAuLit/ai-career-radar-web.git
cd ai-career-radar-web
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Built in public

The full 9-day build log (including the times I shipped a bug and rolled it back, the eval methodology that surfaced a flaw in itself, and the honest monetization rethink) is in [`BUILD_LOG.ipynb`](https://github.com/BoisAuLit/tuto_ai_career_radar/blob/main/BUILD_LOG.ipynb) on the lab repo.

The lab repo also contains the corpus, the Python pipeline that built the bundle, the meta-eval scripts, and every decision recorded in `DECISION_LOG.md`.

## License

MIT (code). The corpus is curated from public job postings and is for personal / non-commercial career analysis only.
