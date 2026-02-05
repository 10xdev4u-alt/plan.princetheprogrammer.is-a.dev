'use client'

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CreateMilestoneModalProps {
  ideaId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateMilestoneModal({ ideaId, open, onClose, onCreated }: CreateMilestoneModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async () => {
        if (!title) {
            toast.error('Milestone title is required.');
            return;
        }

        setLoading(true);
        // The order_index for a new milestone can be simply the current count of milestones + 1
        // For a more robust solution, we'd query for the max order_index for this ideaId.
        // For now, let's keep it simple and rely on the database's default for order_index or let's pass a value.
        // The SQL schema has a default for order_index.

        const { error } = await supabase
            .from('milestones')
            .insert({ 
                title, 
                description, 
                idea_id: ideaId,
                status: 'pending', // New milestones start as pending
                order_index: 0, // Default to 0, can be refined later
             });

        setLoading(false);

        if (error) {
            toast.error('Failed to create milestone.');
            console.error('Create milestone error:', error);
        } else {
            toast.success('Milestone created! 🎉');
            onCreated(); // Trigger refresh of milestones in parent component
            handleClose();
        }
    }

    const handleClose = () => {
        setTitle('');
        setDescription('');
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Milestone</DialogTitle>
                    <DialogDescription>
                        Break down your idea into actionable steps.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input 
                        placeholder="Milestone Title (e.g., Build Auth System)" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                    />
                    <Textarea 
                        placeholder="Describe this milestone... What needs to be done?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                        rows={3}
                    />
                    {/* Date picker for due_date could be added here later */}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? 'Adding...' : 'Add Milestone'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
