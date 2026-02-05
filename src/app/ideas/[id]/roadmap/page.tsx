import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Milestone } from '@/types/database';

interface IdeaRoadmapPageProps {
  params: {
    id: string;
  };
}

export default async function IdeaRoadmapPage({ params }: IdeaRoadmapPageProps) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    notFound(); // Redirect to login if not authenticated
  }

  // Placeholder to fetch milestones, will implement actual DND later
  const { data: milestones, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('idea_id', params.id)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    // Handle error appropriately
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href={`/ideas/${params.id}`} className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Idea Details
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Roadmap for Idea {params.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">Milestones will appear here in a Kanban board layout.</p>
            {milestones.length === 0 ? (
                <p className="text-slate-500 mt-4">No milestones yet. Time to plan!</p>
            ) : (
                <div className="mt-4">
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="p-2 border-b border-slate-700">
                            {milestone.title} - {milestone.status}
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
