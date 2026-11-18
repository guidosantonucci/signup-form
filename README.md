# Signup Form ✍️

An accessible account-signup form (name, email, password + strength meter, date of birth, country, terms) with a **Playwright + TypeScript** suite that covers validation rules, accessibility and cross-browser behaviour.

![CI](https://github.com/guidosantonucci/signup-form/actions/workflows/e2e.yml/badge.svg)

## What the suite demonstrates

| Skill | Where |
|---|---|
| Data-driven tests from a JSON file | `tests/data/invalid-inputs.json` → one test per row in `validation.spec.ts` |
| User-facing locators | `getByLabel` / `getByRole` only (no CSS selectors) in `tests/signup.page.ts` |
| Time control | `page.clock.setFixedTime` freezes "today" so 18+ age-boundary tests never go flaky |
| Boundary testing | turns 18 today vs. tomorrow, future dates, password length 7 vs. 8 |
| Accessibility | axe-core WCAG 2.1 AA scans (clean and error states), `aria-describedby` error wiring, keyboard-only completion |
| Cross-browser | Chromium, Firefox and WebKit as a GitHub Actions matrix |
| Tagging | `@smoke` subset |

## Validation rules under test

- **Full name:** required, 2+ characters, letters / spaces / hyphens / apostrophes only.
- **Email:** valid format; `taken@example.com` and `admin@example.com` are already registered (case-insensitive).
- **Password:** 8+ characters with an uppercase letter, a number and a symbol; the confirmation must match.
- **Date of birth:** not in the future, user must be 18+.
- **Country** and **terms** are required.
- Errors show on blur, update live once a field is flagged, and focus moves to the first invalid field on submit.

## Run it

```bash
npm ci
npx playwright install chromium firefox webkit
npm test              # all browsers (the app starts automatically)
npm run test:a11y     # accessibility checks only
npm run report
npm start             # just run the app at http://localhost:4174
```
