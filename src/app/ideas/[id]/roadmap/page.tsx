'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus } from 'lucide-react'; // Added Plus icon
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Milestone } from '@/types/database';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'; // Added Button import

import { DndContext, DragOverlay, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/kanban-column';
import { DraggableMilestoneCard } from '@/components/draggable-milestone-card';
import { CreateMilestoneModal } from '@/components/create-milestone-modal'; // New import for modal

interface IdeaRoadmapPageProps {
  params: {
    id: string;
  };
}

export default function IdeaRoadmapPage({ params }: IdeaRoadmapPageProps) {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false); // State for modal visibility

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('idea_id', params.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestones.');
    } else {
      setMilestones(data || []);
    }
    setLoading(false);
  }, [params.id, supabase]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const sensors = useSensors(
    useSensors(
      PointerSensor,
    )
  );

  const updateMilestoneInDB = useCallback(async (milestoneId: string, updates: { status?: string; order_index?: number }) => {
    const { error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId);

    if (error) {
      toast.error('Failed to update milestone.');
      console.error('Update milestone error:', error);
      fetchMilestones(); // Re-fetch to revert optimistic update if error
      return false;
    }
    toast.success('Milestone updated! 🎉');
    return true;
  }, [supabase, fetchMilestones]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!active || !over) return;

    const activeMilestoneId = active.id;
    const newStatusId = over.id as Milestone['status']; // The column ID is the new status

    // Find the milestone being dragged
    const draggedMilestone = milestones.find(m => m.id === activeMilestoneId);
    if (!draggedMilestone) return;

    // If status hasn't changed, no need to update
    if (draggedMilestone.status === newStatusId) return;

    // Optimistically update UI
    setMilestones(prevMilestones => {
      return prevMilestones.map(m =>
        m.id === draggedMilestone.id ? { ...m, status: newStatusId } : m
      );
    });

    // Persist to DB
    await updateMilestoneInDB(activeMilestoneId, { status: newStatusId });
  };

  const milestoneStatuses = [
    { id: 'pending', title: 'Pending' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
    { id: 'blocked', title: 'Blocked' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading roadmap...</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link href={`/ideas/${params.id}`} className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Idea Details
          </Link>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center"> {/* Changed items-start to items-center */}
                <CardTitle className="text-3xl font-bold text-white">Roadmap for Idea {params.id}</CardTitle>
                <Button 
                  onClick={() => setShowCreateModal(true)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 overflow-x-auto py-4">
                {milestoneStatuses.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    milestones={milestones.filter(m => m.status === column.id)}
                  >
                    {/* Draggable Milestone cards will go here */}
                    {milestones
                      .filter(m => m.status === column.id)
                      .map(milestone => (
                        <DraggableMilestoneCard key={milestone.id} milestone={milestone} />
                      ))
                    }
                  </KanbanColumn>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DragOverlay>{/* We'll render the draggable item here later */}</DragOverlay>
      <CreateMilestoneModal // New modal component
        ideaId={params.id}
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchMilestones}
      />
    </DndContext>
  );
}
