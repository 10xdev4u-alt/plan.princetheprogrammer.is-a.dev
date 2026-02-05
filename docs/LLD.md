# Low-Level Design (LLD)

This document provides a detailed look at the database schema and frontend component structure of the **Plan** application.

## 1. Database Schema

The database is hosted on Supabase Postgres. All tables include a `user_id` and have Row Level Security (RLS) enabled to enforce data ownership.

### `ideas`
Stores the core idea entries.

| Column             | Type        | Constraints                                                                          | Description                                              |
| ------------------ | ----------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `id`               | `uuid`      | `PRIMARY KEY`, `default gen_random_uuid()`                                           | Unique identifier for the idea.                          |
| `title`            | `text`      | `NOT NULL`                                                                           | The name or title of the idea.                           |
| `description`      | `text`      | `default ''`                                                                         | A detailed description of the idea.                      |
| `category`         | `text`      | `CHECK (category IN (...))`                                                          | Category of the idea (e.g., tech, business).             |
| `status`           | `text`      | `CHECK (status IN (...))`                                                            | Current status of the idea (e.g., captured, building).   |
| `impact_score`     | `int`       | `CHECK (1-10)`                                                                       | User's rating of the potential impact.                   |
| `effort_score`     | `int`       | `CHECK (1-10)`                                                                       | User's rating of the required effort.                    |
| `excitement_score` | `int`       | `CHECK (1-10)`                                                                       | User's personal excitement level.                        |
| `priority_score`   | `float`     | `GENERATED ALWAYS AS ((impact * excitement) / effort)`                               | Auto-calculated priority score.                          |
| `user_id`          | `uuid`      | `REFERENCES auth.users`, `NOT NULL`                                                  | Foreign key linking to the owner.                        |
| `created_at`       | `timestamp` | `default now()`                                                                      | Timestamp of when the idea was created.                  |
| `updated_at`       | `timestamp` | `default now()`                                                                      | Timestamp of the last update (managed by a trigger).     |

### Other Tables
-   **`milestones`**: For breaking down ideas into smaller steps.
-   **`projects`**: For tracking the execution of an idea that has been converted into a project.
-   **`profiles`**: Extends the `auth.users` table with public user information like username.
-   **`activity_log`**: An audit trail for key actions taken on ideas.

## 2. Frontend Component Structure

The frontend is built using Next.js (App Router) and React. Key components are organized as follows:

```
src
├── app/
│   ├── (main)/
│   │   ├── page.tsx          # Auth check, renders Dashboard or redirects to /login
│   │   └── layout.tsx        # Root layout with theme provider
│   ├── login/
│   │   └── page.tsx          # Login page with GitHub OAuth button
│   └── auth/callback/
│       └── route.ts        # Handles server-side OAuth callback
│
├── components/
│   ├── ui/                   # shadcn/ui components (Button, Card, etc.)
│   ├── theme-provider.tsx    # Manages dark/light mode
│   ├── dashboard.tsx         # Main stateful component for the dashboard
│   ├── idea-card.tsx         # Displays a single idea in a card format
│   └── create-idea-modal.tsx # Modal form for capturing a new idea
│
└── lib/
    └── supabase/
        ├── client.ts         # Supabase client for client-side (browser) use
        └── server.ts         # Supabase client for server-side (RSC, API routes) use
```

### Component Interaction

-   **`app/page.tsx`**: On load, it uses the `server` Supabase client to check for a session. If a session exists, it renders `<Dashboard>`. Otherwise, it redirects to `/login`.
-   **`login/page.tsx`**: Uses the `client` Supabase client to initiate the `signInWithOAuth` flow.
-   **`Dashboard`**:
    -   Manages the state for `ideas`, filters, and loading status.
    -   Fetches initial data using the `client` Supabase client.
    -   Subscribes to real-time `ideas` table changes to keep the UI in sync.
    -   Renders a grid of `<IdeaCard>` components.
    -   Controls the visibility of the `<CreateIdeaModal>`.
-   **`CreateIdeaModal`**:
    -   Contains a form with controlled inputs (`title`, `description`, etc.).
    -   On submit, it uses the `client` Supabase client to `insert` a new row into the `ideas` table.
    -   Calls callback props (`onCreated`, `onClose`) to communicate with the parent `Dashboard` component.
-   **`IdeaCard`**: A presentational component that receives an `idea` object as a prop and displays it.
