# Premium Detailing

Landing page for **Premium Detailing**, an auto care studio in Swarzędz, Poland
(near Poznań). Single-page marketing site in four languages, with a lead form
that delivers enquiries to Telegram and email.

---

## What it does

Visitors browse the studio's services and packages, compare before/after photos
of real work, find the studio on a map, and send an enquiry. Every enquiry
reaches the owner within seconds via Telegram, with an optional email copy.

## Features

- **Four languages** — Polish, Ukrainian, Russian and English, selected by URL
  path (`/pl`, `/uk`, `/ru`, `/en`). A bare `/` goes to the visitor's last
  choice, else their browser language, else Polish. The language switcher,
  `<html lang>`, the i18n instance and the page's title, description,
  canonical and Open Graph tags all stay in sync with the route.
- **Per-language HTML** — the build writes `dist/<lang>/index.html` with that
  language's head, so crawlers and link previews that do not run JavaScript
  still see the right language.
- **Service catalogue** — four service groups (exterior, interior, mechanics,
  tuning) and four packages with prices computed from a single config.
- **Individual services** — a per-service price list across six categories,
  supporting fixed, "from", range, add-on and custom pricing.
- **Before/after sliders** — draggable comparison of the studio's own work.
  Operable with a pointer or the keyboard (arrows, Home/End, PageUp/PageDown).
- **Interactive map** — MapLibre + MapTiler, restyled to the site's palette,
  with a custom studio marker. Loaded lazily and degrading to an address card
  when no API key is configured.
- **Two lead capture paths** — the contact form, and an offer popup that
  appears on every visit, 10s after load (or earlier on exit intent on
  desktop). If the visitor is typing at that moment it waits for them to stop,
  up to 15s. Once per page load; closing it is not remembered, but it never
  shows again after the visitor has sent a lead.
- **Spam protection** — a honeypot field, a minimum fill time and a per-IP
  rate limit on the endpoint.
- **FAQ accordion**, customer reviews, and a footer with contact details.

## Tech stack

| Area | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19, TypeScript 5.9 (strict) |
| Routing | React Router 7 |
| Styling | CSS Modules + CSS custom properties |
| i18n | i18next / react-i18next |
| Map | MapLibre GL + MapTiler tiles |
| Fonts | Inter Variable, self-hosted |
| Backend | Vercel serverless function |
| Notifications | Telegram Bot API, Resend |

No CSS framework and no component library — the interface is built on a small
set of design tokens defined in `src/styles/variables.css`.

## Project structure

```
api/
  leads.ts                  Serverless endpoint: validates and dispatches leads
public/                     Static assets served as-is
src/
  app/
    languages.ts            Supported locales and the default — single source of truth
    detectLanguage.ts       Picks a language for URLs that do not carry one
    site.ts                 Site URL, OG image and OG locales (shared with the build)
    router.tsx              Routes and language redirects
    providers/
      LanguageRouteSync.tsx Keeps i18n, <html lang> and head tags aligned with the route
  assets/images/            Before/after photography
  components/
    layout/                 Container, Navbar, SectionHeading, LanguageSwitcher
    OfferPopup/             Engagement-triggered lead dialog
  data/
    contact.ts              Phone number and WhatsApp link
    navigation.ts           Nav items and footer subset
    pricing.ts              Package and individual-service pricing config
    stats.ts                Headline figures (cars served, years, rating)
  i18n/
    index.ts                i18next setup
    locales/                pl.json, uk.json, ru.json, en.json
  lib/
    leads.ts                Shared lead submission, phone check, "already sent" flag
  pages/HomePage.tsx        Section composition
  sections/                 One folder per page section (.tsx + .module.css)
  styles/
    reset.css               Box sizing and element defaults
    variables.css           Design tokens: color, type, spacing, radii, motion
    globals.css             Base typography, focus, reduced motion
```

Each section owns its stylesheet. Shared visual decisions live in
`variables.css`; section stylesheets reference those tokens rather than raw
values.

## Getting started

Requires **Node 20.19+ or 22.12+** (Vite 8). With nvm, run `nvm use` — the version is pinned in `.nvmrc`.

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env
#    then fill in real values — see "Environment variables" below

