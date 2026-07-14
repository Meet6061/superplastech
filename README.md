# Super Plastech Industries — Website

Single-page marketing site (React + Vite + TypeScript).

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for production
```bash
npm run build    # outputs to /dist
npm run preview  # preview the production build
```

## Structure
- `src/App.tsx` — all sections (Hero, Products, Plant, Contact, Footer)
- `src/Logo.tsx` — SΠ brand mark (inline SVG)
- `src/index.css` — design tokens + all styles
- `public/img/` — product & factory photos

## Deploy
`npm run build`, then upload the `/dist` folder to any static host
(Vercel, Netlify, or your own server). No backend required.
