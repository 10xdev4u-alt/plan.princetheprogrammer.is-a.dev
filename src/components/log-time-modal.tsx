'use client'

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Project } from '@/types/database'; // Import Project type
import { formatISO } from 'date-fns'; // For consistent date formatting

interface LogTimeModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onTimeLogged: () => void;
}

export function LogTimeModal({ project, open, onClose, onTimeLogged }: LogTimeModalProps) {
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isOngoing, setIsOngoing] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Initialize start time to current time when modal opens
        if (open) {
            setStartTime(formatISO(new Date()));
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!startTime) {
            toast.error('Start time is required.');
            return;
        }

        // Validate dates if not ongoing
        if (!isOngoing && (!endTime || new Date(endTime) < new Date(startTime))) {
            toast.error('End time must be after start time.');
            return;
        }

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error('You must be logged in to log time.');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('time_logs')
            .insert({ 
                project_id: project.id,
                user_id: user.id,
                start_time: startTime,
                end_time: isOngoing ? null : endTime,
                description: description || null,
             });

        setLoading(false);

        if (error) {
            toast.error('Failed to log time.');
            console.error('Log time error:', error);
        } else {
            toast.success('Time logged! ⏱️');
            onTimeLogged(); // Trigger refresh of projects/time logs in parent component
            handleClose();
        }
    }

    const handleClose = () => {
        setDescription('');
        setStartTime('');
        setEndTime('');
        setIsOngoing(false);
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Log Time for: {project.name}</DialogTitle>
                    <DialogDescription>
                        Record your work on this project.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Textarea 
                        placeholder="What did you work on?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-slate-800 border-slate-600"
                        rows={3}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                        <Input 
                            type="datetime-local"
                            value={startTime.substring(0, 16)} // Format for datetime-local input
                            onChange={(e) => setStartTime(formatISO(new Date(e.target.value)))}
                            className="bg-slate-800 border-slate-600"
                        />
                    </div>
                    {!isOngoing && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                            <Input 
                                type="datetime-local"
                                value={endTime.substring(0, 16)} // Format for datetime-local input
                                onChange={(e) => setEndTime(formatISO(new Date(e.target.value)))}
                                className="bg-slate-800 border-slate-600"
                            />
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isOngoing"
                            checked={isOngoing}
                            onChange={(e) => setIsOngoing(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 rounded"
                        />
                        <label htmlFor="isOngoing" className="text-sm cursor-pointer">Ongoing task (no end time)</label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? 'Logging...' : 'Log Time'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
