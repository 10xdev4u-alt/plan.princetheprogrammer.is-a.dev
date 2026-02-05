'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Milestone } from '@/types/database';
import { toast } from 'sonner';

import { DndContext, DragOverlay, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'; // Added verticalListSortingStrategy
import { KanbanColumn } from '@/components/kanban-column';
import { DraggableMilestoneCard } from '@/components/draggable-milestone-card'; // New import

interface IdeaRoadmapPageProps {
  params: {
    id: string;
  };
}

export default function IdeaRoadmapPage({ params }: IdeaRoadmapPageProps) {
  const supabase = createClient();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Optionally, redirect or show an error message
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

  const handleDragStart = (event: any) => {
    console.log('Drag started', event);
  };

  const handleDragEnd = (event: any) => {
    console.log('Drag ended', event);
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

  // If no milestones and not loading, we assume the idea might be invalid or there are no milestones yet.
  // For now, if no milestones, we just show an empty state. If idea_id is invalid, Supabase query would error.
  // This check is now integrated into the column rendering.

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
              <CardTitle className="text-3xl font-bold text-white">Roadmap for Idea {params.id}</CardTitle>
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
    </DndContext>
  );
}