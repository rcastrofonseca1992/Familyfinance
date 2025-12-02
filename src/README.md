# Family Finance Dashboard

A premium Progressive Web App (PWA) for managing household finances, built with React, TypeScript, and Supabase.

## Features

- 👥 **Household Management** - Multi-user support with roles and permissions
- 💰 **Personal Finance** - Track income, accounts, fixed costs, and debts
- 🎯 **Goals Tracking** - Set and monitor financial goals with projections
- 📊 **Investment Forecasting** - Visualize wealth growth over time
- 🔒 **Secure Authentication** - Powered by Supabase Auth
- 📱 **PWA Support** - Install as native app on mobile and desktop
- 🌓 **Dark Mode** - Premium pastel green color palette

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: React Context
- **Charts**: Recharts
- **UI Components**: Custom component library with shadcn/ui patterns
- **Icons**: Lucide React
- **Animation**: Framer Motion

## Prerequisites

- Node.js 18+ or Bun
- Supabase account (for backend services)

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are set automatically in Figma Make environment via `/utils/supabase/info.tsx`

## Development

This app is designed to run in Figma Make environment, but can also be run locally:

```bash
# Install dependencies (if running locally)
npm install
# or
bun install

# Start dev server
npm run dev
# or
bun run dev
```

## Deployment

### Option 1: Figma Make (Recommended)
The app is already configured for Figma Make deployment. Simply use the built-in deployment features.

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 3: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 4: Self-hosted

```bash
# Build for production
npm run build
# or
bun run build

# The dist/ folder contains your production build
# Serve it with any static file server
```

## Build Configuration

The app uses Vite for building. Build output goes to `/dist` directory.

Key build settings:
- Entry point: `/main.tsx`
- HTML template: `/index.html`
- Styles: `/styles/globals.css`
- Assets: `/public/*` (icons, manifest)

## PWA Configuration

The app includes PWA support:
- `manifest.json` - App manifest with icons and theme colors
- Service worker handling via `PWAHandler` component
- Installable on iOS, Android, and desktop

**Note**: You'll need to add actual PNG icons to `/public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

## Supabase Edge Functions

Backend API runs on Supabase Edge Functions at `/supabase/functions/server/`:
- Household management
- Finance data sync
- Auth integration

Deploy edge functions:
```bash
supabase functions deploy make-server-d9780f4d
```

## Project Structure

```
/
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
├── index.html                 # HTML template
├── components/
│   ├── auth/                  # Login/signup
│   ├── dashboard/             # Home dashboard & forecasting
│   ├── personal/              # Personal finance views
│   ├── goals/                 # Goals tracking
│   ├── settings/              # App settings
│   ├── store/                 # Global state (FinanceContext)
│   ├── ui/                    # Reusable UI components
│   └── layout/                # App shell & navigation
├── lib/                       # Utilities
├── styles/                    # Global CSS
└── supabase/                  # Edge functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please open an issue on GitHub.
