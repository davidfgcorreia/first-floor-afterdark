# Demo walkthrough

- [afterdark-demo.mp4](afterdark-demo.mp4): a short silent recording of the production build, showing the homepage, navigation, event sections, and VIP flow.
- [preview.gif](preview.gif): a compact animated preview for the repository README.
- `desktop.png`, `mobile.png`, `menu.png`, `english.png`, `vip-summary.png`: selected desktop, phone, navigation, bilingual, and booking screenshots.
- `validation.json`: browser error/overflow checks and confirmation that the capture did not submit a booking.

Download the MP4 to play it, or open `index.html` through a local static server. The public GitHub repository stores the demo; the application itself still runs through Next.js.

## Record again

Install Chromium for Playwright and FFmpeg, then start the production server:

```sh
npm ci
npm run build
npm run start -- --port 3100
```

In another terminal:

```sh
npx playwright install chromium
npm run demo -- http://127.0.0.1:3100
```

An optional final argument sets the booking date, for example `2026-10-31`. Without it, the script chooses the next Saturday. Raw WebM recordings are ignored by Git; the MP4, GIF, and selected screenshots are retained.

The recording uses synthetic visitor information, never clicks the WhatsApp confirmation link, and contains no audio. Media and branding visible in the capture retain the credits and rights documented in [public/img/CREDITS.md](../public/img/CREDITS.md).
