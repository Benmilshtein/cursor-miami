# Cursor Miami 🌴

The community landing page for **Cursor Miami** — the official Cursor chapter in the 305.

A single self-contained `index.html` (no build step, no dependencies). Open it, edit it, deploy it anywhere.

## Run locally
Just open the file:
```bash
open index.html
```
Or serve it (nicer for sharing on your network):
```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy (free)
Drag the folder into **Netlify Drop** (app.netlify.com/drop), or:
```bash
npx vercel        # Vercel
# or push to GitHub and enable GitHub Pages
```

## Customize — the 6 things to change first
1. **Host photo** — in the `#host` section, replace the `BM` monogram:
   ```html
   <div class="avatar"><img src="ben.jpg" alt="Ben Milshtein"></div>
   ```
2. **Gallery photos** — swap the `.gtile` placeholder tiles for real event photos.
3. **Email** — find/replace `hello@cursormiami.com` with your real contact.
4. **Luma link** — already points to `https://luma.com/cursor-miami` (used everywhere).
5. **Event card** — once a date is set, edit the "Café Cursor — Miami Kickoff" card in `#events`.
6. **Sponsors** — replace the dashed placeholder tiles in `#sponsors` with partner logos.

## Design
- **Style:** dark mode, Miami sunset neon (magenta → coral → cyan → purple) on near-black
- **Font:** Inter (Cursor's brand font)
- **Built with:** the `ui-ux-pro-max` skill's design system + references from
  [luma.com/cursor-miami](https://luma.com/cursor-miami), [cursorthailand.com](https://cursorthailand.com), and 21st.dev component patterns.

All colors live in the `:root` CSS variables at the top of `index.html`.
