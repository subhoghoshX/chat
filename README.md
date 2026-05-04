# Open source clone of t3.chat

This is a vite + convex project

Steps to run locally

1. Clone the repo.
2. Install deps `npm install`.
3. Open two terminal window and run `npm run dev` for running vite and `npx convex dev` for running convex.
4. Running `npx convex dev` will give you the steps to setup convex.
5. Configure Convex Auth by setting `JWT_PRIVATE_KEY` and `JWKS` in your Convex deployment. You can generate them with the script from the [Convex Auth manual setup docs](https://labs.convex.dev/auth/setup/manual#configure-private-and-public-key).
6. In Convex you'd also need to setup `VERCEL_OIDC_TOKEN`. For the vercel token install the [vercel cli](https://vercel.com/docs/cli) and run `vc env pull`.
7. Now restart the dev servers and checkout the project on localhost:5173 or the port that vite assigned. It should work.
If not [DM me on X](https://x.com/subhoghosh_). I'll personally answer all your queries.
