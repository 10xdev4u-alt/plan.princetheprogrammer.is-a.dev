'use client'

import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CreateIdeaModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  defaultDescription?: string // New prop
}

export function CreateIdeaModal({ open, onClose, onCreated, defaultDescription = '' }: CreateIdeaModalProps) { // Default value for new prop
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(defaultDescription); // Initialize with defaultDescription
    const [category, setCategory] = useState<'tech' | 'business' | 'content' | 'life' | 'random'>('tech');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Update description state if defaultDescription changes (e.g., when modal is reused)
        if (open) { // Only update when modal opens or defaultDescription changes while open
          setDescription(defaultDescription);
        }
    }, [defaultDescription, open]); // Depend on defaultDescription and open

    const handleSubmit = async () => {
        if (!title) {
            toast.error('Title is required.');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error('You must be logged in to create an idea.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('ideas')
            .insert({ 
                title, 
                description, 
                category, 
                user_id: user.id,
                // Default scores - user will edit these later
                impact_score: 5,
                effort_score: 5,
                excitement_score: 5,
             });

        setLoading(false);

        if (error) {
            toast.error('Failed to create idea.');
            console.error('Create idea error:', error);
        } else {
            toast.success('Idea captured! 🚀');
            onCreated(); // Trigger refresh of ideas in parent component
            handleClose();
        }
    }

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setCategory('tech');
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Capture New Idea</DialogTitle>
                    <DialogDescription>
                        Don't let it slip away. Jot it down now.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input 
                        placeholder="Idea Title (e.g., AI-powered rubber duck)" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    <Textarea 
                        placeholder="Describe your idea... What problem does it solve? Who is it for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                        rows={5}
                    />
                    <Select onValueChange={(value: any) => setCategory(value)} defaultValue="tech">
                        <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="content">Content</SelectItem>
                            <SelectItem value="life">Life</SelectItem>
                            <SelectItem value="random">Random</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? 'Capturing...' : 'Capture Idea'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}