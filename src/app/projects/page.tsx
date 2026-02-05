'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Github, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Project } from '@/types/database';
import { EditProjectModal } from '@/components/edit-project-modal';
import { Button } from '@/components/ui/button'; // Need Button for the edit button
import { toast } from 'sonner';


export default function ProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      notFound();
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects.');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleProjectUpdated = () => {
    fetchProjects(); // Refresh projects list
    setShowEditModal(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading projects...</p>
      </div>
    );
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
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Modified for flex layout */}
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(project)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 capitalize">Status: {project.status}</p>
                                <div className="mt-4 flex gap-3">
                                    {project.github_url && (
                                        <Link href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                                            <Github className="w-4 h-4" />
                                            GitHub
                                        </Link>
                                    )}
                                    {project.live_url && (
                                        <Link href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                                            <ExternalLink className="w-4 h-4" />
                                            Live
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
}