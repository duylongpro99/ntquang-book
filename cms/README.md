# CMS — Sách Y Học Online (Strapi 5)

Headless CMS for the medical-books site. Standalone service that the Next.js
`frontend/` will consume over REST/GraphQL (wiring lands in Phase 3). See the
full plan in [`../docs/cms-plan.md`](../docs/cms-plan.md).

- **Stack:** Strapi 5 · TypeScript · Bun (package manager) · SQLite (local) / Postgres (prod)
- **Repo layout:** sibling package beside `frontend/` (no root workspace tooling)

## Local development

```bash
cd cms
cp .env.example .env      # first time only; fill in secrets (openssl rand -base64 16)
bun install               # native postinstalls: `bun pm trust @swc/core core-js-pure`
bun run develop           # watch mode → http://localhost:1337/admin
```

> **Runtime note:** Bun is the *package manager*; the Strapi process itself runs
> on **Node** (the `strapi` bin has a `#!/usr/bin/env node` shebang), which
> avoids Strapi's Bun-runtime issues. Every command you type stays `bun run …`.

Other scripts: `bun run build` (compile TS + admin panel), `bun run start`
(production server, no watch), `bun run strapi` (Strapi CLI).

Create a local admin without the browser:

```bash
./node_modules/.bin/strapi admin:create-user \
  --firstname=Admin --lastname=Local \
  --email=admin@local.dev --password='DevAdmin123'
```

## Deploying to the VPS

1. Provision **Postgres** and create a DB/user.
2. Set env on the server (see `.env.example`): `DATABASE_CLIENT=postgres`,
   `DATABASE_URL=…`, fresh secrets, and `URL=https://cms.<your-domain>`.
3. Build and run under a process manager (pm2 / systemd):
   ```bash
   bun install
   bun run build
   bun run start          # or: NODE_ENV=production node ./node_modules/.bin/strapi start
   ```
4. Front it with a reverse proxy (nginx/Caddy) terminating TLS on your domain,
   and set the frontend's `CMS_URL` to the public URL.

Media (`public/uploads`) lives on the VPS disk in Phase 0 — back it up together
with the database. Swap to S3-compatible storage later (see `.env.example`).

---

## 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

## Phase 1 — Content model

Nine content types (book, article, category, article-category, author, publisher,
download, book-request) plus a branding single type and profile fields on the
users-permissions user. Draft/Publish is enabled on **book** and **article** only.

Public REST (`/api/...`) and GraphQL (`/graphql`) expose **published** book,
article, category, article-category, author, publisher, and branding. `download`
and `book-request` are not publicly readable.

### Read-only API token (for the frontend)
1. `bun run dev`, open the admin at `/admin`.
2. Settings → API Tokens → Create new token → Token type: **Read-only**.
3. Copy the token into the frontend env: `CMS_API_TOKEN=<token>` and
   `CMS_URL=<cms-origin>`. Keep it server-side only.
