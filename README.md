# Plan: Idea Management & Execution Platform

## 🎯 Project Overview

"Plan" is a personal idea management and execution platform designed for developers to capture, validate, and convert ideas into executable roadmaps. It aims to combine the best aspects of tools like Notion, Jira, and Linear into a personalized, 100% free-to-run, serverless application.

## 💡 Core Philosophy

-   **Capture Every Idea:** Never lose a shower thought, 3 AM epiphany, or coding inspiration.
-   **Validate Before Building:** Utilize a robust scoring mechanism (Impact × Effort × Excitement) to prioritize and validate ideas.
-   **Auto-Generate Roadmaps:** Break down validated ideas into actionable milestones.
-   **Track Execution:** Follow an idea from its inception to a shipped product.

## 🚀 Tech Stack (100% Free Tier)

| Category   | Technology                                          | Notes                                                 |
| ---------- | --------------------------------------------------- | ----------------------------------------------------- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS   | Modern, performant, and type-safe development.        |
| **UI Kit**   | shadcn/ui                                           | Professional, dark mode aesthetic components.         |
| **Backend**  | Supabase (PostgreSQL, Auth, Realtime)               | Open-source Firebase alternative with robust features.|
| **Deployment**| Vercel                                              | Edge Network deployment for speed and scalability.    |
| **Domain**   | princetheprogrammer.is-a.dev (e.g., `plan.princetheprogrammer.is-a.dev`)| Part of a broader personal ecosystem.               |

## 🗄️ Database Schema

The application utilizes a PostgreSQL database managed by Supabase. Row Level Security (RLS) is enabled on all tables, ensuring users can only access their own data.

### 1. `ideas` (Core Table)
-   `id`: `uuid` (primary key)
-   `title`: `text` (idea name)
-   `description`: `text` (details)
-   `category`: `enum` (`tech`/`business`/`content`/`life`/`random`)
-   `status`: `enum` (`captured`/`validating`/`validated`/`planning`/`building`/`shipped`/`archived`)
-   `impact_score`: `int` (1-10, how big if it works?)
-   `effort_score`: `int` (1-10, how hard to build?)
-   `excitement_score`: `int` (1-10, how much do I want it?)
-   `priority_score`: `float` (calculated: `(impact × excitement) / effort`)
-   `tags`: `text[]` (auto-generated or manual)
-   `mood`: `text` (how I felt when capturing)
-   `user_id`: `uuid` (linked to `auth.users`)
-   `created_at`, `updated_at`: `timestamp`

### 2. `milestones` (Roadmap breakdown)
-   `id`: `uuid`
-   `idea_id`: `uuid` (foreign key)
-   `title`: `text` (milestone name)
-   `description`: `text`
-   `status`: `enum` (`pending`/`in_progress`/`completed`/`blocked`)
-   `due_date`: `timestamp`
-   `order_index`: `int` (for sorting)

### 3. `projects` (Execution tracking)
-   `id`: `uuid`
-   `idea_id`: `uuid` (1:1 relationship, idea becomes project)
-   `name`: `text`
-   `slug`: `text` (URL-friendly)
-   `github_url`: `text`
-   `live_url`: `text`
-   `status`: `enum` (`active`/`paused`/`completed`/`abandoned`)
-   `user_id`: `uuid`
-   `created_at`: `timestamp`

### 4. `profiles` (User extension)
-   `id`: `uuid` (links to `auth.users`)
-   `username`: `text`
-   `full_name`: `text`
-   `avatar_url`: `text`
-   `created_at`: `timestamp`

### 5. `activity_log` (Audit trail)
-   `id`: `uuid`
-   `user_id`: `uuid`
-   `idea_id`: `uuid`
-   `action`: `text` (`created`/`scored`/`status_changed`/`milestone_added`)
-   `metadata`: `jsonb`
-   `created_at`: `timestamp`

## ✨ Key Features Implemented (Phase 1: Foundation)

-   **GitHub Authentication:** Seamless login via GitHub OAuth using Supabase Auth.
-   **Idea Capture Form:** A modal to quickly capture new ideas with title, description, and category.
-   **Priority Auto-scoring:** Ideas are automatically scored (`(impact × excitement) / effort`) by the database, though scores are manually set to 5/5/5 initially.
-   **Ideas Dashboard:** A dynamic dashboard displaying all user ideas, with filtering options (all, high-priority, captured, building, shipped).
-   **Real-time Sync:** Supabase Realtime keeps the dashboard updated instantly when new ideas are added.
-   **Dark Mode Professional UI:** A clean, responsive dark-themed user interface built with Tailwind CSS and `shadcn/ui`.
-   **Comprehensive Documentation:** Initial High-Level Design (HLD), Low-Level Design (LLD), and Architecture overview documents.

