# Ekta Sachdeva · Landing page

A static, dependency-free landing page (HTML + CSS + vanilla JS). No build step.

```
index.html            page content
404.html              not-found page (Netlify uses it automatically)
assets/css/styles.css styles and animations
assets/js/main.js     scroll reveals, counters, nav, lightbox, galleries
assets/img/           all photos, logos and award images
netlify.toml          Netlify config (publish dir + headers)
```

## Preview locally
Open `index.html` in a browser, or run `npx serve .` in this folder.

## Publish to GitHub
1. Create a new empty repository on GitHub (e.g. `ekta-sachdeva`).
2. In this folder:
   ```
   git init
   git add .
   git commit -m "Initial landing page"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
   Or upload the files with GitHub's web "Add file → Upload files".

## Deploy on Netlify
1. Netlify → **Add new site → Import an existing project → GitHub**, pick the repo.
2. Leave **Build command** empty and **Publish directory** as `.` (netlify.toml already sets this).
3. Deploy. Every push to `main` redeploys automatically.
4. Optional: **Domain management** to add a custom domain.

## Editing
- Text lives in `index.html`, one `<section>` per block.
- Colours and fonts are CSS variables at the top of `styles.css` (`--gold`, `--bg`, …).
- Numbers marked `data-count` animate up when scrolled into view; the final text is exactly what's written in the HTML.
- After you have a live URL, change `og:image` in `index.html` to the full URL (e.g. `https://your-site.netlify.app/assets/img/portrait.jpg`) so link previews show the photo.
