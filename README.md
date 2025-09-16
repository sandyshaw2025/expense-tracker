# Smart Expense Tracker

A full-stack expense tracking application with automated deployment, built for personal finance management.

## Overview
Track income and expenses with detailed categorization, payment methods, and comprehensive reporting. Features real-time data sync, mobile-responsive design, and automated CI/CD deployment.

## Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password)
- **Deployment**: Vercel with automated GitHub Actions
- **Version Control**: GitHub

## Key Features
- User authentication and secure data isolation
- Add/edit/delete income and expense transactions
- Comprehensive transaction details (payment method, account, entity)
- Advanced filtering by date ranges, categories, amounts, entities
- Quick period filters (This Month, Last Quarter, etc.)
- Real-time financial summaries (Income, Expenses, Net)
- Mobile-responsive design
- Search functionality across all transaction fields

## Project Structure
src/
├── app/
│   └── page.tsx              # Main entry point with authentication logic
├── components/
│   └── ExpenseTracker.tsx    # Primary expense tracking interface
└── lib/
└── supabase.ts          # Database client and TypeScript definitions
.github/
└── workflows/
└── deploy.yml           # Automated deployment pipeline
## Database Schema
**expenses table:**
- `id` (primary key)
- `user_id` (foreign key to auth.users)
- `date`, `amount`, `type` (income/expense)
- `category`, `description`, `entity`
- `payment_method`, `payment_details`, `account_used`
- `created_at`, `updated_at`

Row Level Security ensures users only see their own data.

## Development Workflow
1. Make changes in VS Code
2. Commit and push:
```bash
   git add .
   git commit -m "Description of changes"
   git push
GitHub Actions automatically builds and deploys to Vercel
Live app updates within 2-3 minutes

Environment Variables

NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anonymous key

Local Development
npm install
npm run dev
Open http://localhost:3000
Categories Supported
Income: Salary, Freelance, Dividends, Investment Income, etc.
Expenses: Housing, Utilities, Groceries, Transportation, Healthcare, Entertainment, etc.
Payment Methods
Cash, Check, Credit/Debit Cards, Zelle, Venmo, PayPal, Apple Pay, Bank Transfers, etc.
Deployment
Automatic deployment via GitHub Actions to Vercel. Environment variables configured in GitHub Secrets and Vercel dashboard.
Future Enhancement Ideas

Budget limits and alerts
Receipt photo upload and parsing
Claude AI categorization and insights
Data export (CSV/PDF)
Recurring transaction templates
4. **Save the file** and **push the changes:**
```bash
git add .
git commit -m "Add comprehensive project documentation"
git push