## 🛠️ Setup & Local Development

### 1. Create Project (Already Done)

This project was initialized using:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 2. Supabase Project Setup (Manual Step)

1.  **Create Project:** Go to [supabase.com](https://supabase.com), create a new project.
2.  **Run SQL Schema:** In your Supabase project's **SQL Editor**, paste and run the entire SQL schema provided in the project prompt (it defines `ideas`, `milestones`, `projects`, `profiles`, `activity_log` tables, RLS policies, and triggers).
3.  **Configure GitHub OAuth:**
    *   Navigate to **Authentication → Providers → GitHub** in your Supabase project.
    *   Enable the **GitHub** provider.
    *   Copy the **Callback URL** provided by Supabase (e.g., `https://<your-project-ref>.supabase.co/auth/v1/callback`).
    *   Go to your GitHub profile → Settings → Developer settings → OAuth Apps → New OAuth App.
    *   Register a new OAuth application using the copied Supabase callback URL.
    *   Generate a **Client ID** and **Client Secret** on GitHub.
    *   Paste the GitHub **Client ID** and **Client Secret** back into the Supabase GitHub provider settings and **Save**.

### 3. Environment Variables

Create a `.env.local` file in your project root and populate it with your Supabase credentials:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*   Replace `<your-project-ref>.supabase.co` and `<your-anon-key>` with values from your Supabase Project Settings (API section).

### 4. Install Dependencies (Already Done)

```bash
npm install next-themes @supabase/supabase-js @supabase/ssr @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-markdown remark-gfm date-fns lucide-react recharts sonner
```
*   `shadcn/ui` components (`button`, `card`, `dialog`, `scroll-area`, `badge`, `avatar`, `dropdown-menu`, `input`, `textarea`, `select`, `tabs`, `sheet`, `tooltip`) were added via `npx shadcn@latest add ...`.

### 5. Run the Application

```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## 🌐 Deployment (Vercel)

1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/plan.git
    git branch -M main
    git push -u origin main
    ```
2.  **Import to Vercel:** Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
3.  **Configure Environment Variables:** Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel project's Environment Variables.
4.  **Deploy!** Vercel will automatically build and deploy your application.
5.  **DNS Setup (Optional):** If using `is-a.dev`, add a CNAME record pointing your subdomain (e.g., `plan.princetheprogrammer.is-a.dev`) to `cname.vercel-dns.com`.

## 🤝 Contributing

This project is built with a strong focus on open-source principles. Contributions are welcome! Please refer to the `docs/` folder for architectural and design details.

## ✅ Success Metrics

-   Capture latency: < 5 seconds from thought to saved
-   Validation time: < 2 minutes to score an idea
-   Roadmap generation: < 30 seconds auto-generation
-   Ship rate: Track % of ideas that become shipped projects

## roadmap

### Phase 1: Foundation (Completed)
-   GitHub Authentication
-   Idea capture form (title + description + category)
-   Priority auto-scoring (Impact/Effort/Excitement sliders - *initial default*)
-   Ideas dashboard with filtering (all/high-priority/captured/building/shipped)
-   Real-time sync (Supabase Realtime)
-   Dark mode professional UI

### Phase 2: Validation Engine (Current Focus)
-   Idea detail view with scoring interface
-   Validation checklist (custom questions per category)
-   Auto-calculate priority score
-   "Should I build this?" recommendation
-   Comparison view (idea vs idea)

### Phase 3: Roadmap Generator
-   Auto-generate milestones from idea description
-   Drag-drop Kanban board (dnd-kit)
-   Due date scheduling
-   Progress tracking (% complete)
-   Blocker identification

### Phase 4: Execution Mode
-   Convert idea to project
-   GitHub repo integration
-   Deployment tracking (Vercel URLs)
-   Time logging
-   Ship checkbox (celebration animation)

### Phase 5: Capture Everywhere
-   Voice-to-text capture (Web Speech API)
-   Telegram bot integration
-   Browser extension (quick capture)
-   Mobile PWA support
-   Email-to-idea (send email → creates idea)