# 3. Start the dev server
npm run dev
```

The site runs at `http://localhost:5173` and redirects `/` to the detected language.

> The contact form posts to `/api/leads`, which is a Vercel serverless
> function. Under `npm run dev` that route does not exist, so submissions fail
> locally. Use `vercel dev` instead to run the frontend and the endpoint
> together.

## Environment variables

Copy `.env.example` to `.env` and fill in the values. `.env` is gitignored —
never commit real credentials.

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `VITE_MAPTILER_KEY` | No | Browser | MapTiler tiles for the Location map. Without it the section shows the address card instead. |
| `TELEGRAM_BOT_TOKEN` | Yes | `/api/leads` | Bot that sends lead notifications. |
| `TELEGRAM_CHAT_IDS` | Yes | `/api/leads` | Comma-separated chat IDs to notify. |
| `RESEND_API_KEY` | No | `/api/leads` | Enables the email copy of each lead. |
| `ADMIN_EMAIL` | No | `/api/leads` | Recipient of the email copy. |
| `FROM_EMAIL` | No | `/api/leads` | Verified Resend sender address. |

`VITE_`-prefixed variables are **embedded in the client bundle** and are
publicly visible. Restrict the MapTiler key to your production domain. The
remaining variables are read only by the serverless function and never reach
the browser.

If Telegram credentials are missing the endpoint returns 500. If the Resend
variables are missing, email is skipped silently and Telegram still works.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with autofix |
| `npm run typecheck` | Typecheck without emitting |
| `npm run check` | Typecheck + lint + build — run before pushing |

## Production build

```bash
npm run build     # outputs to dist/
npm run preview   # verify the build locally
```

The build is code-split: MapLibre and its stylesheet are emitted as a separate
chunk that the browser only downloads when the Location section nears the
viewport.

## Deployment

The project targets **Vercel**. `vercel.json` serves `/<lang>` from the
matching per-language `index.html`, rewrites every other non-API path to `/`,
sets baseline security headers, and marks hashed assets as immutable.

The production origin lives in `src/app/site.ts` and in `index.html`; change
both if the site moves to its own domain.

Set every server-side environment variable in the Vercel project settings.
Functions under `api/` deploy automatically.

## The lead endpoint

`POST /api/leads`

```jsonc
{
  "source": "contact-form",   // or "offer-popup"
  "name": "Jan Kowalski",     // 2–80 characters
  "phone": "+48 733 892 486", // 6–30 characters
  "service": "ceramicCoating",// required for "contact-form"
  "message": "…",             // optional, max 200 characters
  "locale": "pl",             // optional: pl | uk | ru | en
  "page": "/pl#contact",      // optional
  "company": "",              // honeypot — must be empty
  "elapsedMs": 8400           // time spent on the form
}
```

The phone must contain 7–15 digits and only phone characters. Requests with
the honeypot filled or sent faster than 1.5s get a silent `200` and are
dropped. More than 5 leads per IP in 10 minutes get `429`; the counter lives
in the function instance's memory, so it is per-instance — use a shared store
(Vercel KV / Upstash) if exact limits are ever needed. Notification times are
shown in Europe/Warsaw time.

Responses: `200 {"ok":true}`, `400` with a validation message, `405` for a
non-POST method, `429` when rate-limited, `500` for a delivery failure. Internal failures are logged
server-side and return a generic message, so configuration details never reach
the browser.

## Notes for contributors

- **Do not introduce new colors.** The palette lives in `variables.css`; use
  the existing tokens.
- **Typography and spacing come from tokens** (`--text-*`, `--space-*`,
  `--radius-*`). Add a step to the scale rather than a one-off value.
- **Breakpoints** are 480 / 640 / 768 / 1024 / 1180 / 1280 px.
- **Translations must stay in parity.** All four locale files carry the same
  key set; add a key to all four or the UI falls back to the raw key path.
- **Lead limits are duplicated on purpose** in `api/leads.ts` and
  `src/lib/leads.ts` (the function deploys on its own). Change both together.
- Run `npm run check` before pushing.
