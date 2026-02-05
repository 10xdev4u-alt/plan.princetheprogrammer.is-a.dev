// types/database.ts

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'business' | 'content' | 'life' | 'random';
  status: 'captured' | 'validating' | 'validated' | 'planning' | 'building' | 'shipped' | 'archived';
  impact_score: number | null;
  effort_score: number | null;
  excitement_score: number | null;
  priority_score: number | null;
  tags: string[];
  mood: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  idea_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  due_date: string | null;
  order_index: number;
  created_at: string;
};

export type Project = {
    id: string;
    idea_id: string;
    name: string;
    slug: string;
    github_url: string | null; // Explicitly nullable for GitHub integration
    live_url: string | null;   // Explicitly nullable for Live URL tracking
    status: 'active' | 'paused' | 'completed' | 'abandoned';
    user_id: string;
    created_at: string;
}

export type Profile = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
}

export type ActivityLog = {
    id: string;
    user_id: string;
    idea_id: string;
    action: string;
    metadata: any; // jsonb can be tricky, 'any' is a safe bet for now
    created_at: string;
}

export type TimeLog = {
    id: string;
    project_id: string;
    user_id: string;
    start_time: string; // ISO string
    end_time: string | null; // ISO string, nullable
    description: string | null;
    created_at: string;
    updated_at: string;
}