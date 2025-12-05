# Family Finance Dashboard

A premium Progressive Web App (PWA) for managing household finances with goals, accounts, debts, and comprehensive financial planning tools. Built with React, TypeScript, Tailwind CSS, and Supabase.

---

## 🎯 Features

### Financial Management
- **Goals Tracking** - Set and track financial goals with compound interest projections
- **Accounts** - Monitor bank accounts, investments, and savings
- **Debts** - Track loans, mortgages, and payment schedules
- **Income Sources** - Manage multiple income streams
- **Fixed Costs** - Track recurring expenses and subscriptions

### Smart Analytics
- **Feasibility Engine** - Real-time goal feasibility analysis
- **Net Worth Tracking** - Comprehensive asset and liability overview
- **Investment Forecasts** - 5-year projection charts with Monte Carlo simulation
- **Savings Recommendations** - AI-powered financial advice

### User Experience
- **PWA Support** - Install as a native app on any device
- **Bilingual** - English + Portuguese (Portugal) with Portuguese as default
- **Premium UI** - Pastel blue theme with smooth animations
- **Responsive** - Works on mobile, tablet, and desktop
- **Offline Support** - Works without internet connection

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Auth**: Supabase Auth with email/password + OAuth
- **Storage**: Supabase Storage for images
- **Animations**: Motion (formerly Framer Motion)
- **Charts**: Recharts

### Project Structure
```
/
├── src/
│   ├── app/                       # Figma Make isolated preview
│   │   ├── components/           # Pure UI components
│   │   ├── pages/                # Full page layouts
│   │   ├── logic/                # Production business logic
│   │   ├── preview/              # Mock data system
│   │   ├── app.config.ts         # Mode detection
│   │   ├── exports.ts            # Public API
│   │   ├── README.md             # Quick start guide
│   │   └── USAGE_GUIDE.md        # Complete documentation
│   │
│   ├── components/               # Production components
│   │   ├── auth/                # Login/signup
│   │   ├── dashboard/           # Home dashboard
│   │   ├── goals/               # Goals management
│   │   ├── personal/            # Accounts/debts/income
│   │   ├── settings/            # Settings & household
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Utilities
│   ├── utils/                    # Helpers
│   └── translations/             # i18n translations
│
├── supabase/
│   ├── functions/server/         # Edge Functions
│   └── migrations/               # Database migrations
│
└── public/                       # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd family-finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Create a Supabase project at [supabase.com](https://supabase.com)
   
   Update `/utils/supabase/info.tsx` with your credentials:
   ```typescript
   export const projectId = 'your-project-id';
   export const publicAnonKey = 'your-anon-key';
   ```

4. **Run database migrations**
   
   See the database schema in `/supabase/migrations/`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📦 Figma Make Preview System

This project includes a fully isolated preview environment for Figma Make that:
- ✅ Works with mock data (no Supabase calls)
- ✅ Provides complete UI components
- ✅ Separates UI from business logic
- ✅ Safe to regenerate without breaking production

**Location**: `/src/app/`

**Documentation**:
- `/src/app/README.md` - Quick start guide
- `/src/app/USAGE_GUIDE.md` - Complete documentation

**Usage**:
```typescript
import { DashboardPage, type Goal } from '@/app/exports';

<DashboardPage 
  goals={myGoals} 
  accounts={myAccounts} 
  debts={myDebts} 
/>
```

---

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles and metadata
- `households` - Multi-user household support
- `goals` - Financial goals with projections
- `accounts` - Bank accounts and investments
- `debts` - Loans and mortgages
- `incomes` - Income sources
- `fixed_costs` - Recurring expenses
- `transactions` - Financial transactions
- `household_members` - Household relationships
- `app_settings` - User preferences

### Key Features
- Row Level Security (RLS) policies
- Automatic timestamps
- UUID primary keys
- Foreign key constraints
- Indexed queries for performance

---

## 🎨 Design System

### Color Palette
- **Primary**: Pastel blue (#93C5FD, #BFDBFE, #DBEAFE)
- **Success**: Green (reserved for positive indicators)
- **Neutral**: Gray scale for text and borders
- **Dark Mode**: Automatic system detection

### Typography
- **Headers**: `font-semibold`
- **Labels**: `text-xs uppercase tracking-wider`
- **Body**: System font stack

### Components
- **PremiumCard** - Standardized card component
- **ConfirmationDialog** - Prevent accidental data loss
- **LoadingScreen** - Branded skeleton loading
- **ProgressCurve** - Animated progress indicators

---

## 🔐 Authentication

### Supported Methods
- Email + Password
- Google OAuth (requires setup)
- Facebook OAuth (requires setup)
- GitHub OAuth (requires setup)

### Setup OAuth
Follow Supabase documentation:
- [Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [GitHub](https://supabase.com/docs/guides/auth/social-login/auth-github)

---

## 📱 PWA Configuration

The app is a fully featured PWA with:
- ✅ Offline support via Service Worker
- ✅ App manifest with icons
- ✅ Install prompts on all platforms
- ✅ Native-like experience

### Icons Required
Place these in `/public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)

---

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

---

## 🚢 Deployment

### Option 1: Figma Make (Easiest)
1. Open project in Figma Make
2. Click "Deploy"
3. Done! ✅

### Option 2: Self-Hosted
```bash
# Build for production
npm run build

# Serve the dist/ folder
npx serve dist
```

**Requirements**:
- HTTPS (required for PWA)
- SPA routing support (all routes → index.html)
- Web server (nginx, Apache, or any static host)

**Example nginx configuration**:
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /path/to/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 🌍 Internationalization

### Supported Languages
- **Portuguese (Portugal)** - Default
- **English**

### Adding Translations
1. Add translations to `/translations/[namespace]/[lang].ts`
2. Update `/src/utils/i18n.ts` if adding new namespace
3. Use `useLanguage()` hook in components:
   ```typescript
   const { t, language, setLanguage } = useLanguage();
   <p>{t('common.welcome')}</p>
   ```

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch
2. Make changes
3. Test thoroughly (manual + automated)
4. Commit with clear messages
5. Push and create PR

### Code Style
- Use TypeScript strict mode
- Follow existing patterns
- Use Tailwind for styling (no inline styles)
- Write meaningful comments
- Keep components small and focused

### Git Workflow
```bash
# Before making changes
git checkout -b feature/your-feature-name

# After changes
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Unsplash](https://unsplash.com/) - Stock photos
- [Lucide](https://lucide.dev/) - Icons

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check `/src/app/USAGE_GUIDE.md` for detailed documentation
- Review Supabase docs for backend questions

---

**Built with ❤️ using React, TypeScript, and Supabase**