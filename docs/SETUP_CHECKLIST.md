# SETUP CHECKLIST — DERMAL

## Required accounts

- [ ] GitHub
- [ ] Shopify
- [ ] Vercel
- [ ] Claude Code access
- [ ] Higgsfield if creative generation is required

Optional later:
- [ ] Supabase
- [ ] payment provider
- [ ] analytics
- [ ] email provider
- [ ] domain

## Check local software

```powershell
node --version
npm --version
git --version
claude --version
```

## Open project

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
```

## Install dependencies if needed

```powershell
npm install
```

## Run site

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Verify Git

```powershell
git status
git remote -v
git branch
```

Expected remote:
`https://github.com/noodleskywalker-dotcom/dermal-jewelry.git`

## Git identity if needed

```powershell
git config --global user.name "noodleskywalker-dotcom"
git config --global user.email "noodleskywalker-dotcom@users.noreply.github.com"
```

## Push first commit if needed

```powershell
git add .
git commit -m "Initial Next.js setup"
git branch -M main
git remote set-url origin https://github.com/noodleskywalker-dotcom/dermal-jewelry.git
git push -u origin main
```

If origin does not exist:

```powershell
git remote add origin https://github.com/noodleskywalker-dotcom/dermal-jewelry.git
git push -u origin main
```

## Claude Code

```powershell
cd C:\Users\USER\Desktop\dermal-jewelry
claude
```

Tell Claude to read `README.md` and `CLAUDE.md`.

## Superpowers

Inside Claude Code:

```text
/plugin install superpowers@claude-plugins-official
```

## Caveman optional

```powershell
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

Keep extra proxy/routing features disabled initially.

## Higgsfield

```powershell
npm i -g @higgsfield/cli
higgsfield auth login
npx skills add higgsfield-ai/skills
```

Complete browser authorization.

## Vercel

- Log into Vercel
- import GitHub repo `noodleskywalker-dotcom/dermal-jewelry`
- confirm Next.js detection
- deploy

## Shopify

- create store
- configure current headless/Storefront API access
- create Storefront API credentials
- put local values in `.env.local`
- put production values in Vercel environment variables

Example:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=replace_me
SHOPIFY_API_VERSION=replace_me
```

Never commit this file.

## Before coding the store

Confirm:
- [ ] `npm run dev` works
- [ ] `git status` works
- [ ] GitHub repo is connected
- [ ] Vercel project exists
- [ ] Claude opens in correct folder
- [ ] `README.md` exists
- [ ] `CLAUDE.md` exists
- [ ] Superpowers installed if desired
- [ ] Caveman installed if desired
- [ ] Higgsfield authenticated if desired
- [ ] Shopify store exists

## First coding milestone

Do not build everything at once.

First:
1. inspect repo
2. run build
3. establish design tokens
4. build navigation
5. build homepage shell
6. build mock product system
7. commit

Second:
1. `/face-studio`
2. local image upload
3. anti-eyebrow overlay
4. drag/scale/rotate
5. stack panel
6. commit

Then Shopify.

Then automatic landmarks.

Then 3D/head motion.
