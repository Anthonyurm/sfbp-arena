# sfbp-arena

The game server for **small fish big pond**. Two files, and neither is meant to
be edited here:

- `src/index.js` — the whole server, bundled. Generated from the game's own
  source (`server/src/*.ts` plus the simulation in `src/game/*.ts`) so that the
  browser and the server run byte-identical physics. Replace it wholesale when
  a new build arrives; do not patch it.
- `wrangler.json` — the configuration, and the only reason this repository
  exists. The three lines under `migrations` are what create the Durable Object
  namespace. A Durable Object cannot be created from the Cloudflare dashboard —
  only a deploy that carries this declaration can make one — which is why the
  no-repo route is so awkward and this one is not.

## Deploying

Connect this repository to Cloudflare Workers (Workers & Pages → Create →
Import a repository) and deploy. The first deploy creates the namespace, binds
it as `ARENA`, and the server is live at
`https://sfbp-arena.<your-subdomain>.workers.dev`.

Check `/health` afterwards. It answers with which bindings actually landed:

    {"ok":true,"service":"sfbp-arena","durableObject":"bound","bindings":["ARENA"]}

`"ok": false` or `durableObject: "MISSING"` means the binding did not attach,
and nothing else about the server matters until it does.

## What it is

One Durable Object per room, holding the ocean in memory and ticking it 20
times a second. Clients may send a heading and whether they are boosting, and
nothing else — no position, no mass, no "I ate that". That is the entire
anti-cheat design, and it is affordable only because the game's whole input is
one direction.
