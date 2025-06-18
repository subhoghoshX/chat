# Open source clone of t3.chat

This is a vite + convex project

Steps to run locally

1. Clone the repo.
2. Install deps `npm install`.
3. Open two terminal window and run `npm run dev` for running vite and `npx convex dev` for running convex.
4. Running `npx convex dev` will give you the steps to setup convex.
5. In convex you'd need to setup two env variables `VERCEL_OIDC_TOKEN` and `VITE_CLERK_FRONTEND_API_URL`.
For the vercel token install the [vercel cli](https://vercel.com/docs/cli) and run `vc env pull`. For the
clerk env variable checkout [convex doc](https://docs.convex.dev/auth/clerk#react) which has it nicely explained.
6. The convex clerk doc above will also give you the steps to get `VITE_CLERK_PUBLISHABLE_KEY` to add to `.env.local`.
7. Now restart the dev servers and checkout the project on localhost:5173 or the port that vite assigned. It should work.
If not [DM me on X](https://x.com/subhoghosh_). I'll personally answer all your queries.
