'use client'

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea'; // Although not used now, might be useful for longer descriptions
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Project } from '@/types/database'; // Import Project type

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditProjectModal({ project, open, onClose, onUpdated }: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
    const [slug, setSlug] = useState(project.slug);
    const [githubUrl, setGithubUrl] = useState(project.github_url || '');
    const [liveUrl, setLiveUrl] = useState(project.live_url || '');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Use a temporary project status for the modal's internal state
    const [status, setStatus] = useState(project.status); 

    const handleSubmit = async () => {
        if (!name || !slug) {
            toast.error('Project name and slug are required.');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('projects')
            .update({ 
                name, 
                slug, 
                github_url: githubUrl || null, // Ensure empty strings become null
                live_url: liveUrl || null,     // Ensure empty strings become null
                status,
            })
            .eq('id', project.id);

        setLoading(false);

        if (error) {
            toast.error('Failed to update project.');
            console.error('Update project error:', error);
        } else {
            toast.success('Project updated! 🎉');
            onUpdated(); // Trigger refresh of projects in parent component
            handleClose();
        }
    }

    const handleClose = () => {
        // Reset state to current project values on close without saving
        setName(project.name);
        setSlug(project.slug);
        setGithubUrl(project.github_url || '');
        setLiveUrl(project.live_url || '');
        setStatus(project.status);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Edit Project: {project.name}</DialogTitle>
                    <DialogDescription>
                        Update details for your project.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input 
                        placeholder="Project Name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    <Input 
                        placeholder="Project Slug (URL-friendly identifier)"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    <Input 
                        placeholder="GitHub URL (e.g., https://github.com/user/repo)"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    <Input 
                        placeholder="Live URL (e.g., https://app.example.com)"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    {/* Project Status Dropdown */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Project['status'])}
                        className="block w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                    >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="abandoned">Abandoned</option>
                    </select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
