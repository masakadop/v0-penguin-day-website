# v0-penguin-day-website

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_KMgSsNACAFTOpS2jIz0AoDrWdBwo)

## GitHub Pages deployment

This project is configured for GitHub Pages static hosting.

### 1. Enable Pages on GitHub

1. Open repository **Settings** → **Pages**.
2. In **Build and deployment**, select **GitHub Actions**.

### 2. Deployment trigger

- The workflow `.github/workflows/deploy-pages.yml` runs on push to `main`.
- It builds the Next.js static export and deploys the `out` directory to Pages.

### 3. URL

If your repository name is `v0-penguin-day-website`, your site URL will be:

`https://<your-github-username>.github.io/v0-penguin-day-website/`

`next.config.mjs` automatically sets `basePath` and `assetPrefix` on GitHub Actions from `GITHUB_REPOSITORY`, so assets resolve correctly on Pages.

## Development environment

- Node.js: **20.x** (`.nvmrc` is pinned to `20`)
- pnpm: **10.x**

Using the same major versions locally and in CI helps avoid GitHub Actions-only build failures.

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/masakadop/v0-penguin-day-website" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
