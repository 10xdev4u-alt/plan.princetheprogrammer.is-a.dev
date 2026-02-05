import { User } from '@supabase/supabase-js'

export function Dashboard({ user }: { user: User }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
      <p className="text-sm text-slate-500 mt-4">More to come soon, bro! 🔥</p>
    </div>
  )
}
