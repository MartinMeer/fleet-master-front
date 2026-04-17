Here is how “stack” lines up with **this** repo.

### Technology stack (what docs and README mean)

Both frontends (`apps/main-app` and `apps/marketing-site`) are built the same way: **React 18**, **TypeScript**, **Tailwind CSS**, **Radix UI**-style primitives (the shadcn-style `components/ui` set), **React Router 7** (`HashRouter` + `Routes`), **Zustand**, **React Hook Form** + **Zod**, **Recharts**, **Motion**, **i18next**, **ESBuild** for dev/build, **npm workspaces** at the monorepo root. That is the “stack” called out in places like `README copy.md` under “Tech Stack”.

### UI “Stack” component

There is **no** shared layout primitive named `Stack` (no MUI/Chakra-style `<Stack>`) in the `.tsx`/`.ts` sources; vertical grouping is done with normal **HTML + Tailwind** (`flex`, `flex-col`, `grid`, spacing classes, etc.).