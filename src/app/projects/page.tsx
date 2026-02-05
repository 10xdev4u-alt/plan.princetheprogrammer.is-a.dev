import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Project } from '@/types/database';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    notFound(); // Redirect to login if not authenticated
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    // Handle error appropriately
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Link>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
                <p className="text-slate-500 mt-4">No projects yet. Convert an idea to a project to get started!</p>
            ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Card key={project.id} className="bg-slate-700/50 border-slate-600">
                            <CardHeader>
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 capitalize">Status: {project.status}</p>
                                <div className="mt-4 flex gap-2">
                                    {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">GitHub</a>}
                                    {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">Live URL</a>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
