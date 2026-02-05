import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Idea } from '@/types/database';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IdeaDetailPageProps {
  params: {
    id: string;
  };
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    notFound(); // Or redirect to login, depending on desired behavior for unauthenticated access
  }

  const { data: idea, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !idea) {
    console.error('Error fetching idea:', error);
    notFound();
  }

  const priorityColor = (score: number | null) => {
    if (score === null) return 'bg-slate-600';
    if (score > 15) return 'bg-red-500';
    if (score > 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl font-bold text-white">{idea.title}</CardTitle>
              <Badge className={priorityColor(idea.priority_score)}>
                Priority: {idea.priority_score?.toFixed(2) ?? 'N/A'}
              </Badge>
            </div>
            <CardDescription className="text-slate-400 capitalize">
              {idea.category} • {idea.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Description:</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{idea.description || 'No description provided.'}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="font-semibold text-slate-400">Impact: </span>
                    <span className="text-white">{idea.impact_score ?? 'N/A'}</span>
                </div>
                <div>
                    <span className="font-semibold text-slate-400">Effort: </span>
                    <span className="text-white">{idea.effort_score ?? 'N/A'}</span>
                </div>
                <div>
                    <span className="font-semibold text-slate-400">Excitement: </span>
                    <span className="text-white">{idea.excitement_score ?? 'N/A'}</span>
                </div>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">
                Captured on {new Date(idea.created_at).toLocaleDateString()}
                {idea.updated_at && ` • Last updated on ${new Date(idea.updated_at).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
