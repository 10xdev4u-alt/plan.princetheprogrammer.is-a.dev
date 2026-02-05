'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Github, Edit, CheckCircle, Timer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Project, TimeLog } from '@/types/database'; // Import TimeLog
import { EditProjectModal } from '@/components/edit-project-modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogTimeModal } from '@/components/log-time-modal';
import { formatDistanceToNowStrict, differenceInMinutes } from 'date-fns'; // Import date-fns utilities


interface ProjectWithTime extends Project { // Extend Project type to include total time
  total_time_minutes: number;
}

export default function ProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<ProjectWithTime[]>([]); // Use extended type
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [loggingProject, setLoggingProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      notFound();
      return;
    }

    const { data: fetchedProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      toast.error('Failed to load projects.');
      setLoading(false);
      return;
    }

    const { data: timeLogs, error: timeLogsError } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', session.user.id);

    if (timeLogsError) {
        console.error('Error fetching time logs:', timeLogsError);
        toast.error('Failed to load time logs.');
        setLoading(false);
        return;
    }

    // Calculate total time for each project
    const projectsWithTime: ProjectWithTime[] = fetchedProjects.map(project => {
        let totalTimeMinutes = 0;
        const projectTimeLogs = timeLogs.filter(log => log.project_id === project.id);

        projectTimeLogs.forEach(log => {
            const start = new Date(log.start_time);
            const end = log.end_time ? new Date(log.end_time) : new Date(); // If ongoing, use current time

            if (start && end) {
                totalTimeMinutes += differenceInMinutes(end, start);
            }
        });

        return { ...project, total_time_minutes: totalTimeMinutes };
    });

    setProjects(projectsWithTime || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleLogTimeClick = (project: Project) => {
    setLoggingProject(project);
    setShowLogTimeModal(true);
  };

  const handleProjectUpdated = () => {
    fetchProjects(); // Refresh projects list
    setShowEditModal(false);
    setEditingProject(null);
  };

  const handleTimeLogged = () => {
    fetchProjects(); // Refresh projects list (to potentially update time summary)
    setShowLogTimeModal(false);
    setLoggingProject(null);
  };

  const handleShipProject = async (projectId: string) => {
    // Confirmation dialog could be added here
    const { error } = await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', projectId);

    if (error) {
      toast.error('Failed to ship project.');
      console.error('Ship project error:', error);
    } else {
      toast.success('Project shipped! 🎉');
      fetchProjects(); // Refresh list
      // TODO: Trigger celebration animation here! 🚀
    }
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
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    {project.status === 'active' && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleLogTimeClick(project)} className="text-blue-500 hover:text-blue-400">
                                                <Timer className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleShipProject(project.id)} className="text-green-500 hover:text-green-400">
                                                <CheckCircle className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(project)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 capitalize">Status: {project.status}</p>
                                {/* Display total time */}
                                {project.total_time_minutes > 0 && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        Total Time: {formatDistanceToNowStrict(0, { unit: 'minute', addSuffix: false, roundingMethod: 'ceil', locale: {
                                            formatDistance: (token, count) => {
                                                if (token === 'xMinutes') return `${count}min`;
                                                if (token === 'xHours') return `${count}h`;
                                                if (token === 'xDays') return `${count}d`;
                                                if (token === 'xMonths') return `${count}m`;
                                                if (token === 'xYears') return `${count}y`;
                                                return `${count}${token}`;
                                            }
                                        }} as any).replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
                                    </p>
                                )}
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
      {loggingProject && (
        <LogTimeModal
          project={loggingProject}
          open={showLogTimeModal}
          onClose={() => setShowLogTimeModal(false)}
          onTimeLogged={handleTimeLogged}
        />
      )}
    </div>
  );
}
